import './App.css';
import { useMemo } from 'react';
import {Wallet} from './Views/Sol/Wallet';
import {SendToView} from './Views/Sol/SendToView';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {getPhantomWallet,getSolflareWallet,getSolletExtensionWallet} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

function App() {

  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint 
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSolletExtensionWallet({ network }),
  ], [network]);

  return (
    <div className="App"><br/>
       <ConnectionProvider endpoint={endpoint}>
       <WalletProvider wallets={wallets} autoConnect>
       
      <Wallet/>
      <br/>
      <SendToView/>

      </WalletProvider>
        </ConnectionProvider>
    </div>
  );
}

export default App;
