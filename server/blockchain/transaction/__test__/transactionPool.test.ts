import Wallet from "../../wallet/wallet";
import Transaction from "../transaction";
import TxIn from "../transactionInput";
import TxOut from "../transactionOutput";
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
    let txpool_temp: Transaction[];
    beforeAll(()=>{
      receiverAddress = Wallet.generatePrivatePublicKeys().publicKey;
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

      let txIn1 = TxIn.createUnSignedTxIn(utxoListToBeUsed[1]);
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
        result = TransactionPool.addTxToTxpool(newTx, utxoListToBeUsed, txpool);
      }
      txpool_temp = txpool;
    })

    afterEach(()=> {
      txpool = txpool_temp
    })

    test("Adding tx into txPool has done successfully?", () => {
      expect(result).toBe(true);
    })

    test("Check if newTx is in txpool", () => {
      if (newTx === null) {
        return;
      }

      const isNewTxInTxpool = TransactionPool.doesTxpoolContainTx(newTx, txpool);
      expect(isNewTxInTxpool).toBe(true);
    })
    
    test("The last transaction of txpool must be same with new transaction", () => {
      const lastTx = txpool[txpool.length-1];
      expect(lastTx.id).toBe(newTx?.id)
      expect(lastTx.txOuts[0].address).toBe(receiverAddress);
      expect(Transaction.isValidTx(lastTx, utxoListToBeUsed)).toBe(true);
    })

    test("Remove invalid transactions from transaction pool", () => {
      const txpoolLength: number = txpool.length;
      const invalidTx = new Transaction("", [], []);
      txpool.push(invalidTx);

      txpool = TransactionPool.removeInvalidTxsFromTxpool(utxoListToBeUsed, txpool);
      const txpoolLengthAfterRemoving: number = txpool.length;
      expect(txpoolLengthAfterRemoving).toBe(txpoolLength);
    })
  })
})