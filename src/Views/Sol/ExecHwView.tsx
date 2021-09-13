import React, {useState} from 'react';
import {Card, Button, Input} from 'antd';
import {success, error} from '../utils/Util';
import useHwProgram from '../../Sol/Handlers/useHwProgram';

export const ExecHwView : React.FC = () => {

    const [seed, setSeed, sayHello, getGreetingCount, loading, greetedPubKey] = useHwProgram();
    
    const [greetedAccount, setGreetedAccount] = useState<[number, string]>([0, "None"]);

    const seedOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        let txt = e.currentTarget.value;

        setSeed(txt);
    }


    const completion = (res : null | Error) =>  {

        if (res instanceof Error){

            error((res as Error).message, 5);
        }
        else {

            success("Success!", 5);
            
            getGreetingCount().then( value => {

                setGreetedAccount(value);
            })
        }

    }


    const onClick =  () => {

        if ( seed.trim() === "") {

            error("No seed provided", 3);
            return;
        }

        sayHello(completion);

    };

    return <div>

<Card title="Execute the Greeting On-chain program (smart contract)" className="sendToCard" bordered={true}>
        <label>Seed : </label>
        <Input type="text" value={seed} name="seed" style={{maxWidth:"160px", minHeight: "30px"}} 
        onChange={seedOnChange}/>
        <Button type="primary" disabled={loading} onClick={onClick}>Send</Button>
        <br/>
        <div>
        <label>Going to greet </label> <span>{greetedPubKey?.toBase58()}</span>
        </div>
        <br/>
        <div>
        <label>Account: </label>
        <span>{greetedAccount[1]} has been greeted {greetedAccount[0]} times</span>
        </div>
        </Card>
    </div>;
}