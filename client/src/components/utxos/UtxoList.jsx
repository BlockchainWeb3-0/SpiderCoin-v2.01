import axios from "axios";
import React, { useEffect, useState } from "react";
import Utxo from "./Utxo";

import "./utxoList.scss"

const UtxoList = () => {
	const [utxoList, setUtxoList] = useState([]);
	const params = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/utxos/",
	};

	useEffect(() => {
		getUtxoList();
	}, []);

	const getUtxoList = async () => {
		const { data } = await axios.request(params);
		setUtxoList(data);
		console.log(data);
	};

	return (
		<div className="utxoList-container">
			<div className="title">Unspent Transaction Output List</div>
      <div className="total">total counts : {utxoList.length}</div>
			<div>
				{utxoList.map((utxo, index) => (
					<Utxo utxo={utxo} index={index} key={index} />
				))}
			</div>
		</div>
	);
};

export default UtxoList;
