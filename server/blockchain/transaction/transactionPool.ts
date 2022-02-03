import _ from "lodash";
import { Transaction, TxIn } from "./transaction";
import UnspentTxOutput from "./unspentTxOutput";

export default class TransactionPool {
	public txList: Transaction[];

	constructor() {
		this.txList = [];
	}

	static getTxPool = (txpool: Transaction[]) => {
		return _.cloneDeep(txpool);
	};

	static getEveryTxInsFromTxpool = (txpool: Transaction[]): TxIn[] => {
		return txpool.map((tx) => tx.txIns).reduce((a, b) => a.concat(b), []);
	};

	/**
	 * @brief Validates new Transaction and if it is valid, put it into txpool
	 * @param newTx new Transaction
	 * @param utxoList Availalbe utxo list
	 * @param txpool txpool containing transactions that will be added to new block
	 * @returns true if adding tx into txpool has done successfully
	 */
	static addTxPool = (
		newTx: Transaction,
		utxoList: UnspentTxOutput[],
		txpool: Transaction[]
	): boolean => {
		/**
		 * validates
		 * 1. transaction
		 * 2. transaction structure
		 * 3. transaction pool
		 */
		if (!Transaction.isValidTx(newTx, utxoList)) {
			console.log("Invalid transaction");
		}
		if (!Transaction.isValidTxStructure(newTx)) {
			console.log("Invalid transaction structure");
		}
		if (TransactionPool.doesTxpoolContainTx(newTx, txpool)) {
			console.log("The transaction is already contained in txpool");
			return false;
		}

		console.log(`Successfully added to txpool, tx: ${JSON.stringify(newTx)}`);
		txpool.push(newTx);
		return true;
	};


	/********************************/
	/***** Validation Functions *****/
	/********************************/

	/**
	 * @brief Check if txpool contains the transaction or not
	 * @param tx transaction that you want to put in txpool
	 * @param txpool transaction pool
	 * @returns true if tx is in txpool already
	 */
	static doesTxpoolContainTx = (
		tx: Transaction,
		txpool: Transaction[]
	): boolean => {
		const txInListFromTxpool: TxIn[] = this.getEveryTxInsFromTxpool(txpool);

		const containsTxIn = (txInList: TxIn[], txIn: TxIn): TxIn | undefined => {
			return txInList.find(
				(txInFromList) =>
					txInFromList.txOutId === txIn.txOutId &&
					txInFromList.txOutIndex === txIn.txOutIndex
			);
		};

		for (const txIn of tx.txIns) {
			if (containsTxIn(txInListFromTxpool, txIn)) {
				console.log("Transaction is already in txpool");
				console.log(`txIn's txOutId : ${txIn.txOutId}`);
				console.log(`txIn's txOutIndex : ${txIn.txOutIndex}`);
				return true;
			}
		}
		return false;
	};
}