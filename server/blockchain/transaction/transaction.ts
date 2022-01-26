import cryptojs from "crypto-js";
import _ from "lodash";
import UnspentTxOutput from "./unspentTxOutput";
import Wallet from "../wallet/wallet";
import * as config from "../config";

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
class TxIn {
	public txOutId: string;
	public txOutIndex: number;
	public signature: string;

	static createUnSignedTxIn = (utxo: UnspentTxOutput): TxIn => {
		const txIn = new TxIn();
		txIn.txOutId = utxo.txOutId;
		txIn.txOutIndex = utxo.txOutIndex;
		return txIn;
	};

	static getUnSginedTxInList = (utxoList: UnspentTxOutput[]): TxIn[] => {
		let txIns: TxIn[] = [];
		txIns = utxoList.map(this.createUnSignedTxIn);
		return txIns;
	};

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

	/**
	 * @brief Validates txIn
	 * @param tx transaction which contains txIn
	 * @param txIn transaction input
	 * @param utxoList unspent tx output list where txIn came from
	 * @returns true if txIn is valid
	 */
	static isValidTxIn = (
		tx: Transaction,
		txIn: TxIn,
		utxoList: UnspentTxOutput[]
	): boolean => {
		/**
		 * Validates
		 * 1. txIn is from UTxO list
		 * 2. txIn's signature
		 */

		// 1. check if it is from UTxO list
		const txInFromUtxoList = UnspentTxOutput.findUtxo(txIn, utxoList);
		if (txInFromUtxoList === undefined) {
			console.log("Cannot find TxIn from UTxO");
			return false;
		}

		// 2. validates signature
		const address = txInFromUtxoList.address;
		const isValidSign = Wallet.isValidSignature(address, tx.id, txIn.signature)
		if (!isValidSign) {
			console.log("Invalid txIn signature");
			console.log(`tx id: ${tx.id}`);
			console.log(`txIn signature: ${txIn.signature}`);
			console.log(`address: ${address}`);
			return false;
		}

		return true;
	};
}

/**
 * @brief Transaction Output class
 * @address
 * - type: string
 * - description: receiver's wallet address
 * @amount
 * - type: number
 * - description: how much sending coins
 */
class TxOut {
	public address: string;
	public amount: number;
	constructor(address: string, amount: number) {
		this.address = address;
		this.amount = amount;
	}

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
}

/**
 * @brief Transaction class including id, txIns, txOuts
 * @id
 * - type: string
 * - description: encrypted hash value fo txIns contents and txOuts contents(except signature)
 * @txIns
 * type TxIn[]
 * @txOuts
 * type TxOut[]
 */
class Transaction {
	public id: string;
	public txIns: TxIn[];
	public txOuts: TxOut[];

	constructor() {
		this.id;
		this.txIns = [];
		this.txOuts = [];
	}

	/**
	 * @brief Calculate transaction using transaction inputs' contents and outputs' contents (except signatures)
	 * @param tx transaction
	 * @returns transacion Id
	 */
	static calTxId(tx: Transaction): string {
		const txInContents = tx.txIns
			.map((txIn) => txIn.txOutId + txIn.txOutIndex)
			.reduce((a, b) => a + b, "");
		const txOutContents = tx.txOuts
			.map((txOut) => txOut.address + txOut.amount)
			.reduce((a, b) => a + b, "");

		const txId = cryptojs.SHA256(txInContents + txOutContents).toString();
		return txId;
	}

