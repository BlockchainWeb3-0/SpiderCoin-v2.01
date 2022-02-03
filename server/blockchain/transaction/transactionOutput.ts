import Wallet from "../wallet/wallet";

/**
 * @brief Transaction Output class
 * @address
 * - type: string
 * - description: receiver's wallet address
 * @amount
 * - type: number
 * - description: how much sending coins
 */
export default class TxOut {
	public address: string;
	public amount: number;
	constructor(address: string, amount: number) {
		this.address = address;
		this.amount = amount;
	}

	/**
	 * @brief Create txOutput list to put into new transaction.
	 * @param receiverAddress receiver's public key
	 * @param sendingAmount how much would like to send
	 * @param senderAddress sender's public key
	 * @param leftOverAmount used UTxO's total amount - sending amount
	 * @returns1 only sendingTxOut if leftOverAmount is 0
	 * @returns2	otherwise returns sendingTxOut and refundTxOut
	 */
	static createTxOuts = (
		receiverAddress: string,
		sendingAmount: number,
		senderAddress: string,
		leftOverAmount: number
	): TxOut[] => {
		// 1. create txOut for sending
		const sendingTxOut = new TxOut(receiverAddress, sendingAmount);
		if (leftOverAmount === 0) {
			return [sendingTxOut];
		}

		// 2. create txOut for refund if leftOver amount is not 0
		// (this txOut will be one of the next unspent TxOutputs)
		const refundTxOut = new TxOut(senderAddress, leftOverAmount);

		return [sendingTxOut, refundTxOut];
	};
	/********************************/
	/***** Validation Functions *****/
	/********************************/

	static isValidTxOutStructure = (txOut: TxOut): boolean => {
		if (txOut === null || txOut === undefined) {
			console.log("The txOut is null or undefined");
			return false;
		}
		if (typeof txOut.address !== "string") {
			console.log("Wrong type of txOut address");
			return false;
		}
		if (typeof txOut.amount !== "number") {
			console.log("Wrong type of txOut amount");
			return false;
		}
		return true;
	};

	static isValidTxOut = (txOut: TxOut): boolean => {
		if (!Wallet.isValidAddress(txOut.address)) {
			console.log("Invalid txOut address");
			return false;
		}
		if (txOut.amount === 0 || txOut.amount === NaN) {
			console.log("Invalid txOut amount");
			return false;
		}
		return true;
	}
}
