import Wallet from "../wallet";

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
})