import React from "react";

const TxIn = ({ txIn, index }) => {
	return (
		<div className="txIn-contents">
			<div className="elem">
				<b className="txIn-title">txIn{index}</b>
			</div>
			<div className="elem">
				<b>signature : </b> {txIn.signature}
			</div>
			<div className="elem">
				<b>txOutId : </b> {txIn.txOutId}
			</div>
			<div className="elem">
				<b>txOutIndex : </b> {txIn.txOutIndex}
			</div>
		</div>
	);
};

export default TxIn;
