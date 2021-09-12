import React, { useState } from 'react';
import './css/SendToView.css';
import { Button , Input, Card } from 'antd';
import {success, error} from '../utils/Util';
import useSolanaHandler from '../../Sol/Handlers';

export const SendToView : React.FC = () => {

    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");

    const [histUrl, setHistUrl] = useState("");

    const explorerUrl = "https://explorer.solana.com/address/"

    const amountOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        let amt = e.currentTarget.value;

        setAmount(amt);
    }

    const addressOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        setAddress(e.currentTarget.value);
    }

    const sendSolCompletion = (res : boolean | Error) =>  {

        if (res instanceof Error){

            error((res as Error).message, 5);
        }
        else {

            success("Success!", 5);

            setHistUrl(explorerUrl+address+"?cluster=devnet");
            setAddress("");
            setAmount("");
        }

    }


    const [ sendSol] = useSolanaHandler();

    const onClick =  () => {
        
        if (address.trim() === ""){

            error("Address is blank", 5);
            return; 

        }

        let amt = parseFloat(amount);

        if (isNaN(amt)) {

            error("Amount is NAN", 5);
            return; 
        }

        sendSol(address, amt, sendSolCompletion);

    };


    let style = { display: "none", borderColor: "#aaa", backgroundColor: "#def", padding : "10px", margin : "10px" };
    if (histUrl.trim() !== "") style.display = "block";


    return <div>
        <Card title="Send Sol To Others" className="sendToCard" bordered={true}>
        <label>Address : </label>
        <Input type="text" placeholder="2iJmT1y4YtpbNv76VAjPd6sZRuDK2QFwNr5DLaHwEK31" 
        value={address} name="address" style={{maxWidth:"300px", minHeight: "30px"}} onChange={addressOnChange} />
        <label>Amount (Sol) : </label>
        <Input type="text" value={amount} name="amount" style={{maxWidth:"80px", minHeight: "30px"}} onChange={amountOnChange}/>
        <Button type="primary" disabled={address.trim() === ""} onClick={onClick}>Send</Button>
        <div style={style}>
        <a href={histUrl} target="_blank" rel="noreferrer">Check History</a>
        </div>
        </Card>

    </div>;

}