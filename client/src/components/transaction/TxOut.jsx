import React from "react";

const TxOut = ({ txOut, index }) => {
	return (
		<div className="txOut-contents">
			<div className="elem">
				<b className="txOut-title">txOut{index}</b>
			</div>
			<div className="elem">
				<b>address : </b> {txOut.address}
			</div>
			<div className="elem">
				<b>amount : </b> {txOut.amount}
			</div>
		</div>
	);
};

export default TxOut;
