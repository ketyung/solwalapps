import 'antd/dist/antd.css';
import { message } from 'antd';

export const success = (text : string, duration : number = 3 ) => {
    message.success({
        content: text,
        className: 'custom-class',
        style: {
        marginTop: '20vh',
        },
    }, duration);
};



export const error = ( text : string, duration : number = 3) => {
    message.error({
        content: text,
        className: 'custom-class',
        style: {
        marginTop: '20vh',
        },
    }, duration);
};