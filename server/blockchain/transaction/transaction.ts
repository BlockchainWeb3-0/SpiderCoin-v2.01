import cryptojs from "crypto-js";
import _ from "lodash";
import UnspentTxOutput from "./unspentTxOutput";
import Wallet from "../wallet/wallet";
import * as config from "../config";
import TransactionPool from "./transactionPool";
import TxIn from "./transactionInput";
import TxOut from "./transactionOutput";


/**
 * @brief Transaction class including id, txIns, txOuts
 * @id
 * - type: string
 * - description: encrypted hash value fo txIns contents and txOuts contents(except signature)
 * @txIns
 * type TxIn[]
 * @txOuts
 * type TxOut[]
 */
export default class Transaction {
  public id: string;
  public txIns: TxIn[];
  public txOuts: TxOut[];

  constructor(id: string, txIns: TxIn[], txOuts: TxOut[]) {
    this.id = id;
    this.txIns = txIns;
    this.txOuts = txOuts;
  }

  /**
   * @brief Calculate transaction using transaction inputs' contents and outputs' contents (except signatures)
   * @param tx transaction
   * @returns transacion Id
   */
  static calTxId(tx: Transaction): string {
    const txInContents = tx.txIns
      .map((txIn) => txIn.txOutId + txIn.txOutIndex)
      .reduce((a, b) => a + b, "");
    const txOutContents = tx.txOuts
      .map((txOut) => txOut.address + txOut.amount)
      .reduce((a, b) => a + b, "");

    const txId = cryptojs.SHA256(txInContents + txOutContents).toString();
    return txId;
  }

  /**
   * @brief Creates reward transaction for node who succeed mining
   * @param minerAddress
   * @param blockIndex
   * @returns reward transaction which does not have txInput
   */
  static createRewardTx = (
    minerAddress: string,
    blockIndex: number
  ): Transaction => {
    // * reward transaction does not have transaction input.

    // create empty txIn to make Transation class
    const rewardTxIn = new TxIn("", blockIndex, "", 0);
    const rewardTxOut = new TxOut(minerAddress, config.MINING_REWARD);

    const rewardTx = new Transaction("", [rewardTxIn], [rewardTxOut]);
    rewardTx.id = this.calTxId(rewardTx);

    return rewardTx;
  };

  /**
   * @brief Find available UTxOs and create new transaction with signature
   * @param receiverAddress
   * @param sendingAmount
   * @param senderAddress
   * @param privateKey
   * @param utxoList
   * @param txpool
   * @returns
   */
  static createTx = (
    receiverAddress: string,
    sendingAmount: number,
    senderAddress: string,
    privateKey: string,
    utxoList: UnspentTxOutput[],
    txpool: Transaction[]
  ): Transaction | null => {
    // 1. Gets myUtxoList from utxoList
    if (senderAddress !== Wallet.getPublicKeyFromPrivateKey(privateKey)) {
      console.log("Sender's address and privateKey are not paired.");
      return null;
    }

    const myUtxoList: UnspentTxOutput[] = UnspentTxOutput.findMyUtxoList(
      senderAddress,
      utxoList
    );

    // 2. Checks if myUtxo is already used and filter it
    const avaliableMyUtxoList: UnspentTxOutput[] =
      UnspentTxOutput.filterConsumedMyUtxoList(myUtxoList, txpool);

    // 3. Gets available UTxOs equal to or greater than sending amount
    const { utxoListToBeUsed, leftOverAmount } =
      UnspentTxOutput.getUtxosForSending(avaliableMyUtxoList, sendingAmount);

    // ! Exceptio handling : cannot create transaction from the available UTxO list
    if (utxoListToBeUsed === null || leftOverAmount === null) {
      return null;
    }

    // 4. Creates Transaction without Id and signatures
    const newUnsignedTxIns: TxIn[] = TxIn.getUnSginedTxInList(utxoListToBeUsed);
    const newTxOuts: TxOut[] = TxOut.createTxOuts(
      receiverAddress,
      sendingAmount,
      senderAddress,
      leftOverAmount
    );

    // 5. Calculates Transaction Id
    const newUnsignedTx: Transaction = new Transaction(
      "",
      newUnsignedTxIns,
      newTxOuts
    );
    newUnsignedTx.id = Transaction.calTxId(newUnsignedTx);

    // 6. Gets Transaction Inputs' signature
    const newSignedTx: Transaction = { ...newUnsignedTx };
    const newSignedTxIns = TxIn.getSignedTxInList(
      newUnsignedTx.txIns,
      utxoListToBeUsed,
      privateKey,
      newUnsignedTx.id
    );
    newSignedTx.txIns = newSignedTxIns;

    // 7. Add newSignedTx into Transaction pool
    TransactionPool.addTxToTxpool(newSignedTx, utxoList, txpool);
    return newSignedTx;
  };

