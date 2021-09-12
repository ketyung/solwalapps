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

        let amt = e.currentTarget.value;

        setAmount(amt);
    }

    const addressOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        setAddress(e.currentTarget.value);
    }

      
    const onClick = useCallback(async () => {
        if (!publicKey) {

            error("Wallet is not connected", 5);
            return; 

        }

        if (address.trim() === ""){

            error("Address is blank", 5);
            return; 

        }

       // console.log("wallet.pubKey:"+ publicKey.toString());

        var receiverWallet = new PublicKey(address);

        let amt = parseFloat(amount);

        if (isNaN(amt)) {

            error("Amount is NAN", 5);
            return; 
        }

        let amountInLp = 1000000000 * (isNaN(amt) ? 1 : amt);

        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: receiverWallet,
                lamports: amountInLp,
            })
        );

        await sendTransaction(transaction, connection)
        .then(value => {

            connection.confirmTransaction(value, 'processed')
            .then( info => {

                if (info.value.err === null) {
    
                    success("Success!", 3);
        
                }
                else {
        
                    error("Error!", 5);
        
                }
               
                setAddress("");
                setAmount("");
        
            })
            .catch(err=> {

                error(err, 5);
                
            })

       
        })
        .catch(err => {

           
           error(err, 5);
               
        });

      
    }, [address, amount, publicKey, sendTransaction, connection]);


    return <div>
        <Card title="Send Sol To Others" className="sendToCard" bordered={true}>
        <label>Address : </label>
        <Input type="text" placeholder="2iJmT1y4YtpbNv76VAjPd6sZRuDK2QFwNr5DLaHwEK31" 
        value={address} name="address" style={{maxWidth:"300px", minHeight: "30px"}} onChange={addressOnChange} />
        <label>Amount (Sol) : </label>
        <Input type="text" value={amount} name="amount" style={{maxWidth:"80px", minHeight: "30px"}} onChange={amountOnChange}/>
        <Button type="primary" disabled={!publicKey || address.trim() === ""} onClick={onClick}>Send</Button>
        </Card>

    </div>;

}