import Wallet from "../wallet";
import * as config from "../../config";
import GlobalVar from "../../globalVar";

describe("wallet test", ()=>{
  describe("toHexString func test", () => {
    let decimalArray: number[];
    test("10 would be 0a", () => {
      decimalArray = [10]
      const hexString = Wallet.decimalArrayToHexString(decimalArray);
      expect(hexString).toBe("0a");
    });
    test("[38, 12, 60] would be 260c3c", () => {
      decimalArray = [38, 12, 60]
      const hexString = Wallet.decimalArrayToHexString(decimalArray);
      expect(hexString).toBe("260c3c");
    });
  })
  describe("getBalance function test", () => {
    test("Balance of the address that has Genesis Block reward === 50", () => {
      if (GlobalVar.utxoList)
      expect(
        Wallet.getBalance(
          config.GENESIS_TRANSACTION_DATA.txOuts[0].address,
          GlobalVar.utxoList
        )
      ).toBe(50);
    })
  })
})