  static createTxListForMining = (minerAddress: string, miningReward: number, lastBlockIndex: number, txpool: Transaction[]): Transaction[] => {
    const rewardTx: Transaction = this.createRewardTx(minerAddress, lastBlockIndex + 1);
    const txListForMining: Transaction[] = [rewardTx, ...txpool]
    return txListForMining;
  }

  /********************************/
  /***** Validation Functions *****/
  /********************************/

  static isValidTxStructure = (tx: Transaction): boolean => {
    /**
     * Validates
     * 1. null or undefined
     * 2. type of id
     * 3. type of txIns and txIn
     * 4. type of txOuts and txOut
     */
    if (tx === null || tx === undefined) {
      console.log("Transcation is null or undefined");
      return false;
    }
    if (typeof tx.id !== "string") {
      console.log("Wrong type of transaction id");
      return false;
    }

    if (!(tx.txIns instanceof Array)) {
      console.log("Wrong type of txIns");
      return false;
    }

    const isValidTxInStructure: boolean = tx.txIns
      .map((txIn) => TxIn.isValidTxInStructure(txIn))
      .reduce((a, b) => a && b, true);
    if (!isValidTxInStructure) {
      console.log("Wrong type of txIn found");
      return false;
    }

    if (!(tx.txOuts instanceof Array)) {
      console.log("Wrong type of txOuts");
      return false;
    }
    const isValidTxOutStructure: boolean = tx.txIns
      .map((txIn) => TxIn.isValidTxInStructure(txIn))
      .reduce((a, b) => a && b, true);
    if (!isValidTxOutStructure) {
      console.log("Wrong type of txOut found");
      return false;
    }

    return true;
  };

  static isValidTxListStructure = (txList: Transaction[]): boolean => {
    return txList
      .map((tx) => this.isValidTxStructure(tx))
      .reduce((a, b) => a && b, true);
  };

  /**
   * @brief Validates transaction
   * @param tx transaction to validate
   * @param utxoList Unspent Tx Output list for transaction input
   * @returns true if transaction is valid
   */
  static isValidTx = (
    tx: Transaction,
    utxoList: UnspentTxOutput[]
  ): boolean => {
    // compare tx id with calculated one
    if (tx.id !== Transaction.calTxId(tx)) {
      console.log("Invalid transaction Id");
      return false;
    }

    // validate txIns
    const isValidTxIns = tx.txIns
      .map((txIn) => TxIn.isValidTxIn(tx.id, txIn, utxoList))
      .reduce((a, b) => a && b, true);

    if (!isValidTxIns) {
      console.log("Invalid txIn found");
      console.log(`Transcation id : ${tx.id}`);
      return false;
    }

    // validate txOuts
    const isValidTxOuts = tx.txOuts
      .map((txOut) => TxOut.isValidTxOut(txOut))
      .reduce((a, b) => a && b, true);

    if (!isValidTxOuts) {
      console.log("Invalid txOut found");
      console.log(`Transcation id : ${tx.id}`);
      return false;
    }

    // check if txIns total amount === txOuts total amount
    const txInsTotalAmount = TxIn.getTxInsTotalAmount(tx.txIns);
    const txOutsTotalAmount = tx.txOuts
      .map((txOut) => txOut.amount)
      .reduce((a, b) => a + b, 0);
    if (txInsTotalAmount !== txOutsTotalAmount) {
      console.log("Invalid total amount from txIns or txOut");
      console.log(`Invalid transaciont Id : ${tx.id}`);
      return false;
    }

    return true;
  };

  static isValidRewardTx = (
    rewardTx: Transaction,
    blockIndex: number
  ): boolean => {
    if (rewardTx === null) {
      console.log("Invalid reward transaction");
      return false;
    }

    if (this.calTxId(rewardTx) !== rewardTx.id) {
      console.log(`Invalid reward transaction id: ${rewardTx.id}`);
      return false;
    }

    if (rewardTx.txIns.length !== 1) {
      console.log("Must be only one txOut in reward transaction");
      return false;
    }

    if (rewardTx.txIns[0].txOutIndex !== blockIndex) {
      console.log("Invalid block hegiht");
      return false;
    }

    if (rewardTx.txOuts.length !== 1) {
      console.log("Must be only one txOut in reward transaction");
      return false;
    }

    if (rewardTx.txOuts[0].amount !== config.MINING_REWARD) {
      console.log("Invalid reward amount");
      return false;
    }

    return true;
  };

  static hasDuplicateTx = (txList: Transaction[]): boolean => {
    const txIns: TxIn[] = txList
      .map((tx) => tx.txIns)
      .reduce((a, b) => a.concat(b), []);
    let countDuplicates: any = {};
    txIns.forEach((txIn) => {
      countDuplicates[txIn.txOutId + txIn.txOutIndex] =
        (countDuplicates[txIn.txOutId + txIn.txOutIndex] || 0) + 1;
    });
    for (const key in countDuplicates) {
      if (countDuplicates[key] > 1) {
        console.log(`Duplicate Tx found: ${key}`);
        return true;
      }
    }

    return false;
  };
}
