import React, {useState} from 'react';
import {Card, Button, Input} from 'antd';
import {success, error} from '../utils/Util';
import useHwProgram from '../../Sol/Handlers/useHwProgram';

export const ExecHwView : React.FC = () => {

    const [seed, setSeed, sayHello, getGreetingCount] = useHwProgram();
    
    const [greetedAccount, setGreetedAccount] = useState<[number, string]>([0, ""]);


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

        
    </div>;
}