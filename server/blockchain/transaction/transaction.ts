import cryptojs = require("crypto-js");
import _ from "lodash";
import ecdsa from "elliptic";
import UnspentTxOutput from "./unspentTxOutput";
import Wallet from "../wallet/wallet";
const ec = new ecdsa.ec("secp256k1");

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

	/**
	 * @brief Validates transaction
	 * @param tx transaction to validate
	 * @param utxoList Unspent Tx Output list for transaction input
	 * @returns true if transaction is valid
	 */
	static isValidTx = (tx: Transaction, utxoList: UnspentTxOutput[]): boolean => {
		// compare tx id with calculated one
		if (tx.id !== Transaction.calTxId(tx)) {
			console.log("Invalid transaction Id");
			return false;
		}

		// validate txIns
		tx.txIns.map((txIn) => this.isValidTxIn(tx, txIn, utxoList)).reduce((a,b) => (a && b), true);

		// check if txIns total amount === txOuts total amount
		const txInsTotalAmount = tx.txIns.map(txIn => this.getTxInAmount(txIn, utxoList)).reduce((a,b) => a+b, 0);
		const txOutsTotalAmount = tx.txOuts.map(txOut => txOut.amount).reduce((a,b) => a+b, 0);
		if(txInsTotalAmount !== txOutsTotalAmount) {
			console.log("Invalid total amount from txIns or txOut");
			console.log(`Invalid transaciont Id : ${tx.id}`);
			return false;
		}

		return true;
	}

	/**
	 * @brief Validates txIn
	 * @param tx transaction which contains txIn
	 * @param txIn transaction input
	 * @param utxoList unspent tx output list where txIn came from
	 * @returns true if txIn is valid
	 */
	static isValidTxIn = (tx: Transaction, txIn: TxIn, utxoList: UnspentTxOutput[]): boolean => {
		// check if it is from UTxO list
		const txInFromUtxoList =  UnspentTxOutput.findUtxo(txIn, utxoList);
		if(txInFromUtxoList === undefined) {
			console.log("Cannot find TxIn from UTxO");
			return false;
		}

		// validates signature
		const address = txInFromUtxoList.address;
		const key = ec.keyFromPublic(address, "encryption");
		const isValidSign: boolean = key.verify(tx.id, txIn.signature);
		if(!isValidSign) {
			console.log("Invalid txIn signature");
			console.log(`tx id: ${tx.id}`);
			console.log(`txIn signature: ${txIn.signature}`);
			console.log(`address: ${address}`);
			return false;
		}

		return true;
	}


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
	}
	
	// static getCoinbaseTransaction = () => {
	// 	let coinbaseTx: Transaction;
	// 	coinbaseTx.txIns 
	// }
}

export { Transaction, TxIn, TxOut };
