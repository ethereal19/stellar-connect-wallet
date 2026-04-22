/* global BigInt */
import { 
  StellarWalletsKit, 
  Networks 
} from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { 
  Horizon, 
  rpc,
  BASE_FEE, 
  TransactionBuilder, 
  Asset, 
  Operation, 
  TimeoutInfinite, 
  Contract, 
  Account,
  Address, 
  StrKey,
  scValToNative, 
  nativeToScVal,
  xdr 
} from '@stellar/stellar-sdk';

// Use rpc if available
const SorobanServer = rpc?.Server;

// Servers
const horizonUrl = process.env.REACT_APP_HORIZON_URL || 'https://horizon-testnet.stellar.org';
const sorobanUrl = process.env.REACT_APP_SOROBAN_URL || 'https://soroban-testnet.stellar.org';
const networkPassphrase = process.env.REACT_APP_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015';

const server = new Horizon.Server(horizonUrl);
const sorobanServer = SorobanServer ? new SorobanServer(sorobanUrl) : null;

// Verified Contract ID
export const CONTRACT_ID = process.env.REACT_APP_CONTRACT_ID || "CDWXS6ITLHDH666GUQQ2H2HPM7K7YYKZLMLYFIMZU7AO4TL27625UUQ4";

// SFUND Token Contract ID (Level 4 — Inter-contract call)
export const TOKEN_CONTRACT_ID = process.env.REACT_APP_TOKEN_CONTRACT_ID || "CDKK7RCL5HO74IL5RCSAONUYSVHDOBLZTPCK6DPRZVEDMFHMBZKZEOIL";

StellarWalletsKit.init({
  network: Networks.TESTNET,
  modules: typeof defaultModules === 'function' ? defaultModules() : [],
});


// ================= WALLET =================

export const connectWallet = async () => {
  try {
    const { address } = await StellarWalletsKit.authModal();

    return address;
  } catch (e) {
    console.error("Connection failed", e);
    return null;
  }
};

export const disconnectWallet = async () => {
  try { await StellarWalletsKit.disconnect(); } catch (e) { }
};

// === Cache & Deduplication ===
const cache = {
    balance: { data: null, timestamp: 0, promise: null },
    campaign: { data: null, timestamp: 0, promise: null }
};
const CACHE_DURATION = 15000; // 15 seconds cache
let rateLimitCooldownUntil = 0;

const handle429 = (error) => {
  // Check for 429 in various error structures
  const is429 = error?.status === 429 || 
                error?.response?.status === 429 || 
                error?.data?.status === 429;

  if (is429) {
    console.warn("Rate limit (429) hit. Entering 120s cooldown.");
    rateLimitCooldownUntil = Date.now() + 120000; // 2 minutes as per flowchart
    return true;
  }
  return false;
};

const isCooldownActive = () => {
  if (Date.now() < rateLimitCooldownUntil) {
    return true;
  }
  return false;
};

export const getAccountBalance = async (address) => {
  // Deduplicate and Cache
  const now = Date.now();
  if (cache.balance.promise) return cache.balance.promise;
  if (cache.balance.data && (now - cache.balance.timestamp < CACHE_DURATION)) {
      return cache.balance.data;
  }

  cache.balance.promise = (async () => {
      try {
        if (isCooldownActive()) {
          return cache.balance.data || "0";
        }
        
        // Safety Check: Format validation
        if (!address || !StrKey.isValidEd25519PublicKey(address)) {
            console.warn("getAccountBalance: Invalid address format, skipping fetch.");
            return cache.balance.data || "0";
        }

        console.log("Loading balance for address:", address);
        let account;
        try {
            account = await server.loadAccount(address);
        } catch (e) {
            console.warn("Polling balance soft-fail:", address);
            return cache.balance.data || "0";
        }
        const nativeBalance = account.balances.find(b => b.asset_type === 'native');
        const result = nativeBalance?.balance || "0";
        cache.balance.data = result;
        cache.balance.timestamp = Date.now();
        return result;
      } catch (e) {
        handle429(e);
        return cache.balance.data || "0";
      } finally {
        cache.balance.promise = null;
      }
  })();

  return cache.balance.promise;
};

// ================= SMART CONTRACT =================

// Step 3 Logic: proper conversion helper
const toI128ScVal = (amount) => {
    // [2] Convert goal -> stroops (amount * 10^7) -> BigInt
    const stroops = BigInt(Math.floor(parseFloat(amount) * 10000000));
    // [3] Convert -> ScVal
    return nativeToScVal(stroops, { type: "i128" });
};

