import _ from "lodash";
import { Transaction, TxIn } from "./transaction";

export default class TransactionPool {
  public txList: Transaction[];
  
  constructor() {
    this.txList = [];
  }

  static deepCopyTxPool = (txpool: Transaction) => {
    return _.cloneDeep(txpool);
  }

  addTxPool = (newTx: Transaction, txpool: TransactionPool) => {
    /**
     * validates
     * 1. transaction
     * 2. transaction pool
     * 3. txout address and amount
     */
    
  }

  static getEveryTxInsFromTxpool = (txpool: Transaction[]): TxIn[] => {
		return txpool.map(tx => tx.txIns).reduce((a,b)=>a.concat(b), []);
	}
}