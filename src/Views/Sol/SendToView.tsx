import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import React, { useCallback, useState } from 'react';
import './css/SendToView.css';

export const SendToView : React.FC = () => {

    const [address, setAddress] = useState("");
    const [amount, setAmount] = useState("");

    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();


    const amountOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        let amt = extractFloat(e.currentTarget.value);

        setAmount(((amt == null) ? "" : (amt+"")));
    }

    const addressOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        setAddress(e.currentTarget.value);
    }

    const extractFloat = (text : string) : string | null => {
        const match = text.match(/\d+((\.|,)\d+)?/)
        return match && match[0];
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

            alert("Sent !");

        }
        else {

            alert("Error:" + info.value.err);
        }
        
        console.log(info);

        // reset 
        setAddress("");
        setAmount("");

    }, [address, amount, publicKey, sendTransaction, connection]);


    return <div>
        <div className="sendToDiv">
        <label>Address : </label>
        <input type="text" value={address} name="address" style={{minWidth:"300px"}} onChange={addressOnChange} />
        <label>Amount (Sol) : </label>
        <input type="text" value={amount} name="amount" style={{maxWidth:"50px"}} onChange={amountOnChange}/>
        </div>

        <button className="sendButton" disabled={!publicKey || address.trim() === ""} onClick={onClick}>
            Send</button>
    </div>;

}