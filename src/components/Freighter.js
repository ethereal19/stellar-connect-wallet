import { signTransaction, setAllowed, getAddress } from "@stellar/freighter-api";
import {
  TransactionBuilder,
  Operation,
  Asset,
  Horizon,
  BASE_FEE
} from '@stellar/stellar-sdk';

const server = new Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

const checkConnection = async () => {
  return await setAllowed();
};

const retrievePublicKey = async () => {
  const { address } = await getAddress();
  return address;
};

const getBalance = async () => {
  await setAllowed();
  const { address } = await getAddress();
  const account = await server.loadAccount(address);
  const xlm = account.balances.find((b) => b.asset_type === "native");
  return xlm?.balance || "0";
};

const userSignTransaction = async (xdr, signwith) => {
  const result = await signTransaction(xdr, {
    network: "TESTNET",
    networkPassphrase: "Test SDF Network ; September 2015",
    accountToSign: signwith,
  });
  
  // Freighter v6+ returns an object with signedTxXdr
  return typeof result === 'string' ? result : result.signedTxXdr;
};

const sendXLM = async (destination, amount) => {
  try {
    const { address: sender } = await getAddress();
    const account = await server.loadAccount(sender);

    // Check if destination exists
    let destinationExists = false;
    try {
      await server.loadAccount(destination);
      destinationExists = true;
    } catch (e) {
      destinationExists = false;
    }

    const transactionBuilder = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: "Test SDF Network ; September 2015",
    });

    if (destinationExists) {
      transactionBuilder.addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount: amount.toString(),
        })
      );
    } else {
      transactionBuilder.addOperation(
        Operation.createAccount({
          destination,
          startingBalance: amount.toString(),
        })
      );
    }

    const transaction = transactionBuilder
      .setTimeout(30)
      .build();

    // Sign with Freighter
    const xdr = transaction.toXDR();
    const signedXdr = await userSignTransaction(xdr, sender);

    // Convert signed XDR → Transaction
    const signedTx = TransactionBuilder.fromXDR(
      signedXdr,
      "Test SDF Network ; September 2015"
    );

    // Submit
    const result = await server.submitTransaction(signedTx);

    return result;

  } catch (error) {
    console.error("Payment failed", error);
    throw error;
  }
};

export {
  checkConnection,
  retrievePublicKey,
  getBalance,
  userSignTransaction,
  sendXLM,
};
