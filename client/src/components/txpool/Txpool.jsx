import { Button } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import Tx from "../transaction/Tx";
import "./txpool.scss";

const Txpool = () => {
	const [txList, setTxList] = useState([]);
	const txpoolParams = {
		method: "get",
		baseURL: `http://localhost:3001`,
		url: "/transaction/txpool",
	};

  const mineParams = {
    method: "post",
    baseURL: "http://localhost:3001",
    url: "/blocks/mineBlock",
  }
  
  const handleOnClick = async () => {
    const result = await axios.request(mineParams);
    window.location.reload();
  }

	useEffect(() => {
		getTxpool();
	}, []);

	const getTxpool = async () => {
		const { data } = await axios.request(txpoolParams);
		setTxList(data);
		console.log(data);
	};

	return (
		<div className="txpool-container">
			<div className="title">Txpool</div>
			<div className="sub-contents">
				<span>total counts : {txList.length}</span>
				<Button variant="contained" color="success" onClick={handleOnClick}>
					Mining
				</Button>
			</div>
			<div>
				{txList.map((tx, index) => (
					<Tx tx={tx} index={index} key={tx.id} />
				))}
			</div>
		</div>
	);
};

export default Txpool;
