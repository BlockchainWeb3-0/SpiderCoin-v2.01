import Blockchain from "./structure/blockchain";

export default class GlobalVar {
  static blockchain: Blockchain = new Blockchain();
}