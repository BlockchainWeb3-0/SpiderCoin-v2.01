import Wallet from "../../wallet/wallet";
import { Transaction, TxIn, TxOut } from "../transaction"
import TransactionPool from "../transactionPool";
import UnspentTxOutput from "../unspentTxOutput";

describe("transactionPool test", () => {
  describe("add txpool test", () => {
    let receiverAddress: string;
    let sendingAmount: number;
    let sendingAddress: string;
    let privateKey: string;
    let utxoListToBeUsed: UnspentTxOutput[] = [];
    let txpool: Transaction[] = [];
    let newTx: Transaction | null;
    let result: boolean;
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

      newTx = Transaction.createTx(
				receiverAddress,
				sendingAmount,
        sendingAddress,
				privateKey,
				utxoListToBeUsed,
				txpool
      );

      if (newTx === null) {
        result = false;
      } else {
        result = TransactionPool.addTxPool(newTx, utxoListToBeUsed, txpool);
      }
    })
    test("Adding tx into txPool has done successfully?", () => {
      expect(result).toBe(true);
    })

    test("Check if newTx is in txpool", () => {
      if (newTx === null) {
        return;
      }

      const isNewTxInTxpool = TransactionPool.doesTxpoolContainTx(newTx, txpool);
      expect(result).toBe(true);
    })
    
    test("The last transaction of txpool should be same with new transaction", () => {
      const lastTx = txpool[txpool.length-1];
      expect(lastTx.id).toBe(newTx?.id)
      expect(lastTx.txOuts[0].address).toBe(receiverAddress);
    })
    
    test("If new transaction is corrupted, return false", () => {
      txpool[txpool.length-1].id = "corrupted id";
      const lastTx = txpool[txpool.length-1];
      
      expect(Transaction.isValidTx(lastTx, utxoListToBeUsed)).toBe(false);
    })
  })

})