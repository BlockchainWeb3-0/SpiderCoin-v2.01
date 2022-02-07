import axios from "axios";
import UnspentTxOutput from "../../blockchain/transaction/unspentTxOutput";
import Wallet from "../../blockchain/wallet/wallet";

describe("UTXO Router test", () => {
	let receiverAddress: string;
	let sendingAmount: number;
	let senderAddress: string;
	let privateKey: string;
	
	beforeAll(async () => {
		// create test utxo list
		const params: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/create/test",
		};
		await axios.request(params);
	});
	beforeEach(() => {
		receiverAddress = Wallet.generatePrivatePublicKeys().publicKey;
		senderAddress = Wallet.getPulicKeyFromWallet();
		privateKey = Wallet.getPrivateKeyFromWallet();
		sendingAmount = 10;
	});

	// * get specific address's utxo list from whole utxo list
	describe("utxos Router test", () => {
		test("GET : /:address", async () => {
			const params: object = {
				method: "get",
				baseURL: "http://localhost:3001",
				url: `/utxos/${senderAddress}`,
			};
			const result = await axios.request(params);
			const myUtxoList: UnspentTxOutput[] = result.data;

			for (let i = 0; i < myUtxoList.length; i++) {
				expect(myUtxoList[i].address).toBe(senderAddress);
			}
		});
	});

	afterAll(async () => {
		// clear utxo list
		const params: object = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/utxos/clear/test",
		};
		await axios.request(params);
	});
});
