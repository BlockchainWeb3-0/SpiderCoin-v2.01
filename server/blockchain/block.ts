import fs from "fs";
import merkle from "merkle";
import cryptojs from "crypto-js";
import * as config from "./config";

/**
 * @brief Block's header class
 * @version
 * - type: string
 * - description: version of this project
 * @index
 * - type: number
 * - description: block's index
 * @prevHash
 * - type: string
 * - description: previous block's hash
 * @merkleRoot
 * - type: string
 * - description: merkle root of block's data
 * @timestamp
 * - type: number
 * - description: block creation time (seconds)
 * @difficulty
 * - type: number
 * - description: block mining difficulty
 * @nonce
 * - type: number
 * - description: using this number to mine block
 */
class BlockHeader {
	public version: string;
	public index: number;
	public prevHash: string;
	public merkleRoot: string;
	public timestamp: number;
	public difficulty: number;
	public nonce: number;

	constructor(
		version: string,
		index: number,
		prevHash: string,
		merkleRoot: string,
		timestamp: number,
		difficulty: number,
		nonce: number
	) {
		this.version = version;
		this.index = index;
		this.prevHash = prevHash;
		this.merkleRoot = merkleRoot;
		this.timestamp = timestamp;
		this.difficulty = difficulty;
		this.nonce = nonce;
	}
}

/**
 * @brief Block class
 * @header
 * - type: BlockHeader(Object)
 * - description: contains detail of block's info (version, index, prevHash ...)
 * @hash
 * - type: string
 * - description: calculated SHA256 hash value using this BlockHeader
 * @data
 * - type: array
 * - description: contains block's data such as Transactions
 */
class Block {
	public header: BlockHeader;
	public hash: string | null;
	public data: any[];

	constructor(header: BlockHeader, hash: string | null, data: any[]) {
		this.header = header;
		if (hash === null) {
			this.hash = "0".repeat(64);
		} else {
		}
		this.hash = hash;
		this.data = data;
	}

	/**
	 * @brief Get version of "package.json" file's version
	 * @returns version of this project
	 */
	static getVersion = (): string => {
		const packageJson: string = fs.readFileSync("package.json", "utf-8");
		const version: string = JSON.parse(packageJson).version;
		return version;
	};

	/**
	 * @brief Calculation hash of Block(SHA256)
	 * @param blockHeader
	 * @returns blockHeader's hash or null when error occurred
	 */
	static calHashOfBlock = (blockHeader: BlockHeader): string | null => {
		if (typeof blockHeader === "object") {
			const blockString: string =
				blockHeader.version +
				blockHeader.index +
				blockHeader.prevHash +
				blockHeader.merkleRoot +
				blockHeader.timestamp +
				blockHeader.difficulty +
				blockHeader.nonce;
			const hash = cryptojs.SHA256(blockString).toString();
			return hash;
		}
		console.log("calHashOfBlock : Invalid BlockHeader");

		// ! returns null when error occurred
		return null;
	};

	static getGenesisBlock = (): Block => {
		const data: any[] = [config.genesisTransactionData];
		const header = new BlockHeader(
			Block.getVersion(),
			0,
			"0".repeat(64),
			merkle("sha256")
				.sync([JSON.stringify(data)])
				.root() || "0".repeat(64),
			1643001489,
			config.INITIAL_DIFFICULTY,
			0
		);
		const hash = this.calHashOfBlock(header);
		const genesisBlock = new Block(header, hash, data);
		return genesisBlock;
	};

	static getAdjustDifficulty = (lastBlock: Block, newBlock: Block): number => {
		let difficulty = lastBlock.header.difficulty;
		const newBlockCreationInterval =
			newBlock.header.timestamp - lastBlock.header.timestamp;
		const diffifcultyAdjustmentTimeInterval =
			config.DIFFICULTY_ADJUSTMENT_INTERVAL_BLOCK *
			config.DIFFICULTY_ADJUSTMENT_INTERVAL_SECOND;
		if (
			newBlock.header.index % config.DIFFICULTY_ADJUSTMENT_INTERVAL_BLOCK ===
				0 &&
			lastBlock.header.index !== 0
		) {
			if (newBlockCreationInterval * 2 < diffifcultyAdjustmentTimeInterval) {
				return --difficulty;
			} else if (
				newBlockCreationInterval / 2 >
				diffifcultyAdjustmentTimeInterval
			) {
				return ++difficulty;
			}
		}
		return difficulty;
	};
}

export { Block, BlockHeader };