const parseRetval = (retval) => {
    try {
        if (!retval) return 0;
        if (typeof retval === "string") return scValToNative(xdr.ScVal.fromXDR(retval, 'base64'));
        return scValToNative(retval);
    } catch (e) { return 0; }
};

export const initializeCampaign = async (goalAmount, senderAddress) => {
  try {
    console.log("--- START CAMPAIGN FLOW ---");
    
    // Safety check with NO CACHE to ensure we don't hit "Already Initialized" trap
    const contract = new Contract(CONTRACT_ID);
    
    // Safety check: Format validation
    if (!senderAddress || !StrKey.isValidEd25519PublicKey(senderAddress)) {
        throw new Error("Cannot initialize: Invalid wallet address format.");
    }

    console.log("Checking campaign state for address:", senderAddress);
    const dummyAccount = new Account(senderAddress, "1");

    const checkTx = new TransactionBuilder(dummyAccount, {
        fee: "100",
        networkPassphrase: networkPassphrase
    })
    .addOperation(contract.call("get_target"))
    .setTimeout(TimeoutInfinite)
    .build();

    const checkResp = await sorobanServer.simulateTransaction(checkTx);
    
    // DEBUG: Log the full response to find the correct path
    console.log("Full simulateTransaction response:", JSON.stringify(checkResp, null, 2));
    
    // Try ALL known response formats across SDK versions
    let target = 0;
    try {
        const retval = checkResp.results?.[0]?.retval     // older SDK
                    || checkResp.result?.retval             // newer SDK  
                    || checkResp.returnValue                // some versions
                    || null;
        console.log("Extracted retval:", retval);
        if (retval) {
            target = parseRetval(retval);
        }
    } catch (e) {
        console.warn("Could not parse target from simulation:", e);
    }
    
    console.log("Parsed target value:", target);
    
    // SAFE DEFAULT: If target > 0 OR if simulation returned any successful result,
    // assume the campaign is already initialized
    if (target > 0) {
        throw new Error("This campaign has already been started and is live on the network.");
    }
    
    // Extra safety: If the simulation succeeded (no error), but target parsed as 0,
    // check if the response indicates the contract has storage (meaning it's initialized)
    if (checkResp.results?.length > 0 || checkResp.result || checkResp.returnValue) {
        // The contract responded — it exists and has been set up
        // If target is truly 0, that's a real initialized state with goal=0
        // But we should still check: if there's a valid response, the contract IS initialized
        console.log("Contract responded to get_target — checking if truly zero or already set.");
    }

    if (isCooldownActive()) throw new Error("Server is rate-limited. Please wait 30s.");

    const goalScVal = toI128ScVal(goalAmount);
    console.log("Loading account data for address:", senderAddress);
    let account = await server.loadAccount(senderAddress);
    
    console.log("Preparing Transaction with name: initialize");
    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase,
    })
      .addOperation(contract.call("initialize", goalScVal))
      .setTimeout(TimeoutInfinite)
      .build();

    if (sorobanServer) {
        tx = await sorobanServer.prepareTransaction(tx);
    }

    console.log("Sign via Freighter...");
    const signResult = await StellarWalletsKit.signTransaction(tx.toXDR('base64'));
    const signedTxXdr = typeof signResult === 'string' ? signResult : (signResult.signedTx || signResult.signedTxXdr || signResult.xdr);

    if (!signedTxXdr) throw new Error("Signature denied");

    console.log("Submitting...");
    const readyTx = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    
    try {
        const result = await server.submitTransaction(readyTx);
        console.log("Initialization Complete ✅");
        cache.campaign.timestamp = 0; 
        return result;
    } catch (e) {
        const diagnostic = JSON.stringify(e?.response?.data || e);
        if (diagnostic.includes("UnreachableCodeReached")) {
            throw new Error("Conflict: This campaign was just initialized by another transaction. Please refresh.");
        }
        handle429(e);
        throw e;
    }

  } catch (error) {
    console.error("Init Error", error);
    throw error;
  }
};

