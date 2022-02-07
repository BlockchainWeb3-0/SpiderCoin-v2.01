import { Block } from "./structure/block";
import Blockchain from "./structure/blockchain";
import TransactionPool from "./transaction/transactionPool";
import UnspentTxOutput from "./transaction/unspentTxOutput";

export default class GlobalVar {

  static txpool = new TransactionPool();
  static utxoList: UnspentTxOutput[] | null = UnspentTxOutput.validateAndUpdateUtxoList(Block.getGenesisBlock().data, [], 0);
  static blockchain: Blockchain = new Blockchain();
}