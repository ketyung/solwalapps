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


    async function hasSufficientFund() : Promise<boolean> {

        if (!publicKey) {

            console.log("hasSufficientFund, no wallet pubkey");
            return false ; 
        }

        var connection = new web3.Connection(
            web3.clusterApiUrl(netUrl),
            'confirmed');
       

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


    async function constructGreetedPubKey(){

        if (!publicKey) {

            return ;
        }

        await web3.PublicKey.createWithSeed(
        publicKey,
        seed,
        programId).then( val => {

            setGreetedPubKey(val);

            createGreetedAccountIfNotExists();
  
        }).catch( err => {

            console.log("Creating greeted pub.key error::", err);
        });

        
    }


    async function createGreetedAccountIfNotExists(){
        
        if (!publicKey){

            console.log("createGreetedAccountIfNotExists()::No wallet pubkey");
            return; 
        }

        if ( !greetedPubKey){
        
            console.log("createGreetedAccountIfNotExists()::No greeted pubkey");
        
            return 
        }

        var connection = new web3.Connection(
            web3.clusterApiUrl(netUrl),
            'confirmed');
  

        const greetedAccount = await connection.getAccountInfo(greetedPubKey);
        if (greetedAccount === null) {
            console.log(
                'Creating account',
                greetedPubKey.toBase58(),
                'to say hello to',
            );
            
            const lamports = await connection.getMinimumBalanceForRentExemption(
                GreetingSize,
            ) ;
        
            console.log("exemption lamports:", lamports);
        
            const transaction = new web3.Transaction().add(
                web3.SystemProgram.createAccountWithSeed({
                fromPubkey: publicKey,
                basePubkey: publicKey,
                seed: seed,
                newAccountPubkey: greetedPubKey,
                lamports,
                space: GreetingSize,
                programId,
                }),
            );

            sendTransaction(transaction, connection)
            .then( value => {
        
                connection.confirmTransaction(value, 'processed');

            }).catch( err => {

                console.log("Creating greeting account error: ", err);

            });
        }
    }



    async function sayHello(completionHandler : (result : null | Error) => void) {

        if (!publicKey){
            completionHandler(new Error("No wallet pubkey"));
       
            return; 
        }


        if ( !hasSufficientFund()) {

            completionHandler(new Error("Insufficient fund, consider to add or airdrop some to wallet!"));
            return;
        }

        constructGreetedPubKey();


        if ( !greetedPubKey){
            completionHandler(new Error("No greeted pubkey"));
            return 
        }

        var connection = new web3.Connection(
            web3.clusterApiUrl(netUrl),
            'confirmed');

        const instruction = new web3.TransactionInstruction({
          keys: [{pubkey: greetedPubKey, isSigner: false, isWritable: true}],
          programId,
          data: Buffer.alloc(0), // All instructions are hellos
        });

        const transaction = new web3.Transaction().add(instruction);


        sendTransaction(transaction, connection)
        .then( value => {
    
            connection.confirmTransaction(value, 'processed').then (_ =>{

                completionHandler(null);
            })
            .catch(err => {

                completionHandler(err);
            });

        })
        .catch(err => {

            completionHandler(err);
        });

      }

      return [seed, setSeed, sayHello] as const;

}