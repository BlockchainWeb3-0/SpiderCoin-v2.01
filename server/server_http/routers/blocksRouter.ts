import express from "express";
import GlobalVar from "../../blockchain/globalVar";
import { Block } from "../../blockchain/structure/block";

export const router = express.Router();

router.get("/", (req, res) => {
	res.send(GlobalVar.blockchain);
});

router.post("/create/newBlock", (req, res) => {
	const newBlock = Block.getNewBlock(GlobalVar.blockchain.getLastBlock(), req.body.transaction)
	newBlock !== null
		? console.log("New block was created successfully")
		: console.log("Error: New block is not created");
	
	res.send(newBlock);
});
