import React from 'react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import './css/Wallet.css';

export const Wallet : React.FC = () => {

  
    return <div>
                <WalletModalProvider>
                    <div className="walletBar">
                    <WalletMultiButton className="walletButton"/>
                    <WalletDisconnectButton className="disconButton" />
                    </div>
                </WalletModalProvider>
      
    </div>;
}
