import { Button, TextField } from "@mui/material";
import axios from "axios";
import React, { useState } from "react";

const CreateTx = () => {
    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState(1);
    const [newTx, setNewTx] = useState({});

    const params = {
        method: "post",
        baseURL: `http://localhost:3001`,
        url: "/transaction/create",
        data: { receiverAddress: address, sendingAmount: amount },
    };

    const createTx = async () => {
        const {data} = await axios.request(params);
        setNewTx(data);
    };

    const textOnAddress = (e) => {
        setAddress(e.target.value);
    };
    const textOnAmount = (e) => {
        setAmount(parseInt(e.target.value));
    };

    return (
        <div className="transaction_container">
            <div className="transaction_textField">
                <TextField
                    required
                    label="Input Wallet Address"
                    variant="standard"
                    name="address"
                    onChange={textOnAddress}
                    sx={{ width: "100%", displayPrint: "block" }}
                />
                <TextField
                    required
                    label="Input Amount"
                    variant="standard"
                    name="amount"
                    onChange={textOnAmount}
                    sx={{
                        width: 200,
                        displayPrint: "block",
                        marginTop: "20px",
                    }}
                />
            </div>
            <br/>
            <Button onClick={createTx} className="transaction_submit_btn">
                Send
            </Button>
        </div>
    );
};

export default CreateTx;
