import express from "express";
import GlobalVar from "../../blockchain/globalVar";
import { Block } from "../../blockchain/structure/block";
import Transaction from "../../blockchain/transaction/transaction";
import * as config from "../../blockchain/config";
import Wallet from "../../blockchain/wallet/wallet";

export const router = express.Router();

router.get("/", (req, res) => {
	res.send(GlobalVar.blockchain);
});

router.get("/findBlock/:hash", (req, res) => {
	const foundBlock = GlobalVar.blockchain.findBlock(req.params.hash); 
	res.send(foundBlock);
})

router.get("/lastBlock", (req, res) => {
	res.send(GlobalVar.blockchain.getLastBlock());
});

router.post("/mineBlock", (req, res) => {
	// ! exception handling : UTXO list could be null
	if (GlobalVar.utxoList === null ){
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}

	const minerAddress = req.body.minerAddress || Wallet.getPulicKeyFromWallet();

	// Merge miner's reward tx with txlist from txpool
	const txListForMining: Transaction[] = Transaction.createTxListForMining(
		minerAddress,
		config.MINING_REWARD,
		GlobalVar.blockchain.getLastBlock().header.index,
		GlobalVar.txpool.txList
	);

	// Get newBlock with txList that was created above
	const newBlock = Block.getNewBlock(GlobalVar.blockchain.getLastBlock(), txListForMining);
	if (newBlock === null) {
		console.log("Creating new block was failed!");
		res.send(null);
	} else {
		GlobalVar.blockchain.mineBlock(newBlock, txListForMining, GlobalVar.utxoList);
		res.send(GlobalVar.blockchain.getLastBlock());
	}
});
