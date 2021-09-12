import * as web3 from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';

export const netUrl = "devnet";

export const explorerUrl = "https://explorer.solana.com/address/";

export default function useSendSol() {

    const { publicKey, sendTransaction } = useWallet();
    
    const [ historyUrl, setHistoryUrl] = useState("");

   
    async function sendSol( toAddress : string, amount : number, completionHandler : (result : null | Error) => void ){

        if (!publicKey) {
            completionHandler(new Error("No wallet pubkey"));
            return; 
        }
    
        var connection = new web3.Connection(
            web3.clusterApiUrl(netUrl),
            'confirmed');
        
        let toPublicKey = new web3.PublicKey(toAddress);
    
        let amountInLp = web3.LAMPORTS_PER_SOL * (isNaN(amount) ? 1 : amount);
    
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
    
                completionHandler(null);
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



