import { ec } from "elliptic"
import _ from "lodash";
import { existsSync, readFileSync, unlinkSync, writeFileSync, mkdirSync } from "fs";

const EC = new ec("secp256k1");

const privateKeyFolderPath = process.env.PRIVATE_KEY || "node/wallet/";
const privateKeyFileName = "private_key";
const privateKeyLocation = privateKeyFolderPath + privateKeyFileName;


export default class Wallet {
  static initWallet = () => {
    if(existsSync(privateKeyLocation)){
      console.log("Wallet already exists.");
      return;
    }
    this.createNewWallet();
  }
  
  static createNewWallet = () => {
    if(!existsSync(privateKeyFolderPath)) {
      mkdirSync(privateKeyFolderPath, { recursive: true });
    }
    const newPrivateKey: string = this.generatePrivatekey();
    writeFileSync(privateKeyLocation, newPrivateKey);
    console.log("New wallet with private key is created!");
    console.log(`Path : ${privateKeyLocation}`);
  }
  
  static deleteWallet = () => {
    if(existsSync(privateKeyLocation)) {
      unlinkSync(privateKeyLocation);
    }
    console.log("Cannot find wallet");
  }

  static generatePrivatekey = (): string => {
    const keyPair = EC.genKeyPair();
    const privateKey = keyPair.getPrivate().toString(16);
    return privateKey;
  }

  static getPublicKeyFromPrivateKey = (privateKey: string): string => {
    const key = EC.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex", false);
    return publicKey;
  }

  static getWalletPublicKey = (): string => {
    const privateKey = this.readPrivateKeyFromWallet();
    const key = EC.keyFromPrivate(privateKey, "hex");
    const publicKey = key.getPublic().encode("hex", false);
    return publicKey;
  }

  static readPrivateKeyFromWallet = (): string => {
    const privateKey = readFileSync(privateKeyLocation, "utf-8").toString();
    return privateKey;
  }

  static isValidSignature = (address: string, txId: string, txInSign: string ): boolean => {
    const key = EC.keyFromPublic(address, "encryption");
		return key.verify(txId, txInSign);
  }
}