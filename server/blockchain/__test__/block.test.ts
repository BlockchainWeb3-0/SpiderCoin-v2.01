import { BlockHeader } from "../block";

describe("Block header class validation", () => {
  let blockHeader: BlockHeader;
  let version: string;
	let index: number;
	let prevHash: string;
	let merkleRoot: string;
	let timestamp: number;
	let difficulty: number;
	let nonce: number;
  beforeEach(() => {
    blockHeader = new BlockHeader(
      version = "2.0.1",
      index = 1,
      prevHash = "0".repeat(64),
      merkleRoot = "0".repeat(64),
      timestamp = 1643001789,
      difficulty = 3,
      nonce = 100,
    )
  })

  test("Block header's structure validation", () => {
    expect(typeof blockHeader.version).toBe("string");
    expect(typeof blockHeader.index).toBe("number");
    expect(typeof blockHeader.prevHash).toBe("string");
    expect(typeof blockHeader.merkleRoot).toBe("string");
    expect(typeof blockHeader.timestamp).toBe("number");
    expect(typeof blockHeader.difficulty).toBe("number");
    expect(typeof blockHeader.nonce).toBe("number");
  })
})