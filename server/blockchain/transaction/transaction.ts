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

	constructor(txOutId: string, txOutIndex: number, signature: string) {
		this.txOutId = txOutId;
		this.txOutIndex = txOutIndex;
		this.signature = signature;
	}

	/**
	 * @brief Create new TxIn with empty signature
	 * @param utxo
	 * @returns
	 */
	static createUnSignedTxIn = (utxo: UnspentTxOutput): TxIn => {
		const txIn = new TxIn(utxo.txOutId, utxo.txOutIndex, "");
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
		const utxoFound: UnspentTxOutput | undefined =
			UnspentTxOutput.findUtxoMatchesTxIn(txIn, utxoList);
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

	/**
	 * @brief txIn doen't have amount, so that get amount from UTxO
	 * @param txIn transaction input
	 * @param utxoList unspent tx output list where txIn came from
	 * @returns amount of txIn
	 */
	static getTxInAmount = (txIn: TxIn, utxoList: UnspentTxOutput[]) => {
		const utxoFound = UnspentTxOutput.findUtxoMatchesTxIn(txIn, utxoList);
		if (utxoFound === undefined) {
			return 0;
		}
		return utxoFound.amount;
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

	constructor(id: string, txIns: TxIn[], txOuts: TxOut[]) {
		this.id = id;
		this.txIns = txIns;
		this.txOuts = txOuts;
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

		const isValidTxInStructure: boolean = tx.txIns
			.map((txIn) => TxIn.isValidTxInStructure(txIn))
			.reduce((a, b) => a && b, true);
		if (!isValidTxInStructure) {
			console.log("Wrong type of txIn found");
			return false;
		}

		if (!(tx.txOuts instanceof Array)) {
			console.log("Wrong type of txOuts");
			return false;
		}
		const isValidTxOutStructure: boolean = tx.txIns
			.map((txIn) => TxIn.isValidTxInStructure(txIn))
			.reduce((a, b) => a && b, true);
		if (!isValidTxOutStructure) {
			console.log("Wrong type of txOut found");
			return false;
		}

		return true;
	};

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
			.map((txIn) => TxIn.isValidTxIn(tx.id, txIn, utxoList))
			.reduce((a, b) => a && b, true);

		// check if txIns total amount === txOuts total amount
		const txInsTotalAmount = tx.txIns
			.map((txIn) => TxIn.getTxInAmount(txIn, utxoList))
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
		const rewardTxIn = new TxIn("", blockIndex, "");
		const rewardTxOut = new TxOut(minerAddress, config.MINING_REWARD);

		const rewardTx = new Transaction("", [rewardTxIn], [rewardTxOut]);
		rewardTx.id = this.calTxId(rewardTx);

		return rewardTx;
	};

	static createTransaction = (
		receiverAddress: string,
		sendingAmount: number,
		privateKey: string,
		utxoList: UnspentTxOutput[],
		txpool: Transaction[]
	): Transaction | null => {
		// 1. get myUtxoList from utxoList
		const myAddress: string = Wallet.getPublicKeyFromPrivateKey(privateKey);
		const myUtxoList: UnspentTxOutput[] = UnspentTxOutput.findMyUtxoList(
			myAddress,
			utxoList
		);

		// 2. Check if myUtxo is already used and filter it
		const avaliableMyUtxoList: UnspentTxOutput[] =
			UnspentTxOutput.filterConsumedMyUtxoList(myUtxoList, txpool);

		// 3. get available UTxOs equal to or greater than sending amount
		const { utxoListToBeUsed, leftOverAmount } =
			UnspentTxOutput.getUtxosForSending(avaliableMyUtxoList, sendingAmount);

		// ! Exceptio handling : cannot create transaction from the available UTxO list
		if (utxoListToBeUsed === null || leftOverAmount === null) {
			return null;
		}

		// 4. put new tx into txpool
		//TODO 새로 만든 tx를 txpool에 넣기
		const newUnsignedTxIns: TxIn[] = utxoListToBeUsed.map((utxo) =>
			TxIn.createUnSignedTxIn(utxo)
		);

		const newTxOuts: TxOut[] = TxOut.createTxOuts(
			receiverAddress,
			sendingAmount,
			myAddress,
			leftOverAmount
		);
		const newTx: Transaction = new Transaction("", newUnsignedTxIns, newTxOuts);
		return newTx;
	};
}

export { Transaction, TxIn, TxOut };
