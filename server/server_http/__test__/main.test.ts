import axios from "axios";

describe("Rotuers test", () => {

  let routerParams: object;

	beforeEach(() => {
    routerParams = {
      method: "get",
      baseURL: "http://localhost:3001",
    };
	});

	// * transactionRouter
	describe("transaction router connection test", () => {
		test("GET: /transaction/", async () => {
			routerParams = {...routerParams, url: "/transaction"}
			const result = await axios.request(routerParams);
			
			expect(result.status).toBe(200);
		});
	});

	// * utxosRouter
	describe("utxos Router connection test", () => {
		test("GET : /utxos", async () => {
			routerParams = {...routerParams, url: "/utxos"}
			const result = await axios.request(routerParams);
      
      expect(result.status).toBe(200);
		});
	});
});

