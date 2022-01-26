import { Transaction, TxIn, TxOut } from "../transaction"
import UnspentTxOutput from "../unspentTxOutput";

describe("transaction class", () => {
  let tx: Transaction;
  let txIn1: TxIn;
  let txIn2: TxIn;
  let txOut1: TxOut;
  let txOut2: TxOut;
  let utxo1: UnspentTxOutput;
  let utxo2: UnspentTxOutput;
  beforeEach(()=>{
    utxo1 = new UnspentTxOutput("utxo1", 1, "myaddress", 50)
    utxo2 = new UnspentTxOutput("utxo2", 1, "myaddress", 30)
    txIn1.txOutId = "utxo1";
    txIn1.txOutIndex = 0;
    txIn2.txOutId = "utxo2";
    txIn2.txOutIndex = 1;
    txOut1.address = "reciever";
    txOut1.amount = 70;
    txOut2.address = "myaddress";
    txOut2.amount = 10;
    tx.txIns = [txIn1, txIn2];
    tx.txOuts = [txOut1, txOut2];
    tx.id = Transaction.calTxId(tx);
  })

  test("test", () => {
    
  })
})