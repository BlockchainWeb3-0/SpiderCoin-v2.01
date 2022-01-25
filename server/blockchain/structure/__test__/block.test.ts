import merkle from "merkle";
import { Block, BlockHeader } from "../block";

describe("Block class validation", () => {
	let blockHeader: BlockHeader;
  let data1: any[];
  let data2: any[];
  let merkleRoot1: string;
  let merkleRoot2: string;
  let blockChain: Block[];
  let lastBlock: Block;
  let newBlock: Block | null;
	beforeEach(() => {
    // * Creates lastBlock
    data1 = [{ id: "1", txIns: [{txOutId : "1", txOutIndex: 1}], txOuts:[{address: "add1", amount: 10}]}];
    merkleRoot1 = merkle("sha256").sync([JSON.stringify(data1)]).root();
		blockHeader = new BlockHeader(
      ("2.0.1"),
			(1),
			("0".repeat(64)),
			merkleRoot1,
			1643001789,
			3,
			100,
      );
    lastBlock = new Block(blockHeader, merkleRoot1, data1);

    // * Creates new Block using function, getNewBlock()
    data2 = [{ id: "2", txIns: [{txOutId : "2", txOutIndex: 2}], txOuts:[{address: "add2", amount: 20}]}];
    newBlock = Block.getNewBlock(lastBlock, data2);
	});

	test("Validates new block's type", () => {
    // ! exception handling
    // if newBlock is null, always fail this test
    if(newBlock === null) {
      return expect(newBlock).not.toBe(null)
    }

		expect(typeof newBlock.header.version).toBe("string");
		expect(typeof newBlock.header.index).toBe("number");
		expect(typeof newBlock.header.prevHash).toBe("string");
		expect(typeof newBlock.header.merkleRoot).toBe("string");
		expect(typeof newBlock.header.timestamp).toBe("number");
		expect(typeof newBlock.header.difficulty).toBe("number");
		expect(typeof newBlock.header.nonce).toBe("number");
	});

	test("Compare new block to lastBlock", () => {
    // ! exception handling
    // if newBlock is null, always fail this test
    if(newBlock === null) {
      return expect(newBlock).not.toBe(null)
    }

		expect(newBlock.header.version).toBe(lastBlock.header.version);
		expect(newBlock.header.index).toBe(lastBlock.header.index + 1);
		expect(newBlock.header.prevHash).toBe(lastBlock.hash);
		expect(newBlock.header.timestamp).toBeGreaterThan(lastBlock.header.timestamp);
	});

	test("Compare merkle Root to calculated one", () => {
    // ! exception handling
    // if newBlock is null, always fail this test
    if(newBlock === null) {
      return expect(newBlock).not.toBe(null)
    }

    const calculatedMerkleRoot = merkle("sha256").sync([JSON.stringify(data2)]).root();
    expect(newBlock.header.merkleRoot).toBe(calculatedMerkleRoot)
	});
});
