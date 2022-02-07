import express from "express";
import Transaction from "../../blockchain/transaction/transaction";
import GlobalVar from "../../blockchain/globalVar";
import Wallet from "../../blockchain/wallet/wallet";

export const router = express.Router();

router.get("/", (req, res) => {
  console.log("Transaction Router");
	res.send("transaction page");
});

router.get("/txpool", (req, res) => {
	console.log(`Get txpool: ${GlobalVar.txpool.txList}`);
	res.send(GlobalVar.txpool.txList);
})

router.post("/send", (req, res) => {
	const receiverAddress: string = req.body.receiverAddress;
	const sendingAmount: number = req.body.sendingAmount;
	const senderAddress: string = Wallet.getPulicKeyFromWallet();
	const senderPrivateKey: string = Wallet.getPrivateKeyFromWallet();

	if (receiverAddress === undefined || sendingAmount === undefined) {
		console.log("Invalid receiver address and sending amount from request");
		res.send(null);
	}

	// ! exception handling : UTXO list could be null
	if (GlobalVar.utxoList === null ){
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}

	const newTx = Transaction.sendTx(
		receiverAddress,
		sendingAmount,
		senderAddress,
		senderPrivateKey,
		GlobalVar.utxoList,
		GlobalVar.txpool.txList
	);

	res.send(newTx);
})

router.post("/create", (req, res) => {
	const { receiverAddress, sendingAmount, senderAddress, privateKey } =
		req.body;
	// ! exception handling : UTXO list could be null
	if (GlobalVar.utxoList === null ){
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}
	const newTx: Transaction | null = Transaction.createTx(
		receiverAddress,
		sendingAmount,
		senderAddress,
		privateKey,
		GlobalVar.utxoList,
		GlobalVar.txpool.txList
	);

	// ! exception handling : newTx could be null
  if(newTx === null) {
		console.log("Transaction wasn't created.");
  }
	res.send(newTx)
})