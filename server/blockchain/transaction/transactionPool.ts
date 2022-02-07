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
		 * 1. Is valid transaction?
		 * 2. Is Valid transaction structure?
		 * 3. Is there duplicates in transaction pool?
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
	 * @return txpool that was removed invalid transcations
	 */
	static removeInvalidTxsFromTxpool = (
		utxoList: UnspentTxOutput[],
		txpool: Transaction[]
	): Transaction[] => {
		const invalidTxList: Transaction[] = [];

		for (const tx of txpool) {
			if (!Transaction.isValidTx(tx, utxoList)) {
				invalidTxList.push(tx);
			}
		}

		if (invalidTxList.length > 0) {
			console.log("Found invalid transactions from txpool");
			txpool = _.without(txpool, ...invalidTxList);
			console.log("Removed invalid transactions successfully");
		} else {
			console.log(
				"Fount nothing invalid, all transactions from txpool are valid"
			);
		}
		
		return txpool
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

		const containsTxIn = (txInList: TxIn[], txIn: TxIn): boolean => {
			return (
				txInList.find(
					(txInFromList) =>
						txInFromList.txOutId === txIn.txOutId &&
						txInFromList.txOutIndex === txIn.txOutIndex
				) !== undefined
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