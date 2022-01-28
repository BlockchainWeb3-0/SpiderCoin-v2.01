import Wallet from "../../wallet/wallet";
import { Transaction, TxIn, TxOut } from "../transaction"
import UnspentTxOutput from "../unspentTxOutput";

describe("transaction test", () => {
  describe("createTransaction function test", () => {
    let receiverAddress: string;
    let sendingAmount: number;
    let sendingAddress: string;
    let privateKey: string;
    let utxoListToBeUsed: UnspentTxOutput[] = [];
    let txpool: Transaction[] = [];
    let newTx: Transaction | null;
    beforeAll(()=>{
      receiverAddress = "04d2d156b54c47d0ad7acca55ad5e484eb0191a6d783e7473037d4d9f4af66455ee937826090e71dbbacc0a7e7540d2850f92812bce1f87180cac3900541794274";
      sendingAmount = 20;
      sendingAddress =Wallet.getPulicKeyFromWallet();
      privateKey = Wallet.getPrivateKeyFromWallet();
      
      for (let i = 0; i < 5; i++) {
        const utxo = new UnspentTxOutput(
					`id${i}`,
					i,
					Wallet.getPulicKeyFromWallet(),
					10
				);
        utxoListToBeUsed.push(utxo);
      }

      let txIn1 = new TxIn("id1", 1, "");
      const txOuts1 = TxOut.createTxOuts(receiverAddress, 10, Wallet.getPulicKeyFromWallet(), 0);
      const tx1 = new Transaction("", [txIn1], txOuts1)
      tx1.id = Transaction.calTxId(tx1)
      txIn1 = TxIn.signToTxIn(txIn1, Wallet.getPrivateKeyFromWallet(), tx1.id)
      tx1.txIns = [txIn1]
      txpool.push(tx1);

      newTx = Transaction.createTransaction(
				receiverAddress,
				sendingAmount,
        sendingAddress,
				privateKey,
				utxoListToBeUsed,
				txpool
			);
    })
    test("Is created transaction valid? ", () => {
      if (newTx !== null) {
        expect(Transaction.isValidTx(newTx, utxoListToBeUsed)).toBe(true);
      }
    })
    test("If sending amount is 20, newTx has two txIn", () => {
      sendingAmount = 20;
      if (newTx !== null) {
        expect(newTx.txIns.length).toBe(2);
        expect(TxIn.getTxInsTotalAmount(newTx.txIns, utxoListToBeUsed)).toBe(20);
      }
    })
    test("If sending amount is 35, newTx has four txIn", () => {
      sendingAmount = 35;
      newTx = Transaction.createTransaction(
				receiverAddress,
				sendingAmount,
        sendingAddress,
				privateKey,
				utxoListToBeUsed,
				txpool
			);
      if (newTx !== null) {
        expect(newTx.txIns.length).toBe(4);
        expect(TxIn.getTxInsTotalAmount(newTx.txIns, utxoListToBeUsed)).toBe(40);
      }
    })
    test("If sending amount is 100, cannot create transaction and newTx should be null", () => {
      sendingAmount = 100;
      newTx = Transaction.createTransaction(
				receiverAddress,
				sendingAmount,
        sendingAddress,
				privateKey,
				utxoListToBeUsed,
				txpool
			);
      expect(newTx).toBeNull();
    })
  })

})