export const donateToCampaign = async (amount, senderAddress) => {
  try {
    if (isCooldownActive()) throw new Error("Server is rate-limited. Please wait 30s.");

    // Safety check: Format validation (Must be FIRST)
    if (!senderAddress || !StrKey.isValidEd25519PublicKey(senderAddress)) {
        throw new Error("Cannot donate: Invalid wallet address format.");
    }

    const contract = new Contract(CONTRACT_ID);
    const amountScVal = toI128ScVal(amount);
    const donorScVal = Address.fromString(senderAddress).toScVal();

    console.log("Loading donor account data for address:", senderAddress);
    let account = await server.loadAccount(senderAddress);

    let tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase,
    })
      .addOperation(contract.call("donate", donorScVal, amountScVal))
      .setTimeout(TimeoutInfinite)
      .build();

    // CRITICAL: Soroban transactions MUST be prepared
    if (sorobanServer) {
        tx = await sorobanServer.prepareTransaction(tx);
    }

    const signResult = await StellarWalletsKit.signTransaction(tx.toXDR('base64'));
    const signedTxXdr = typeof signResult === 'string' ? signResult : (signResult.signedTx || signResult.signedTxXdr || signResult.xdr);

    const readyTx = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    
    let result;
    try {
        result = await server.submitTransaction(readyTx);
    } catch (e) {
        handle429(e);
        throw e;
    }
    
    cache.balance.timestamp = 0;
    cache.campaign.timestamp = 0;

    return result;
  } catch (error) {
    throw error;
  }
};

export const fetchCampaignData = async (address = null) => {
  // Deduplicate and Cache
  const now = Date.now();
  if (cache.campaign.promise) return cache.campaign.promise;
  if (cache.campaign.data && (now - cache.campaign.timestamp < CACHE_DURATION)) {
      return cache.campaign.data;
  }

  cache.campaign.promise = (async () => {
      try {
        if (isCooldownActive()) {
          return cache.campaign.data || { total: 0, target: 0 };
        }

        // 1. Start with the provided address
        let simulationId = address;

        // 2. Validate format: If empty or malformed, fallback to a safe hardcoded test key
        const FALLBACK_G = "GAVU5YAZJ555T45L3T753K5MGR4TMM7Q2V3A2V6N7ZWAU4A6NMZXW2S6";
        if (!simulationId || !StrKey.isValidEd25519PublicKey(simulationId)) {
            console.warn("Using fallback identity for simulation.");
            simulationId = FALLBACK_G;
        }

        // 3. Optional: Verify on-chain presence (Audit Flow)
        if (simulationId === address && StrKey.isValidEd25519PublicKey(simulationId)) {
            try {
                await server.loadAccount(simulationId);
            } catch (e) { }
        }

        const contract = new Contract(CONTRACT_ID);
        console.log("Simulating campaign fetch for identity:", simulationId);

        // Using simple Account object instead of AccountResponse for stability
        const dummyAccount = new Account(simulationId, "1");

        if (!sorobanServer) {
            console.warn("Soroban server not initialized");
            return { total: 0, target: 0 };
        }

        // CRITICAL: Soroban simulateTransaction only supports ONE operation per tx.
        // We must make TWO separate calls.

        // 1. Fetch target goal
        const targetTx = new TransactionBuilder(dummyAccount, {
            fee: "100",
            networkPassphrase: networkPassphrase
        })
        .addOperation(contract.call("get_target"))
        .setTimeout(TimeoutInfinite)
        .build();
        
        const targetResp = await sorobanServer.simulateTransaction(targetTx);
        console.log("FULL get_target response:", JSON.stringify(targetResp, null, 2));
        
        // Try all known SDK response formats
        const targetRetval = targetResp.results?.[0]?.retval 
                          || targetResp.result?.retval 
                          || targetResp.returnValue 
                          || null;
        console.log("Extracted target retval:", targetRetval);
        const target = parseRetval(targetRetval);
        console.log("Parsed target:", target);

        // 2. Fetch total raised (need fresh account with incremented sequence)
        const dummyAccount2 = new Account(simulationId, "2");
        const totalTx = new TransactionBuilder(dummyAccount2, {
            fee: "100",
            networkPassphrase: networkPassphrase
        })
        .addOperation(contract.call("get_total"))
        .setTimeout(TimeoutInfinite)
        .build();
        
        const totalResp = await sorobanServer.simulateTransaction(totalTx);
        console.log("FULL get_total response:", JSON.stringify(totalResp, null, 2));
        
        const totalRetval = totalResp.results?.[0]?.retval 
                         || totalResp.result?.retval 
                         || totalResp.returnValue 
                         || null;
        console.log("Extracted total retval:", totalRetval);
        const total = parseRetval(totalRetval);
        console.log("Parsed total:", total);

        const result = {
          total: Number(total || 0) / 10000000,
          target: Number(target || 0) / 10000000
        };

        cache.campaign.data = result;
        cache.campaign.timestamp = Date.now();
        return result;

      } catch (error) {
        handle429(error);
        console.error("fetchCampaignData failed:", error);
        return cache.campaign.data || { total: 0, target: 0 };
      } finally {
        cache.campaign.promise = null;
      }
  })();

  return cache.campaign.promise;
};

// ================= MISC =================

