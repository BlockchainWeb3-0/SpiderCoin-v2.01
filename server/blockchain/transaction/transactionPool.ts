import _ from "lodash";
import Transaction from "./transaction";
import TxIn from "./transactionInput";
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
	static addTxToTxpool = (
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
	
	/**
	 * @brief Remove invalid transactions from txpool
	 * @param utxoList
	 * @param txpool 
	 */
	static updateTxpool = (utxoList: UnspentTxOutput[], txpool: Transaction[]) => {
		const invalidTxList: Transaction[] = [];

		// Every transaction's inputs must be from utxoList
		// If not, they are invalid transactions
		for (const tx of txpool) {
			for (const txIn of tx.txIns) {
				if (!UnspentTxOutput.doesUxtoHasTxIn(txIn, utxoList)) {
					invalidTxList.push(tx);
					break;
				}
			}
		}

		if (invalidTxList.length > 0) {
			console.log("Found invalid transactions from txpool");
			txpool = _.without(txpool, ...invalidTxList);
			console.log("Removed invalid transactions successfully");
		}
		console.log("Fount nothing invalid, all transactions from txpool are valid");
	}

	

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

		const containsTxIn = (txInList: TxIn[], txIn: TxIn): boolean => {
			return txInList.find(
				(txInFromList) =>
					txInFromList.txOutId === txIn.txOutId &&
					txInFromList.txOutIndex === txIn.txOutIndex
			) !== undefined;
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