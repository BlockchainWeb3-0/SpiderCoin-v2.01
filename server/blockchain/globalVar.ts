import { Blockchain } from "./structure/blockchain";
import Transaction from "./transaction/transaction";
import TransactionPool from "./transaction/transactionPool";
import UnspentTxOutput from "./transaction/unspentTxOutput";

export default class GlobalVar {

  static txpool = new TransactionPool();
  static utxoList: UnspentTxOutput[] = [];
  static blockchain: Blockchain = new Blockchain();
  static array1: any[] = ["test"]
}