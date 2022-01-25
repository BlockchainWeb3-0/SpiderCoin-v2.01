import { Block } from "../block";
import { Blockchain } from "../blockchain";

describe("Blockchain validation", () => {
	let blockchain: Blockchain;
	let data: any[];
	let dataCorrupted: any[];
	let lastBlock: Block;
	let newBlock: Block | null;
	beforeEach(() => {
		blockchain = new Blockchain();
		data = [
			{
				id: "1",
				txIns: [{ txOutId: "1", txOutIndex: 1, signature: "sign1" }],
				txOuts: [{ address: "add1", amount: 10 }],
			},
		];
		dataCorrupted = [
			{
				id: "2",
				txIns: [{ txOutId: "2", txOutIndex: 2, signature: "sign2" }],
				txOuts: [{ address: "add2", amount: 10 }],
			},
		];
		lastBlock = blockchain.getLastBlock();
		newBlock = Block.getNewBlock(lastBlock, data);
		if (newBlock !== null) {
			blockchain.addBlock(newBlock);
		}
	});

	test("First block is genesis block", () => {
		expect(blockchain.blocks[0]).toEqual(Block.getGenesisBlock());
	});

	test("Add new block into blockchain", () => {
		expect(blockchain.getLastBlock()).toEqual(newBlock); // 여기서 isValidNewBlock의 오류 찾아냄!
	});

	test("corrupted block data => false", () => {
		lastBlock.data = dataCorrupted;
		expect(Blockchain.isValidBlocks(blockchain.blocks)).toBeFalsy();
	});
});
