import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, formatEther } from 'ethers';

export const OG_CHAIN_ID = 16602;
export const OG_CHAIN = {
  chainId: `0x${OG_CHAIN_ID.toString(16)}`,
  chainName: '0G Testnet',
  nativeCurrency: { name: '0G', symbol: 'A0GI', decimals: 18 },
  rpcUrls: ['https://evmrpc-testnet.0g.ai'],
  blockExplorerUrls: ['https://chainscan-galileo.0g.ai'],
};

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null, balance: null, chainId: null, isConnecting: false, error: null,
  });

  const updateBalance = useCallback(async (addr: string) => {
    try {
      const provider = new BrowserProvider((window as any).ethereum);
      const bal = await provider.getBalance(addr);
      setState(s => ({ ...s, balance: parseFloat(formatEther(bal)).toFixed(4) }));
    } catch { /* non-fatal */ }
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) { setState(s => ({ ...s, error: 'MetaMask not installed' })); return; }

    setState(s => ({ ...s, isConnecting: true, error: null }));
    try {
      // Request accounts
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];

      // Switch / add 0G Chain
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: OG_CHAIN.chainId }] });
      } catch (switchErr: any) {
        if (switchErr.code === 4902) {
          await eth.request({ method: 'wallet_addEthereumChain', params: [OG_CHAIN] });
        } else throw switchErr;
      }

      const chainId = parseInt(await eth.request({ method: 'eth_chainId' }), 16);
      setState(s => ({ ...s, address, chainId, isConnecting: false }));
      void updateBalance(address);
    } catch (err: any) {
      setState(s => ({ ...s, isConnecting: false, error: err.message || 'Connection failed' }));
    }
  }, [updateBalance]);

  const disconnect = useCallback(() => {
    setState({ address: null, balance: null, chainId: null, isConnecting: false, error: null });
  }, []);

  // Listen for account / chain changes
  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const onAccounts = (accs: string[]) => {
      if (!accs.length) disconnect();
      else { setState(s => ({ ...s, address: accs[0] })); void updateBalance(accs[0]); }
    };
    const onChain = (id: string) => setState(s => ({ ...s, chainId: parseInt(id, 16) }));
    eth.on('accountsChanged', onAccounts);
    eth.on('chainChanged', onChain);
    return () => { eth.removeListener('accountsChanged', onAccounts); eth.removeListener('chainChanged', onChain); };
  }, [disconnect, updateBalance]);

  const shortAddress = state.address
    ? `${state.address.slice(0, 6)}…${state.address.slice(-4)}`
    : null;

  const isOnOGChain = state.chainId === OG_CHAIN_ID;

  return { ...state, connect, disconnect, shortAddress, isOnOGChain };
}
