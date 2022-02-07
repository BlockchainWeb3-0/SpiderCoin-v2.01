import express from "express";
import Transaction from "../../blockchain/transaction/transaction";
import GlobalVar from "../../blockchain/globalVar";

export const router = express.Router();

router.get("/", (req, res) => {
  console.log("Transaction Router");
	res.send("transaction page");
});



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