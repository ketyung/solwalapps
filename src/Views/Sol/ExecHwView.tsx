import React, {useState} from 'react';
import {Card, Button, Input, Spin} from 'antd';
import {success, error} from '../utils/Util';
import useHwProgram from '../../Sol/Handlers/useHwProgram';

export const ExecHwView : React.FC = () => {

    const [seed, setSeed, send, getGreetingCount, loading, greetedPubKey] = useHwProgram();
    
    const [greetedAccount, setGreetedAccount] = useState<[number, string]>([0, "None"]);

    const seedOnChange = (e: React.FormEvent<HTMLInputElement>): void => {

        let txt = e.currentTarget.value;

        setSeed(txt);
    }


    const completion = (res : string | Error) =>  {

        if (res instanceof Error){

            error((res as Error).message, 10);
        }
        else {

            success("Success!", 5);
            
            getGreetingCount(res).then( value => {

                setGreetedAccount(value);
            })
        }

    }


    const onClick =  () => {

        if ( seed.trim() === "") {

            error("No seed provided", 3);
            return;
        }

        setGreetedAccount([0, "Working..."]);

        send(completion);

    };

    return <div>

<Card title="Execute the Greeting On-chain program (smart contract)" className="sendToCard" bordered={true}>
        <label>Text : </label>
        <Input type="text" value={seed} name="seed" style={{maxWidth:"160px", minHeight: "30px"}} 
        onChange={seedOnChange}/>
        <Button type="primary" disabled={loading} onClick={onClick}>Send</Button>
        <br/>
        <div>
        <label>Shown as key : </label> <span>{greetedPubKey?.toBase58()}</span>
        </div>
        <br/>
        <div>{
            
            greetedAccount[0] > -1 ?
            <span>
            <label>Value: </label>
            <span>{loading ? <Spin/> : <>{greetedAccount[1]}</>}  : {greetedAccount[0]}</span></span>
            : <div style={{background: "#f00", color: "white", padding: "10px"}}>{greetedAccount[1]}</div>

        }
        </div>
        </Card>
    </div>;
}