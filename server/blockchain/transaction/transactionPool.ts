import _ from "lodash";
import { Transaction, TxIn } from "./transaction";

export default class TransactionPool {
  public txpool: Transaction[];
  
  constructor(){
    this.txpool = [];
  }

  static deepCopyTxPool = (txpool: Transaction) => {
    return _.cloneDeep(txpool);
  }

  static addTxPool = (newTx: Transaction, txpool: TransactionPool) => {
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

const txpool = new TransactionPool();