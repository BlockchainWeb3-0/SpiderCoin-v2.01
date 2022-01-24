import merkle from "merkle";
import { Block } from "./block";
import * as config from "./config";

import _ from "lodash";

class Blockchain {
	chain: Block[];

	constructor() {
		this.chain = [Block.getGenesisBlock()];
	}

	getLastBlock(): Block {
		return this.chain[this.chain.length - 1];
	}

	getFirstBlock(): Block {
		return this.chain[0];
	}

	/**
	 * @brief Add block to blockchain after validation
	 * @param data
	 * - type: object(any[])
	 * - description: new block's body data
	 * @returns
	 */
	addBlock(data: any[]): Block | null {
		const lastBlock: Block = this.getLastBlock();
		const newBlock: Block | null = Block.mineNewBlock(lastBlock, data);
		if (newBlock === null) {
			return null;
		}

		return newBlock;
	}

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
	 * @brief Validates new block's strucure and header's info(such as prevHash, merkleRoot, ...)
	 * @param newBlock
	 * @param lastBlock
	 * @returns true for valid new block / false for invalid new block
	 */
	static isValidNewBlock(newBlock: Block, lastBlock: Block): boolean {
		/**
		 * 1. version
		 * 2. index
		 * 3. prevHash
		 * 4. merkleRoot
		 * 5. timestamp
		 * 6. difficulty
		 */
		if (!this.isValidBlockStructure(newBlock)) {
			console.log("isValidNewBlock() : Invalid block structure");
			return false;
		}
		if (newBlock.header.version !== lastBlock.header.version) {
			console.log("isValidNewBlock() : Invalid version");
			return false;
		}
		if (newBlock.header.index !== lastBlock.header.index + 1) {
			console.log("isValidNewBlock() : Invalid index");
			return false;
		}
		if (newBlock.header.prevHash !== lastBlock.hash) {
			console.log("isValidNewBlock() : Invalid prevHash");
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
			console.log("isValidNewBlock() : Invalid merkleRoot or data");
			return false;
		}
		if (newBlock.header.timestamp <= lastBlock.header.timestamp) {
			console.log("isValidNewBlock() : Invalid timestamp");
			return false;
		}
		if (
			newBlock.hash === null ||
			newBlock.hash.startsWith("0".repeat(newBlock.header.difficulty))
		) {
			console.log("isValidNewBlock() : Invalid new block's hash or difficulty");
			return false;
		}
		return true;
	}

  // static isValidChain = (blockchain: Block[] | Blockchain): boolean => {

  // }
}
