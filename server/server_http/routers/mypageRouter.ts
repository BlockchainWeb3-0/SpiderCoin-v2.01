import express from "express";
import GlobalVar from "../../blockchain/globalVar";
import Wallet from "../../blockchain/wallet/wallet";

export const router = express.Router();

router.get("/balance/:address", (req, res) => {
  const walletAddress: string = req.params.address;
  // ! exception handling : UTXO list could be null
  if (GlobalVar.utxoList === null ){
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}
  const walletBalance: number = Wallet.getBalance(walletAddress, GlobalVar.utxoList);  
	res.send({balance : walletBalance});
});
