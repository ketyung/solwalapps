import * as web3 from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

const netUrl = "devnet";

export default function useSendSolHandler() {

    const { publicKey, sendTransaction } = useWallet();
    
    const [ historyUrl, setHistoryUrl] = useState("");

    const explorerUrl = "https://explorer.solana.com/address/";

    async function sendSol( toAddress : string, amount : number, completionHandler : (result : boolean | Error) => void ){

       
        if (!publicKey) {
    
            completionHandler(new Error("No wallet pubkey"));
            return; 
        }
    
        var connection = new web3.Connection(
            web3.clusterApiUrl(netUrl),
            'confirmed');
        
        let toPublicKey = new web3.PublicKey(toAddress);
    
        let amountInLp = 1000000000 * (isNaN(amount) ? 1 : amount);
    
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: toPublicKey,
                lamports: amountInLp,
            })
        );
    
        /**
        await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair],
        )*/
    
        sendTransaction(transaction, connection)
        .then( value => {
    
            connection.confirmTransaction(value, 'processed')
            .then( _ => {
    
                completionHandler(true);
                setHistoryUrl(explorerUrl+toAddress+"?cluster="+netUrl);

            })
            .catch ( errx => {
    
                if (errx instanceof Error) {
    
                    completionHandler((errx as Error));
         
                }
    
            });
    
        })
        .catch(errx => {
    
            if (errx instanceof Error) {
    
                completionHandler((errx as Error));
         
            }
    
        });
    
    }
    

    return [historyUrl, sendSol] as const;
}





