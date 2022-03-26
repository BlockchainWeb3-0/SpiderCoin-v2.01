import { Block } from "./block";

import _ from "lodash";
import UnspentTxOutput from "../transaction/unspentTxOutput";
import Transaction from "../transaction/transaction";
import GlobalVar from "../globalVar";
import { broadcastLastBlock } from "../../server_p2p/p2pServer";
import TransactionPool from "../transaction/transactionPool";

export default class Blockchain {
	blocks: Block[];

	constructor() {
		this.blocks = [Block.getGenesisBlock()];
	}

	getLastBlock = (): Block => {
		return this.blocks[this.blocks.length - 1];
	};

	getFirstBlock = (): Block => {
		return this.blocks[0];
	};

	findBlock = (hash: string): Block | undefined => {
		return this.blocks.find((block) => block.hash === hash);
	}

	/**
	 * @brief Add block to blockchain after validation
	 * @param newBlock
	 * @returns true when added successfully
	 */
	addBlock = (newBlock: Block): boolean => {
		const lastBlock: Block = this.getLastBlock();

		// ! exception handling : new block could be null
		if (newBlock === null) {
			console.log("Invalid newBlock");
			return false;
		}

		if (!Block.isValidNewBlock(newBlock, lastBlock)) {
			return false;
		}

		this.blocks.push(newBlock);

		// ! exception handling : UTXO list could be null
		if (GlobalVar.utxoList === null) {
			console.log("Invalid transaction in blockchain");
			return false;
		}

		const updateUtxoList = UnspentTxOutput.validateAndUpdateUtxoList(
			newBlock.data,
			GlobalVar.utxoList,
			newBlock.header.index
		);
		if (updateUtxoList === null) {
			console.log("Faild to validate and update UTXO list");
			return false;
		}
		GlobalVar.utxoList = updateUtxoList;
		GlobalVar.txpool.txList = TransactionPool.removeInvalidTxsFromTxpool(
			updateUtxoList,
			GlobalVar.txpool.txList
		);

		return true;
	};

	mineBlock = (newBlock: Block, txListForMining: Transaction[], utxoList: UnspentTxOutput[],) => {
		const miningResult: boolean = GlobalVar.blockchain.addBlock(newBlock);
		if (miningResult) {
			console.log("Mining new Block is done successfully");
			broadcastLastBlock();
		} else {
			console.log("Mining failed");
		}
	}

	/**
	 * @brief Replace blockchain with new blockchain from other node
	 * @param newBlocks
	 * @returns true when replaced successfully
	 */
	replaceBlocks = (newBlocks: Block[]): boolean => {
		if (!Blockchain.isValidBlocks(newBlocks)) {
			console.log("Invalid Blocks");
			return false;
		}

		this.blocks = newBlocks;
		return true;
	};


	/********************************/
	/***** Validation Functions *****/
	/********************************/

	/**
	 * @brief Validates blockchain
	 * @param blocks
	 * @returns true for valid blockchain
	 */
	static isValidBlocks = (blocks: Block[]): boolean => {
		/**	check list
		 * 1. genesis block === first block
		 * 2. validates each block
		 * 3. Validate and update UTXOs (Unspent Transaction Outputs)
		 */
		if (JSON.stringify(blocks[0]) !== JSON.stringify(Block.getGenesisBlock())) {
			console.log("Invalid genesis block");
			return false;
		}

		let utxoList: UnspentTxOutput[] | null = [];
		for (let i = 1; i < blocks.length; i++) {
			const currentBlock: Block = blocks[i];
			const prevBlock: Block = blocks[i - 1];
			if (!Block.isValidNewBlock(currentBlock, prevBlock)) {
				return false;
			}
			utxoList = UnspentTxOutput.validateAndUpdateUtxoList(
				currentBlock.data,
				utxoList,
				currentBlock.header.index
			);
			// ! exception handling : UTXO list could be null
			if (utxoList === null) {
				console.log("Invalid transaction in blockchain");
				return false;
			}
		}
		GlobalVar.utxoList = utxoList;
		GlobalVar.txpool.txList = TransactionPool.removeInvalidTxsFromTxpool(
			utxoList,
			GlobalVar.txpool.txList
		);
		return true;
	};

	static isValidBlockTxData = (
		txData: Transaction[],
		utxoList: UnspentTxOutput[],
		blockIndex: number
	): boolean => {
		/**
		 * 1. first Tx must be reward tranasction
		 * 2. check if there are duplicate transactions
		 * 3. validates normal transactions 
		 */

		// 1. first Tx must be reward tranasction
		const firstTx = txData[0];
		if (!Transaction.isValidRewardTx(firstTx, blockIndex)) {
			console.log("Invalid reward Tx!");
			return false;
		}
		
		// 2. check if there are duplicate transactions
		if (Transaction.hasDuplicateTx(txData) ) {
			console.log("Invalid Tx Data. Found duplicate tx.");
			return false;
		}

		// 3. validates normal transactions 
		const normalTxList: Transaction[] = txData.slice(1);
		const isValidNormalTxList = normalTxList
			.map((tx) => Transaction.isValidTx(tx, utxoList))
			.reduce((a, b) => a && b, true);

		return (
			isValidNormalTxList
		);
	};
}
