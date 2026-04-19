const { Horizon, Contract, TransactionBuilder, TimeoutInfinite, scValToNative, xdr, Keypair, Account } = require('@stellar/stellar-sdk');

async function checkContract() {
    const server = new Horizon.Server('https://horizon-testnet.stellar.org');
    const contractId = "CDCCIQ2KVLRFU5GEXGGHTFE5ICCRUZ77H2SFFBNCYFKNCSMGGPQYPLUH";
    const contract = new Contract(contractId);

    // Use a simple Account object
    const kp = Keypair.random();
    const mockAccount = new Account(kp.publicKey(), "1");

    console.log(`Checking Contract: ${contractId}`);

    const methods = ["get_target", "get_total"];

    for (const method of methods) {
        try {
            const tx = new TransactionBuilder(mockAccount, {
                fee: "100",
                networkPassphrase: "Test SDF Network ; September 2015"
            })
            .addOperation(contract.call(method))
            .setTimeout(TimeoutInfinite)
            .build();
            
            const resp = await server.simulateTransaction(tx);
            console.log(`\nMethod: ${method}`);

            const retval = resp.result?.retval || resp.results?.[0]?.retval;
            if (retval) {
                console.log(`Retval found.`);
                try {
                    const parsed = scValToNative(xdr.ScVal.fromXDR(retval, 'base64'));
                    console.log("Parsed (Native):", parsed);
                } catch (e) {
                    try {
                        console.log("Parsed (Native Direct):", scValToNative(retval));
                    } catch (e2) {
                        console.log("Raw Retval:", retval);
                    }
                }
            } else {
                console.log("No retval found.");
                if (resp.error) console.log("Error:", resp.error);
            }
        } catch (e) {
            console.log(`Method ${method} failed:`, e.message);
        }
    }
}

checkContract();
