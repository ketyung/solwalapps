import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useCallback, useState } from 'react';
import './css/SendToView.css';
import { Button , Input, Card } from 'antd';
import {success, error} from '../utils/Util';

// test
export const SendToView : React.FC = () => {

    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();


    const amountOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        let amt = parseFloat(e.currentTarget.value);

        setAmount((isNaN(amt) ? "" : (amt+"")));
    }

    const addressOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        setAddress(e.currentTarget.value);
    }

      
    const onClick = useCallback(async () => {
        if (!publicKey) throw new WalletNotConnectedError();

        if (address.trim() === ""){

            throw new Error("Receiver address is blank!!");
        }

       // console.log("wallet.pubKey:"+ publicKey.toString());

        var receiverWallet = new PublicKey(address);

        let amt = parseInt(amount);

        let amountInLp = 1000000000 * (isNaN(amt) ? 1 : amt);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: receiverWallet,
                lamports: amountInLp,
            })
        );

        const signature = await sendTransaction(transaction, connection);

        let info = await connection.confirmTransaction(signature, 'processed');

        if (info.value.err === null) {

            success("Success!", 3);

        }
        else {

            error("Error!", 5);

        }
        
        console.log(info);

        // reset 
        setAddress("");
        setAmount("");

    }, [address, amount, publicKey, sendTransaction, connection]);


    return <div>
        <Card title="Send Sol To Others" className="sendToCard" bordered={true}>
        <label>Address : </label>
        <Input type="text" placeholder="2iJmT1y4YtpbNv76VAjPd6sZRuDK2QFwNr5DLaHwEK31" 
        value={address} name="address" style={{maxWidth:"300px", minHeight: "30px"}} onChange={addressOnChange} />
        <label>Amount (Sol) : </label>
        <Input type="text" value={amount} name="amount" style={{maxWidth:"50px", minHeight: "30px"}} onChange={amountOnChange}/>
        <Button type="primary" disabled={!publicKey || address.trim() === ""} onClick={onClick}>
            Send</Button>
        </Card>

    </div>;

}