import axios from "axios";

describe("Peer Router test", () => {
	let getParams: object;
	let postParams: object;
	beforeAll(async() => {
		getParams = {
			method: "get",
			baseURL: "http://localhost:3001",
			url: "/peer",
		};

		postParams = {
			method: "post",
			baseURL: "http://localhost:3001",
			url: "/peer",
			data: {
				peer: [],
			},
		};
    const onGetParams: object = { ...getParams, url: "/peer/on" };
    const resultOnGet = await axios.request(onGetParams);
	});

	afterAll(async () => {
		const offGetParams: object = { ...getParams, url: "/peer/off" };
		const resultOffGet = await axios.request(offGetParams);
	});

	test("POST: /add", async () => {
		const addPostParams = {
			...postParams,
			url: "/peer/add",
			data: { peer: "ws://localhost:6002" },
		};

    const resultAddPost = await axios.request(addPostParams);
    expect(resultAddPost.data).toBe("ws://localhost:6002")
	});
});
