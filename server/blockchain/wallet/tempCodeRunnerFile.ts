import { ec } from "elliptic"
import _ from "lodash";
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";

const EC = new ec("secp256k1");
const privateKeyLocation = process.env.PRIVATE_KEY_LOCATION || "node/wallet/private_key"

class Wallet {
  static createWallet = () => {
    if(existsSync(privateKeyLocation)){
      console.log("Wallet already exists.");
      return;
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

}

console.log(Wallet.readPrivateKeyFromWallet());
