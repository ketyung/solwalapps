import * as web3 from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import {netUrl} from './useSendSolHandler';
import { useState } from 'react';

export default function useAirdropHandler() {


    const { publicKey} = useWallet();

    const [loading, setLoading] = useState(false);

    async function airDropWallet(amount : number, completionHandler : (result : null | Error) => void ) {


        if (!publicKey) {
            completionHandler(new Error("No wallet pubkey"));
            return; 
        }

        setLoading(true);

        airDrop(publicKey, amount, completionHandler);
    }


    async function airDrop(toAddress : web3.PublicKey, amount : number, completionHandler : (result : null | Error) => void ){


        var connection = new web3.Connection(web3.clusterApiUrl(netUrl),'confirmed');
    

        let amountInLp = web3.LAMPORTS_PER_SOL * (isNaN(amount) ? 1 : amount);

        await connection.requestAirdrop(toAddress,amountInLp,
        ).then( sig => {

            connection.confirmTransaction(sig).then( val => {

                completionHandler(null);

                setLoading(false);

            }).catch( errx => {

                completionHandler(errx as Error);
                setLoading(false);
            });

        })
        .catch( errx => {

            completionHandler(errx as Error);
            setLoading(false);

        })
        
    }

    return [loading,airDropWallet] as const;
}