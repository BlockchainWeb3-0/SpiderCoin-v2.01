import _ from "lodash";
import { Transaction } from "./transaction";

class TransactionPool {
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
}

const txpool = new TransactionPool();