import _ from "lodash";
import Blockchain from "../structure/blockchain";
import Transaction from "./transaction";
import TxIn from "./transactionInput";
import TransactionPool from "./transactionPool";

/**
 * @brief Unspent Transaction Input class
 * @txOutId
 * - type: string
 * - description: Transaction's id => Unspent Transaction Out's Id
 * @txOutIndex
 * - type: number
 * - description: Unspent Transaction Out's Index
 * @address
 * - type: string
 * - description: receiver's wallet address
 * @amount
 * - type: number
 * - description: how much sending coins
 */
export default class UnspentTxOutput {
	public readonly txOutId: string;
	public readonly txOutIndex: number;
	public readonly address: string;
	public readonly amount: number;

	constructor(
		txOutId: string,
		txOutIndex: number,
		address: string,
		amount: number
	) {
		this.txOutId = txOutId;
		this.txOutIndex = txOutIndex;
		this.address = address;
		this.amount = amount;
	}

	/**
	 * @brief Find specific address's UTxO List
	 * @param myAddress sender's address
	 * @param utxoList list of all utxo
	 * @returns Found UTxO list or empty list if nothing found
	 */
	static findMyUtxoList = (
		myAddress: string,
		utxoList: UnspentTxOutput[]
	): UnspentTxOutput[] => {
		const myUtxoList = utxoList.filter((utxo) => utxo.address === myAddress);
		if (myUtxoList === undefined) {
			return [];
		}
		return myUtxoList;
	};

	/**
	 * @brief Find UTxO that matches txOutId and txOutIndex from utxoList
	 * @param txOutId txIn's txOutId
	 * @param txOutIndex txIn's txOutIndex
	 * @param utxoList
	 * @returns UTxO
	 */
	static findUtxo = (
		txOutId: string,
		txOutIndex: number,
		utxoList: UnspentTxOutput[]
	): UnspentTxOutput | undefined => {
		return utxoList.find(
			(utxo) => utxo.txOutId === txOutId && utxo.txOutIndex === txOutIndex
		);
	};

	static filterConsumedMyUtxoList = (
		myUtxoList: UnspentTxOutput[],
		txpool: Transaction[]
	) => {
		// Get all txIn list from transaction list
		const everyTxIns: TxIn[] = TransactionPool.getEveryTxInsFromTxpool(txpool);
		const consumedUtxoList: UnspentTxOutput[] = [];

		// find consumed myUtxo and push it into consumedUtxoList
		everyTxIns.forEach((txIn) => {
			myUtxoList.forEach((myUtxo) => {
				if (
					myUtxo.txOutId == txIn.txOutId &&
					myUtxo.txOutIndex === txIn.txOutIndex
				) {
					consumedUtxoList.push(myUtxo);
				}
			});
		});

		return _.without(myUtxoList, ...consumedUtxoList);
	};

	/**
	 * @brief Get utxo list to be used from availableMyUtxoList
	 * @param availableMyUtxoList
	 * @param sendingAmount
	 * @returns object {utxo list to be used, leftOver amount}
	 */
	static getUtxosForSending = (
		availableMyUtxoList: UnspentTxOutput[],
		sendingAmount: number
	) => {
		const utxoListToBeUsed: UnspentTxOutput[] = [];
		let utxoTotalAmount = 0;
		for (const myUtxo of availableMyUtxoList) {
			utxoTotalAmount += myUtxo.amount;

			utxoListToBeUsed.push(myUtxo);
			if (utxoTotalAmount >= sendingAmount) {
				const leftOverAmount = utxoTotalAmount - sendingAmount;
				return { utxoListToBeUsed, leftOverAmount };
			}
		}
		// 여기서 forEach를 사용해서 return을 하려고 했는데,
		// forEach 안에서 return은 forEach의 반환값을 지정할 뿐,
		// 현재 함수의 반환값을 지정하지 않는다.
		// 따라서 이런 상황에서는 for of를 사용하는 것이 낫다.

		console.log("Cannot create transaction from the available UTxO list");
		console.log(`Require amount : ${sendingAmount}`);
		console.log(`Total amount in available UTxO list : ${utxoTotalAmount}`);
		return { utxoListToBeUsed: null, leftOverAmount: null };
	};

	/**
	 * @brief Add new utxoList and remove consumed list to update
	 * @param newTxList New block's transaction data
	 * @param oldUtxoList utxo list before updates
	 * @returns new utxoList after update
	 */
	static updateUtxoList = (
		newTxList: Transaction[],
		oldUtxoList: UnspentTxOutput[]
	): UnspentTxOutput[] => {
		// Get new utxo list from new tx's txOuts
		const newUtxoList: UnspentTxOutput[] = newTxList
			.map((tx) =>
				tx.txOuts.map(
					(txOut, index) =>
						new UnspentTxOutput(tx.id, index, txOut.address, txOut.amount)
				)
			)
			.reduce((a, b) => a.concat(b), []);

		// Get consumed utxo list from new tx's txIns
		const consumedUtxoList: UnspentTxOutput[] = newTxList
			.map((tx) => tx.txIns)
			.reduce((a, b) => a.concat(b), [])
			.map((txIn) => new UnspentTxOutput(txIn.txOutId, txIn.txOutIndex, "", 0));

		// remove consumed one from old utxo list
		// and then add new utxo list
		const updatedUtxoList = oldUtxoList
			.filter(
				(utxo) =>
					this.findUtxo(utxo.txOutId, utxo.txOutIndex, consumedUtxoList) ===
					undefined
			)
			.concat(newUtxoList);

		// return filtered new utxo list
		return updatedUtxoList;
	};

	/********************************/
	/***** Validation Functions *****/
	/********************************/

	static validateAndUpdateUtxoList = (
		newTxList: Transaction[],
		oldUtxoList: UnspentTxOutput[],
		blockIndex: number
	): UnspentTxOutput[] | null => {
		if (!Transaction.isValidTxListStructure(newTxList)) {
			console.log("Invalid Transaction structure in the list");
			return null;
		}
		if (!Blockchain.isValidBlockTxData(newTxList, oldUtxoList, blockIndex)) {
			console.log("Invalid Block's Transaction data.");
			return null;
		}
		return this.updateUtxoList(newTxList, oldUtxoList);
	};
}
