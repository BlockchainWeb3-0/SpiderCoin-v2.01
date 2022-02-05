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

  const newTx: Transaction | null = Transaction.createTx(
		receiverAddress,
		sendingAmount,
		senderAddress,
		privateKey,
		GlobalVar.utxoList,
		GlobalVar.txpool.txList
	);

  if(newTx === null) {
    res.send("Transaction wasn't created.")
  }
  res.send(newTx)
})