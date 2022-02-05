import axios from "axios";
import GlobalVar from "../../blockchain/globalVar";
import { Block } from "../../blockchain/structure/block";
import Transaction from "../../blockchain/transaction/transaction";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
import Wallet from "../../blockchain/wallet/wallet";

describe("Blocks Router test", () => {
	let receiverAddress: string;
	let sendingAmount: number;
	let senderAddress: string;
	let privateKey: string;
	let getParams: object;
	let postParams: object;
	let tx: Transaction;

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
		senderAddress = Wallet.getPulicKeyFromWallet();
		privateKey = Wallet.getPrivateKeyFromWallet();
		sendingAmount = 10;

		const createTxParams: object = {
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
		const createTxResult = await axios.request(createTxParams);
		tx = createTxResult.data;

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
			data: { txList: [tx] },
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

	test("mined block === last block of blockchain", async () => {
		expect(minedBlock).toEqual(lastBlock);
	});

	test("Get a block using block's hash", async () => {
    const getBlockParams = {...getParams, url: `/blocks/getBlock/${lastBlockHash}`}
    const getBlockResult = await axios.request(getParams)
    expect(getBlockResult.data).toBe(lastBlock);
  });

	afterAll(async () => {
		// clear utxo list
		const params: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/clear/test",
		};
		await axios.request(params);
	});
});
