import * as web3 from '@solana/web3.js';

const netUrl = "devnet";

export class SolHandler {

    public async sendSol(wallet : web3.Keypair, toPublicKey : web3.PublicKey, amount : number,
        completion : (result : boolean | Error) => void ){

        var connection = new web3.Connection(
            web3.clusterApiUrl(netUrl),
            'confirmed');
        
        let amountInLp = 1000000000 * (isNaN(amount) ? 1 : amount);

        const transaction = new web3.Transaction().add(
            web3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: toPublicKey,
                lamports: amountInLp,
            })
        );

        await web3.sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet],
        )
        .then( value => {

            connection.confirmTransaction(value, 'processed')
            .then( info => {

                completion(true);
            })
            .catch ( errx => {

                if (errx instanceof Error) {

                    completion((errx as Error));
                }

            });

        })
        .catch(errx => {
            
            if (errx instanceof Error) {

                completion((errx as Error));
            }

        });

    }



}
