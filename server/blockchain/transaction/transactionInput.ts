import Wallet from "../wallet/wallet";
import UnspentTxOutput from "./unspentTxOutput";

/**
 * @brief Transaction Input class
 * @txOutId
 * - type: string
 * - description: Unspent Transaction Out's Id
 * @txOutIndex
 * - type: number
 * - description: Unspent Transaction Out's Index
 * @signature
 * - type: string
 * - description: Unspent Transaction Out's signature. Calculated using private key
 */
export default class TxIn {
	public txOutId: string;
	public txOutIndex: number;
	public signature: string;
	public amount: number;

	constructor(txOutId: string, txOutIndex: number, signature: string, amount: number) {
		this.txOutId = txOutId;
		this.txOutIndex = txOutIndex;
		this.signature = signature;
		this.amount = amount;
	}

	/**
	 * @brief Create new TxIn with empty signature
	 * @param utxo
	 * @returns Transaction input with empty signature
	 */
	static createUnSignedTxIn = (utxo: UnspentTxOutput): TxIn => {
		const txIn = new TxIn(utxo.txOutId, utxo.txOutIndex, "", utxo.amount);
		return txIn;
	};

	static getUnSginedTxInList = (utxoList: UnspentTxOutput[]): TxIn[] => {
		let txIns: TxIn[] = [];
		txIns = utxoList.map(this.createUnSignedTxIn);
		return txIns;
	};

	static signToTxIn = (
		unsignedTxIn: TxIn,
		privateKey: string,
		txId: string
	): TxIn => {
		return {
			...unsignedTxIn,
			signature: Wallet.signWithPrivateKey(privateKey, txId),
		};
	};

	static getSignedTxInList = (
		unsignedTxInList: TxIn[],
		utxoListToBeUsed: UnspentTxOutput[],
		privateKey: string,
		txId: string
	): TxIn[] => {
		return unsignedTxInList.map((unsignedTxIn: TxIn) => {
			const utxoMatchesTxIn = UnspentTxOutput.findUtxo(
				unsignedTxIn.txOutId,
				unsignedTxIn.txOutIndex,
				utxoListToBeUsed
			);
			if (utxoMatchesTxIn === undefined) {
				const errMsg = "Cannot find UTxO which matches TxIn";
				console.log(errMsg);
				throw Error(errMsg);
			}
			if (
				Wallet.getPublicKeyFromPrivateKey(privateKey) !==
				utxoMatchesTxIn.address
			) {
				const errMsg = "Invalid private key.";
				console.log(errMsg);
				throw Error(errMsg);
			}
			const signedTxIn: TxIn = this.signToTxIn(unsignedTxIn, privateKey, txId);
			return signedTxIn;
		});
	};

	/********************************/
	/***** Validation Functions *****/
	/********************************/

	static isValidTxInStructure = (txIn: TxIn): boolean => {
		if (txIn === null || txIn === undefined) {
			console.log("The txIn is null or undefined");
			return false;
		}
		if (typeof txIn.signature !== "string") {
			console.log("Wrong type of txIn signature");
			return false;
		}
		if (typeof txIn.txOutId !== "string") {
			console.log("Wrong type of txIn txOutId");
			return false;
		}
		if (typeof txIn.txOutIndex !== "number") {
			console.log("Wrong type of txIn txOutIndex");
			return false;
		}
		return true;
	};

	static getTxInsTotalAmount = (
		txIns: TxIn[],
	): number => {
		return txIns
			.map((txIn) => {
				return txIn.amount;
			})
			.reduce((a, b) => a + b, 0);
	};

	/**
	 * @brief Validates txIn
	 * @param tx transaction which contains txIn
	 * @param txIn transaction input
	 * @param utxoList unspent tx output list where txIn came from
	 * @returns true if txIn is valid
	 */
	static isValidTxIn = (
		txId: string,
		txIn: TxIn,
		utxoList: UnspentTxOutput[]
	): boolean => {
		/**
		 * Validates
		 * 1. txIn is from UTxO list
		 * 2. txIn's signature
		 */

		// 1. check if txIn is from UTxO list
		const utxoFound: UnspentTxOutput | undefined = UnspentTxOutput.findUtxo(
			txIn.txOutId,
			txIn.txOutIndex,
			utxoList
		);
		if (utxoFound === undefined) {
			console.log("Cannot find TxIn from UTxO");
			return false;
		}

		// 2. validates signature
		const address = utxoFound.address;
		const isValidSign = Wallet.isValidSignature(address, txId, txIn.signature);
		if (!isValidSign) {
			console.log("Invalid txIn signature");
			console.log(`tx id: ${txId}`);
			console.log(`txIn signature: ${txIn.signature}`);
			console.log(`address: ${address}`);
			return false;
		}

		return true;
	};
}
