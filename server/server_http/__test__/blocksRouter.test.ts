import axios from "axios";
import GlobalVar from "../../blockchain/globalVar";
import { Block } from "../../blockchain/structure/block";
import Blockchain from "../../blockchain/structure/blockchain";
import Transaction from "../../blockchain/transaction/transaction";
import Wallet from "../../blockchain/wallet/wallet";

describe("Blocks Router test", () => {
  let getParams: object;
  let postParams: object;
  beforeEach(() => {
		getParams = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/blocks",
		};
    
		postParams = {
			method: "post",
			baseURL: "http://localhost:3001",
			url: "/blocks",
      data: {
        transaction: []
      }
		};

	});
  
  test("First block must be a genesis block", async () => {
    const result = await axios.request(getParams);

    expect(result.data.blocks[0]).toEqual(Block.getGenesisBlock())
  })

  test("Create New block", async () => {
    let receiverAddress = Wallet.generatePrivatePublicKeys().publicKey;
		let senderAddress = Wallet.getPulicKeyFromWallet();
		let privateKey = Wallet.getPrivateKeyFromWallet();
		let sendingAmount = 10;
    const params: object = {
      method: "post",
      baseURL: "http://localhost:3001",
      url: "/transaction/create",
      data: {
        receiverAddress,
        sendingAmount,
        senderAddress,
        privateKey,
      },
    };
    const result = await axios.request(params);
    const tx: Transaction = result.data;
    postParams = {...postParams, url:"/blocks/create/newBlock", data: {transaction: tx}}
    const {data} = await axios.request(postParams);
    console.log(data);
    
    expect(Block.isValidBlockStructure(data)).toBe(true);
  })
})