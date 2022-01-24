import cryptojs = require("crypto-js");
import _ from "lodash";
import ecdsa from "elliptic";
const ec = new ecdsa.ec("secp256k1");

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
class UTxO {
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

	static calculateId(tx: Transaction): string {
		const txInContents = tx.txIns
			.map((txIn) => txIn.txOutId + txIn.txOutIndex)
			.reduce((a, b) => a + b, "");
		const txOutContents = tx.txOuts
			.map((txOut) => txOut.address + txOut.amount)
			.reduce((a, b) => a + b, "");
	
		const txId = cryptojs.SHA256(txInContents + txOutContents).toString();
		return txId;
	}
}


export {Transaction}