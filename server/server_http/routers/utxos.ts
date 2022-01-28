import express from "express"
import GlobalVar from "../../blockchain/globalVar";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
import Wallet from "../../blockchain/wallet/wallet";

export const router = express.Router();

router.get('/', (req, res) => {
  console.log("UTxO Router");
  
  res.send(GlobalVar.utxoList)
})

router.get("/mine/:address", (req, res) => {
  const myAddress: string = req.params.address;
  const myUtxoList: UnspentTxOutput[] = UnspentTxOutput.findMyUtxoList(myAddress, GlobalVar.utxoList) 
  res.send(myUtxoList)
})

router.get("/create/test", (req, res) => {
  for (let i = 0; i < 5; i++) {
    const utxo = new UnspentTxOutput(
      `id${i}`,
      i,
      Wallet.getPulicKeyFromWallet(),
      10
    );
    GlobalVar.utxoList.push(utxo);
  }
  for (let i = 0; i < 5; i++) {
    const utxo = new UnspentTxOutput(
      `id${i}`,
      i,
      Wallet.generatePrivatePublicKeys().publicKey,
      10
    );
    GlobalVar.utxoList.push(utxo);
  }
  console.log(GlobalVar.utxoList);
  
  res.send("Created test utxoList")
})

router.get("/clear/test", (req, res) => {
  GlobalVar.utxoList = [];
  console.log(GlobalVar.utxoList);
  
  res.send("Created test utxoList")
})