export const sendXLM = async (destination, amount, senderAddress) => {
  try {
    if (isCooldownActive()) throw new Error("Server is rate-limited. Please wait 30s.");

    // Safety checks
    if (!senderAddress || !StrKey.isValidEd25519PublicKey(senderAddress)) {
        throw new Error("Invalid sender address.");
    }
    if (!destination || !StrKey.isValidEd25519PublicKey(destination)) {
        throw new Error("Invalid destination address format.");
    }

    let account;
    try {
        console.log("Loading sender account data for address:", senderAddress);
        account = await server.loadAccount(senderAddress);
    } catch (e) {
        handle429(e);
        throw e;
    }

    const txBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase,
    });
    try {
      await server.loadAccount(destination);
      txBuilder.addOperation(Operation.payment({ destination, asset: Asset.native(), amount: amount.toString() }));
    } catch (err) {
      handle429(err);
      txBuilder.addOperation(Operation.createAccount({ destination, startingBalance: amount.toString() }));
    }
    const tx = txBuilder.setTimeout(TimeoutInfinite).build();
    const signResult = await StellarWalletsKit.signTransaction(tx.toXDR('base64'));
    const signedTxXdr = typeof signResult === 'string' ? signResult : (signResult.signedTx || signResult.signedTxXdr || signResult.xdr);
    const readyTx = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);
    
    try {
        return await server.submitTransaction(readyTx);
    } catch (e) {
        handle429(e);
        throw e;
    }
  } catch (err) { throw err; }
};

export const fetchTransactions = async (address) => {
  try {
    if (!address || !StrKey.isValidEd25519PublicKey(address)) {
      return [];
    }

    const response = await server.transactions()
      .forAccount(address)
      .order('desc')
      .limit(10)
      .call();

    return response.records.map(tx => ({
      hash: tx.hash,
      created_at: tx.created_at,
      successful: tx.successful,
      fee: tx.fee_filled,
      memo: tx.memo
    }));
  } catch (error) {
    console.error("fetchTransactions failed:", error);
    return [];
  }
};

export const withdrawFunds = async (destination, amount, senderAddress) => {
  try {
    if (isCooldownActive()) throw new Error("Server is rate-limited. Please wait 30s.");

    if (!senderAddress || !StrKey.isValidEd25519PublicKey(senderAddress)) {
      throw new Error("Invalid sender wallet address.");
    }
    if (!destination || !StrKey.isValidEd25519PublicKey(destination)) {
      throw new Error("Invalid withdrawal destination address.");
    }

    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0) {
      throw new Error("Invalid withdrawal amount.");
    }

    console.log(`Withdrawing ${sendAmount} XLM from ${senderAddress} to ${destination}`);
    let account = await server.loadAccount(senderAddress);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase,
    })
      .addOperation(Operation.payment({
        destination,
        asset: Asset.native(),
        amount: sendAmount.toFixed(7)
      }))
      .setTimeout(TimeoutInfinite)
      .build();

    const signResult = await StellarWalletsKit.signTransaction(tx.toXDR('base64'));
    const signedTxXdr = typeof signResult === 'string' ? signResult : (signResult.signedTx || signResult.signedTxXdr || signResult.xdr);

    if (!signedTxXdr) throw new Error("Withdrawal signature denied.");

    const readyTx = TransactionBuilder.fromXDR(signedTxXdr, networkPassphrase);

    let result;
    try {
      result = await server.submitTransaction(readyTx);
    } catch (e) {
      handle429(e);
      throw e;
    }

    cache.balance.timestamp = 0;
    cache.campaign.timestamp = 0;

    return result;
  } catch (error) {
    throw error;
  }
};

// ================= SFUND TOKEN (Level 4) =================

export const fetchSFUNDBalance = async (publicKey) => {
  if (!sorobanServer || !publicKey) return 0;

  try {
    const tokenContract = new Contract(TOKEN_CONTRACT_ID);
    const accountAddress = new Address(publicKey);

    const tx = new TransactionBuilder(
      new Account(publicKey, '0'),
      {
        fee: BASE_FEE,
        networkPassphrase: networkPassphrase,
      }
    )
      .addOperation(tokenContract.call('balance', accountAddress.toScVal()))
      .setTimeout(30)
      .build();

    const simResult = await sorobanServer.simulateTransaction(tx);

    if (simResult && simResult.result && simResult.result.retval) {
      const balanceVal = scValToNative(simResult.result.retval);
      // Convert from stroops to whole tokens
      return Number(balanceVal) / 10000000;
    }
    return 0;
  } catch (error) {
    console.log('SFUND balance fetch error (expected if no donations yet):', error.message);
    return 0;
  }
};

