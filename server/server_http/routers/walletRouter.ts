import express from "express";
import GlobalVar from "../../blockchain/globalVar";
import Wallet from "../../blockchain/wallet/wallet";

export const router = express.Router();

router.get("/create", (req, res) => {
	res.send(Wallet.generatePrivatePublicKeys());
});

router.get("/myprivatekey", (req, res) => {
	res.send(Wallet.getPrivateKeyFromWallet());
});

router.get("/myaddress", (req, res) => {
	res.send(Wallet.getPulicKeyFromWallet());
});

router.get("/mybalance", (req, res) => {
	// ! exception handling : UTXO list could be null
	if (GlobalVar.utxoList === null) {
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}
	const myAddress = Wallet.getPulicKeyFromWallet();
	const myBalance = Wallet.getBalance(myAddress, GlobalVar.utxoList)
	res.send({balance: myBalance});
});

router.get("/balance/:address", (req, res) => {
	const walletAddress: string = req.params.address;
	// ! exception handling : UTXO list could be null
	if (GlobalVar.utxoList === null) {
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}
	const walletBalance: number = Wallet.getBalance(
		walletAddress,
		GlobalVar.utxoList
	);
	res.send({ balance: walletBalance });
});