	static isValidTxStructure = (tx: Transaction): boolean => {
		/**
		 * Validates 
		 * 1. null or undefined
		 * 2. type of id
		 * 3. type of txIns and txIn
		 * 4. type of txOuts and txOut
		 */
		if (tx === null || tx === undefined) {
			console.log("Transcation is null or undefined");
			return false;
		}
		if (typeof tx.id === "string") {
			console.log("Wrong type of transaction id");
			return false;
		}

		if (!(tx.txIns instanceof Array)) {
			console.log("Wrong type of txIns");
			return false;
		}

		const isValidTxInStructure: boolean = tx.txIns.map((txIn) => TxIn.isValidTxInStructure(txIn)).reduce((a,b) => a&&b, true);
		if (!isValidTxInStructure) {
			console.log("Wrong type of txIn found");
			return false;
		}


		if (!(tx.txOuts instanceof Array)) {
			console.log("Wrong type of txOuts");
			return false;
		}
		const isValidTxOutStructure: boolean = tx.txIns.map((txIn) => TxIn.isValidTxInStructure(txIn)).reduce((a,b) => a&&b, true);
		if (!isValidTxOutStructure) {
			console.log("Wrong type of txOut found");
			return false;
		}

		return true;
	}

	/**
	 * @brief Validates transaction
	 * @param tx transaction to validate
	 * @param utxoList Unspent Tx Output list for transaction input
	 * @returns true if transaction is valid
	 */
	static isValidTx = (
		tx: Transaction,
		utxoList: UnspentTxOutput[]
	): boolean => {
		// compare tx id with calculated one
		if (tx.id !== Transaction.calTxId(tx)) {
			console.log("Invalid transaction Id");
			return false;
		}

		// validate txIns
		tx.txIns
			.map((txIn) => TxIn.isValidTxIn(tx, txIn, utxoList))
			.reduce((a, b) => a && b, true);

		// check if txIns total amount === txOuts total amount
		const txInsTotalAmount = tx.txIns
			.map((txIn) => this.getTxInAmount(txIn, utxoList))
			.reduce((a, b) => a + b, 0);
		const txOutsTotalAmount = tx.txOuts
			.map((txOut) => txOut.amount)
			.reduce((a, b) => a + b, 0);
		if (txInsTotalAmount !== txOutsTotalAmount) {
			console.log("Invalid total amount from txIns or txOut");
			console.log(`Invalid transaciont Id : ${tx.id}`);
			return false;
		}

		return true;
	};

	/**
	 * @brief txIn doen't have amount, so that get amount from UTxO
	 * @param txIn transaction input
	 * @param utxoList unspent tx output list where txIn came from
	 * @returns amount of txIn
	 */
	static getTxInAmount = (txIn: TxIn, utxoList: UnspentTxOutput[]) => {
		const utxoFound = UnspentTxOutput.findUtxo(txIn, utxoList);
		if (utxoFound === undefined) {
			return 0;
		}
		return utxoFound.amount;
	};

	/**
	 * @brief Creates reward transaction for node who succeed mining
	 * @param minerAddress
	 * @param blockIndex
	 * @returns reward transaction which does not have txInput
	 */
	static getRewardTransaction = (
		minerAddress: string,
		blockIndex: number
	): Transaction => {
		// * reward transaction does not have transaction input.

		// create empty txIn to make Transation class
		const rewardTxIn = new TxIn();
		rewardTxIn.signature = "";
		rewardTxIn.txOutId = "";
		rewardTxIn.txOutIndex = blockIndex;

		const rewardTxOut = new TxOut(minerAddress, config.MINING_REWARD);

		const rewardTx = new Transaction();
		rewardTx.txIns = [rewardTxIn];
		rewardTx.txOuts = [rewardTxOut];
		rewardTx.id = this.calTxId(rewardTx);

		return rewardTx;
	};

	static createTransaction = (
		receiverAddress: string,
		amount: number,
		privateKey: string,
		utxoList: UnspentTxOutput[],
		txpool: Transaction[],
	) => {
		// 1. get myUtxoList from utxoList
		const myAddress: string = Wallet.getPublicKeyFromPrivateKey(privateKey);
		const myUtxoList: UnspentTxOutput[] = utxoList.filter(utxo => utxo.address === myAddress);
		console.log(myUtxoList);
		
		
		// 2. use myUtxo as txIn


		// 3. put new tx into txpool

		// 
	};
}

export { Transaction, TxIn, TxOut };
