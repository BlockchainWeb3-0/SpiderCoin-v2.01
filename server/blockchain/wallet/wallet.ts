import { ec } from "elliptic"
import _ from "lodash";
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync } from "fs";

const EC = new ec("secp256k1");

const privateKeyFolderPath = process.env.PRIVATE_KEY || "node/wallet/";
const privateKeyFileName = "private_key";
const privateKeyLocation = privateKeyFolderPath + privateKeyFileName;


export default class Wallet {
	static initWallet = () => {
		if (existsSync(privateKeyLocation)) {
			console.log("Wallet already exists.");
			return;
		}
		this.createNewWallet();
	};

	static createNewWallet = () => {
		if (!existsSync(privateKeyFolderPath)) {
			mkdirSync(privateKeyFolderPath, { recursive: true });
		}
		const newPrivateKey: string = this.generatePrivatePublicKeys().privateKey;
		writeFileSync(privateKeyLocation, newPrivateKey);
		console.log("New wallet with private key is created!");
		console.log(`Path : ${privateKeyLocation}`);
	};

	static deleteWallet = () => {
		if (existsSync(privateKeyLocation)) {
			unlinkSync(privateKeyLocation);
		}
		console.log("Cannot find wallet");
	};

	static generatePrivatePublicKeys = () => {
		const keyPair = EC.genKeyPair();
		const privateKey = keyPair.getPrivate().toString(16);
    const publicKey = keyPair.getPublic("hex");
		return {privateKey, publicKey};
	};

	static getPublicKeyFromPrivateKey = (privateKey: string): string => {
		const key = EC.keyFromPrivate(privateKey, "hex");
		const publicKey = key.getPublic("hex");
		return publicKey;
	};

	static getPulicKeyFromWallet = (): string => {
		const privateKey = this.getPrivateKeyFromWallet();
		const key = EC.keyFromPrivate(privateKey, "hex");
		const publicKey = key.getPublic("hex");
		return publicKey;
	};

	static getPrivateKeyFromWallet = (): string => {
		const privateKey = readFileSync(privateKeyLocation, "utf-8").toString();
		return privateKey;
	};

	static decimalArrayToHexString = (decimalArray: number[]): string => {
		return Array.from(decimalArray, (decimal) =>
			("0" + (decimal & 0xff).toString(16)).slice(-2)
		).join("");
	};

	static signWithPrivateKey = (privateKey: string, txId: string): string => {
		const key = EC.keyFromPrivate(privateKey, "hex");
		const signature: string = this.decimalArrayToHexString(
			key.sign(txId).toDER()
		);
		return signature;
	};



	/********************************/
	/***** Validation Functions *****/
	/********************************/

	static isValidSignature = (
		address: string,
		txId: string,
		txInSign: string
	): boolean => {
		const key = EC.keyFromPublic(address, "hex");
		return key.verify(txId, txInSign);
	};

	/**
	 * @brief Address must be 130 length, contain only hex, and start with "04"  
	 * @param address public key
	 * @returns true if address is valid
	 */
	static isValidAddress = (address: string): boolean => {
		if (address.length !== 130) {
			console.log("Invalid address length");
			return false;
		}
		else if (!address.startsWith("04")) {
			console.log("Address must start with 04");
			return false;
		}
		else if (address.match("^[a-fA-F0-9]+$") === null) {
			console.log("Only hex characters are allowed for address");
			return false;
		}
		
		return true;
	}
}