import axios from "axios";
import { Block } from "../../blockchain/structure/block";
import Transaction from "../../blockchain/transaction/transaction";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
import Wallet from "../../blockchain/wallet/wallet";

describe("Blocks Router test", () => {
	let receiverAddress: string;
	let sendingAmount: number;
	let minerAddress: string;
	let getParams: object;
	let postParams: object;
	let newTx: Transaction;

	let allUtxoList: UnspentTxOutput[];

	let minedBlock: Block;
	let lastBlock: Block;
  let lastBlockHash: string;

	beforeAll(async () => {
		// create test utxo list
		const createUtxoParams: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/create/test",
		};
		await axios.request(createUtxoParams);

		const getUtxoParams: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos",
		};
		const getUtxoResult = await axios.request(getUtxoParams);
		allUtxoList = getUtxoResult.data;

		receiverAddress = Wallet.generatePrivatePublicKeys().publicKey;
		minerAddress = Wallet.getPulicKeyFromWallet();
		sendingAmount = 10;

		const createTxParams: object = {
			method: "post",
			baseURL: "http://localhost:3001",
			url: "/transaction/create",
			data: {
				receiverAddress,
				sendingAmount,
			},
		};
		const createTxResult = await axios.request(createTxParams);
		newTx = createTxResult.data;

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
				transaction: [],
			},
		};

		const mineBlockPostParams = {
			...postParams,
			url: "/blocks/mineBlock",
			data: { minerAddress },
		};
		const mineBlockResult = await axios.request(mineBlockPostParams);
		const getLastBlockGetParams = { ...getParams, url: "/blocks/lastBlock" };
		const getLastBlocksResult = await axios.request(getLastBlockGetParams);
		minedBlock = mineBlockResult.data;
		lastBlock = getLastBlocksResult.data;
    lastBlockHash = lastBlock.hash;
	});

	test("First block must be a genesis block", async () => {
		const result = await axios.request(getParams);

		expect(result.data.blocks[0]).toEqual(Block.getGenesisBlock());
	});

	test("mined block === last block of blockchain", () => {
		expect(minedBlock).toEqual(lastBlock);
	});

	test("mined Block is valid", () => {
		expect(Block.isValidBlockStructure(minedBlock)).toBe(true);
	})

	test("Find a block using block's hash", async () => {
    const getBlockParams = {...getParams, url: `/blocks/findBlock/${lastBlockHash}`}
    const getBlockResult = await axios.request(getBlockParams)    
    expect(getBlockResult.data).toEqual(lastBlock);
  });
});
