import express from "express"
import GlobalVar from "../../blockchain/globalVar";
import { Block } from "../../blockchain/structure/block";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
import Wallet from "../../blockchain/wallet/wallet";

export const router = express.Router();

router.get('/', (req, res) => {
  console.log("UTxO Router");
  res.send(GlobalVar.utxoList)
})

router.get("/:address", (req, res) => {
  // ! exception handling : UTXO list could be null
  if (GlobalVar.utxoList === null ){
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}

  const walletAddress: string = req.params.address;
  const foundUtxoList: UnspentTxOutput[] = UnspentTxOutput.findMyUtxoList(walletAddress, GlobalVar.utxoList) 
  res.send(foundUtxoList)
})

router.get("/create/test", (req, res) => {
  if (GlobalVar.utxoList === null ){
		console.log("Invalid UTXO list");
		res.send(null);
		return;
	}

  // Create utxo list for wallet user 
  for (let i = 0; i < 5; i++) {
    const utxo = new UnspentTxOutput(
      `id${i}`,
      i,
      Wallet.getPulicKeyFromWallet(),
      5
    );
    GlobalVar.utxoList.push(utxo);
  }

  // Create utxo list for random wallets 
  for (let i = 0; i < 5; i++) {
    const utxo = new UnspentTxOutput(
      `id${i}`,
      i,
      Wallet.generatePrivatePublicKeys().publicKey,
      10
    );
    GlobalVar.utxoList.push(utxo);
  }
  console.log("Created test utxoList");
  res.send("Created test utxoList")
})

router.get("/clear/test", (req, res) => {
  GlobalVar.utxoList = UnspentTxOutput.validateAndUpdateUtxoList(
		Block.getGenesisBlock().data,
		[],
		0
	);
  console.log("Cleared test utxoList");
  
  res.send("Creared test utxoList")
})