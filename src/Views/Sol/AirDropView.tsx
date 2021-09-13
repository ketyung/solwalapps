import React, {useState} from 'react';
import {Card, Button, Input} from 'antd';
import {success, error} from '../utils/Util';
import useAirdrop from '../../Sol/Handlers/useAirdrop';


export const AirDropView : React.FC = () => {

    const [amount, setAmount] = useState("");

    const amountOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        let amt = e.currentTarget.value;

        setAmount(amt);
    }


    const airdropCompletion = (res : null | Error) =>  {

        if (res instanceof Error){

            error((res as Error).message, 5);
        }
        else {

            success("Success!", 5);

            setAmount("");
        }

    }

    const [loading,airDropWallet, balance] = useAirdrop();


    const onClick =  () => {
        

        let amt = parseFloat(amount);

        if (isNaN(amt)) {

            error("Amount is NAN", 3);
            return; 
        }

        airDropWallet(amt, airdropCompletion);

    };


    return <div>
        <Card title="Air drop this wallet" className="sendToCard" bordered={true}>
        <label>Amount (Sol) : </label>
        <Input type="text" value={amount} name="amount" style={{maxWidth:"80px", minHeight: "30px"}} onChange={amountOnChange}/>
        <Button type="primary" disabled={loading} onClick={onClick}>Send</Button>
        <span><label>Balance:</label> {balance} sol</span>
        </Card></div>;


}