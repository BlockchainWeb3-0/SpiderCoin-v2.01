import fs from "fs";
import merkle from "merkle";
import cryptojs from "crypto-js";
import * as config from "../config";
import { Hash } from "crypto";
import { Transaction } from "../transaction/transaction";

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
	 * - type: BlockHeader(object)
	 * - descpription: Block's detail info
	 * @returns blockHeader's hash or null when blockHeader's type is invalid
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

		// ! returns null when blockHeader's type is invalid
		return null;
	};

	/**
	 * @brief creates and returns genesis block
	 * @returns genesis block which is the first block of blockchain
	 */
	static getGenesisBlock = (): Block => {
		const data: any[] = [config.GENESIS_TRANSACTION_DATA];
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

	/**
	 * @brief Adjusts difficulty when the block generation takes times too short or too long
	 * @returns
	 * - difficulty - 1 when (expected time * 2) < (measured time)
	 * - difficulty + 1 when (expected time / 2) > (measured time)
	 * - difficulty     when it meets expected range
	 */
	static getAdjustDifficulty = (
		lastBlock: Block,
		newBlockTimeStamp: number
	): number => {
		let difficulty = lastBlock.header.difficulty;
		const newBlockCreationInterval =
			newBlockTimeStamp - lastBlock.header.timestamp;
		const diffifcultyAdjustmentTimeInterval =
			config.DIFFICULTY_ADJUSTMENT_INTERVAL_BLOCK *
			config.DIFFICULTY_ADJUSTMENT_INTERVAL_SECOND;
		if (
			lastBlock.header.index % config.DIFFICULTY_ADJUSTMENT_INTERVAL_BLOCK ===
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

	/**
	 * @brief Find new block to calculate hash (increasing nonce each time to match difficulty)
	 * @param lastBlock
	 * @param data
	 * @returns new block which matches difficulty
	 */
	static getNewBlock = (lastBlock: Block, data: any[]): Block | null => {
		const version: string = lastBlock.header.version;
		const index: number = lastBlock.header.index + 1;
		const prevHash: string | null = lastBlock.hash;
		const merkleRoot: string =
			data.length === 0
				? "0".repeat(64)
				: merkle("sha256")
						.sync([JSON.stringify(data)])
						.root();
		let timestamp: number = Math.round(Date.now() / 1000); // seconds
		let difficulty: number = this.getAdjustDifficulty(lastBlock, timestamp);
		let nonce: number = 0;
		if (prevHash === null) {
			// ! exception handling : lastBlock hash could be null
			return null;
		}
		let blockHeader: BlockHeader;
		let hash: string | null;

		//* Find block hash which starts with ("0" * difficulty)
		do {
			timestamp = Math.round(Date.now() / 1000);
			blockHeader = new BlockHeader(
				version,
				index,
				prevHash,
				merkleRoot,
				timestamp,
				difficulty,
				nonce
			);
			hash = this.calHashOfBlock(blockHeader);
			if (hash === null) {
				// ! exception handling : calculated hash could be null
				return null;
			}
			nonce++;
		} while (!hash.startsWith("0".repeat(difficulty)));

		const newBlock = new Block(blockHeader, hash, data);
		return newBlock;
	};

	/**
	 * @brief Validates Block structure
	 * @param block
	 * @returns true for valid / false for invalid
	 */
	static isValidBlockStructure(block: Block): boolean {
		return (
			typeof block.header.version === "string" &&
			typeof block.header.index === "number" &&
			typeof block.header.prevHash === "string" &&
			typeof block.header.merkleRoot === "string" &&
			typeof block.header.timestamp === "number" &&
			typeof block.header.difficulty === "number" &&
			typeof block.header.nonce === "number" &&
			typeof block.data === "object" &&
			typeof block.hash === "string"
		);
	}

	/**
	 * @brief Validates new block's strucure comparing to last block
	 * @param newBlock
	 * @param lastBlock
	 * @returns true for valid new block / false for invalid new block
	 */
	static isValidNewBlock(newBlock: Block, lastBlock: Block): boolean {
		/** check list
		 * 1. version
		 * 2. index
		 * 3. prevHash
		 * 4. merkleRoot
		 * 5. timestamp
		 * 6. difficulty
		 */
		if (!this.isValidBlockStructure(newBlock)) {
			console.log("Invalid block structure");
			return false;
		}
		if (newBlock.header.version !== lastBlock.header.version) {
			console.log("Invalid version");
			return false;
		}
		if (newBlock.header.index !== lastBlock.header.index + 1) {
			console.log("Invalid index");
			return false;
		}
		if (newBlock.header.prevHash !== lastBlock.hash) {
			console.log("Invalid prevHash");
			return false;
		}
		if (
			(newBlock.data.length === 0 &&
				newBlock.header.merkleRoot !== "0".repeat(64)) ||
			(newBlock.data.length !== 0 &&
				newBlock.header.merkleRoot !==
					merkle("sha256")
						.sync([JSON.stringify(newBlock.data)])
						.root())
		) {
			console.log("Invalid merkleRoot or data");
			return false;
		}
		if (newBlock.header.timestamp <= lastBlock.header.timestamp) {
			console.log("Invalid timestamp");
			return false;
		}
		if (
			newBlock.hash === null ||
			!newBlock.hash.startsWith("0".repeat(newBlock.header.difficulty))
		) {
			console.log("Invalid new block's hash or difficulty");
			return false;
		}
		return true;
	}
}

export { Block, BlockHeader };
