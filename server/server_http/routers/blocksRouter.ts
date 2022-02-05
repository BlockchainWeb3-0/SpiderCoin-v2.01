import express from "express";
import GlobalVar from "../../blockchain/globalVar";
import { Block } from "../../blockchain/structure/block";

export const router = express.Router();

router.get("/", (req, res) => {
	res.send(GlobalVar.blockchain);
});

router.get("/findBlock/:hash", (req, res) => {
	const foundBlock = GlobalVar.blockchain.getBlock(req.params.hash); 
	res.send(foundBlock);
})

router.get("/lastBlock", (req, res) => {
	res.send(GlobalVar.blockchain.getLastBlock());
});

router.post("/mineBlock", (req, res) => {
	const newBlock = Block.getNewBlock(GlobalVar.blockchain.getLastBlock(), req.body.txList);
	if (newBlock === null) {
		console.log("Creating new block was failed!");
		res.send(null);
	} else {
		GlobalVar.blockchain.addBlock(newBlock);
		res.send(GlobalVar.blockchain.getLastBlock());
	}
})