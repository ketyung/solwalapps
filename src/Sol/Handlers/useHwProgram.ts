import * as web3 from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import * as borsh from 'borsh';
import {netUrl} from './useSendSol';
import {useState} from 'react';

class GreetingAccount {

    counter = 0;

    constructor(fields: {counter: number} | undefined = undefined) {
        if (fields) {
          this.counter = fields.counter;
        }
    }
}

const GreetingSchema = new Map([
    [GreetingAccount, {kind: 'struct', fields: [['counter', 'u32']]}],]);
  

const GreetingSize = borsh.serialize(
    GreetingSchema,
    new GreetingAccount(),).length;
  
const programId: web3.PublicKey = new web3.PublicKey("2VTe4FyppWbJ8zmEKbifA36L1GEUhZgLZ3pidmwNR72b");


export default function useHwProgram() {

    const { publicKey, sendTransaction } = useWallet();

    const [seed, setSeed] = useState("hello");

    const [greetedPubKey, setGreetedPubKey] = useState<null | web3.PublicKey>(null);

    const [loading, setLoading] = useState(false);

    let connection = new web3.Connection(
        web3.clusterApiUrl(netUrl),
        'confirmed');
   

    async function hasSufficientFund() : Promise<boolean> {

        if (!publicKey) {

            console.log("hasSufficientFund, no wallet pubkey");
            return false ; 
        }

     
        let fees = 0;

        const {feeCalculator} = await connection.getRecentBlockhash();

        // Calculate the cost to fund the greeter account
        fees += await connection.getMinimumBalanceForRentExemption(GreetingSize);
    
        // Calculate the cost of sending transactions
        fees += feeCalculator.lamportsPerSignature * 100; // wag
    
        const lamports = await connection.getBalance(publicKey);
        if (lamports < fees) {

            console.log("Insufficient fund!");
            return false ;
        }

        return true; 


    }


    async function createGreetedAccountIfNotExists( pkey : web3.PublicKey) : Promise<boolean>{
        
        if (!publicKey) {

            console.log("hasSufficientFund, no wallet pubkey");
            return false ; 
        }
        
        const lamports = await connection.getMinimumBalanceForRentExemption(
            GreetingSize,
        ) ;
    
        // console.log("exemption lamports:", lamports);
    
        const transaction = new web3.Transaction().add(
            web3.SystemProgram.createAccountWithSeed({
            fromPubkey: publicKey,
            basePubkey: publicKey,
            seed: seed,
            newAccountPubkey: pkey,
            lamports,
            space: GreetingSize,
            programId,
            }),
        );

        sendTransaction(transaction, connection)
        .then( value => {
    
            connection.confirmTransaction(value, 'processed').then(_ => {

                return true;
            })
            .catch( e => {

                return false;

            });

        }).catch( err => {

            console.log("Creating greeting account error: ", err);
            return false;
        });

      
        return true;
    }



    async function send(completionHandler : (result : string | Error) => void) {

        setLoading(true);

        if (!publicKey){
            completionHandler(new Error("No wallet pubkey"));
            setLoading(false);
            
            return; 
        }


        if ( !hasSufficientFund()) {

            completionHandler(new Error("Insufficient fund, consider to add or airdrop some to wallet!"));
            setLoading(false);
            
            return;
        }

        await web3.PublicKey.createWithSeed(publicKey,seed,programId).then( val => {

         
            setGreetedPubKey(val);


            connection.getAccountInfo(val).then ( acc => {

                if (acc === null ) {

                    console.log("going to create .acc!");
    
                    createGreetedAccountIfNotExists(val).then( ret  => {
    
                        if (ret) {
    
                            console.log("account created!",ret);
    
                            sendInstruction(val, completionHandler);
    
                        }
                        else {
    
                            completionHandler( new Error("Failed to create account"));
                            return;
                        }
                     
                    }).catch( err =>{
    
                        completionHandler(err);
                        return ; 
                    });
      
                }
                else {
    
                    console.log("Proceed without acc  creation!");
                    sendInstruction(val, completionHandler);
                }
            })
            .catch (err => {

                completionHandler(err);
                return ; 
    
            })

          
        })
        .catch( err => {

            completionHandler(err);
        
        });


      }


      async function sendInstruction(pubkey : web3.PublicKey, completionHandler : (result : string | Error) => void){

            const instruction = new web3.TransactionInstruction({
            keys: [{pubkey: pubkey, isSigner: false, isWritable: true}],
            programId,data: Buffer.alloc(seed.length), });

            const transaction = new web3.Transaction().add(instruction);


            sendTransaction(transaction, connection)
            .then( value => {
        
                connection.confirmTransaction(value, 'processed').then (_ =>{

                    completionHandler(pubkey.toBase58());
                    setLoading(false);

                })
                .catch(err => {

                    completionHandler(err);
                    setLoading(false);
                    
                });

            })
            .catch(err => {

                completionHandler(err);
                setLoading(false);
                    
            });

      }

      async function getGreetingCount( pubkey : string): Promise<[number, string]> {

            let pkey = new web3.PublicKey(pubkey);

            const accountInfo = await connection.getAccountInfo(pkey);
            if (accountInfo === null) {
            
                return [-1 , "Cannot find greeted account"];
            }

            const greeting = borsh.deserialize(GreetingSchema,GreetingAccount,accountInfo.data,);
            
            return [greeting.counter, pubkey];

      }

      return [seed, setSeed, send, getGreetingCount, loading, greetedPubKey] as const;

}