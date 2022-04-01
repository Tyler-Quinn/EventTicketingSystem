import React, { createContext, useEffect, useMemo, useState, useContext } from 'react'
import Onboard from 'bnc-onboard'
import { ethers, Contract, BigNumber } from 'ethers'
import Address from '../models/Address'
import TicketSales from '../contracts/TicketSales.json'
import MockERC20 from '../contracts/MockERC20.json'

require("dotenv").config()

const Web3Context = createContext(undefined)

const walletChecks = [
    { checkName: 'derivationPath' },
    { checkName: 'accounts' },
    { checkName: 'connect' },
    { checkName: 'network' },
    { checkName: 'balance' },
]

const Web3ContextProvider = ({ children }) => {
    const [provider, setProvider] = useState()
    const [connectedNetworkId, setConnectedNetworkId] = useState('')
    const [validConnectedNetworkId] = useState(false)
    const [walletName, setWalletName] = useState('')
    const [address, setAddress] = useState()
    const [balance, setBalance] = useState()
    const [ticketSales, setTicketSales] = useState(undefined)
    const [dai, setDai] = useState(undefined)

    const onboard = useMemo (() => {
        const instance = Onboard({
            dappId: process.env.REACT_APP_BNC_DAPP_ID,
            networkId: 1337,
            subscriptions: {
                address: address => {
                    if (address) {
                        setAddress(Address.from(address))
                    }
                },
                network: connectedNetworkId => {
                    if (connectedNetworkId) {
                        setConnectedNetworkId(connectedNetworkId.toString())
                    } else {
                        setConnectedNetworkId('')
                    }
                },
                balance: bal => {
                    if (bal) {
                        setBalance(BigNumber.from(bal))
                    }
                },
                wallet: async wallet => {
                    try {
                        const { provider, name, instance, type, connect, dashboard, icons } = wallet
                        if (provider) {
                            const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')
                            //const ethersProvider = new ethers.providers.JsonRpcProvider(url)
                            if (provider.enable && !provider.isMetaMask) {
                                // needed for WalletConnect and some other wallets
                                await provider.enable()
                            } else {
                                // MetaMask requires requesting permission to connect users accounts
                                await ethersProvider.send('eth_requestAccounts', [])
                            }
                            setProvider(ethersProvider)
                            setWalletName(name)
                        } else {
                            setWalletName('')
                            setProvider(undefined)
                            setAddress(undefined)
                        }
                    } catch (err) {
                        setProvider(undefined)
                        setAddress(undefined)
                    }
                }
            },
            // Used to check if the user is ready to transact
            walletCheck: walletChecks,
        })
        return instance
    }, [setAddress, setProvider, setConnectedNetworkId])

    const requestWallet = () => {
        const _requestWallet = async () => {
            try {
                await onboard.walletSelect()
                await onboard.walletCheck()
            } catch (err) {}
        }
        _requestWallet()
    }

    const disconnectWallet = () => {
        try {
            onboard.walletReset()
        } catch (err) {}
    }

    const walletConnected = !!address

    const getWriteContract = async (contract) => {
        if (!contract) return
        const signerNetworkId = (await provider.getNetwork()).chainId
        const contractNetworkId = (await contract.provider.getNetwork()).chainId
        if (signerNetworkId.toString() !== contractNetworkId.toString()) {
            onboard.config({ networkId: Number(contractNetworkId) })
            if (onboard.getState().address) {
                await onboard.walletCheck()
            }
            return
        }
        if (!provider) {
            throw new Error('Provider is undefined')
        }
        const signer = provider.getSigner()
        if (!signer) {
            throw new Error('Provider has no signer')
        }
        return contract.connect(signer)
    }

    useEffect(() => {
        const init = async () => {
            if (provider) {
                const signerChainId = (await provider.getNetwork()).chainId
                console.log(await provider.getNetwork())
                console.log(signerChainId.toString())
                console.log(connectedNetworkId.toString())
                const signer = provider.getSigner()
                try {
                    const ticketSalesContract = await new Contract(
                        TicketSales.networks[connectedNetworkId].address,
                        TicketSales.abi,
                        signer
                    )
                    setTicketSales(ticketSalesContract)
                } catch (e) {
                    console.log("ticketSales not initialized")
                    console.log(e)
                    setTicketSales(undefined)
                }
                try {
                    const daiContract = new Contract(
                        MockERC20.networks[connectedNetworkId].address,
                        MockERC20.abi,
                        signer
                    )
                    setDai(daiContract)
                } catch (e) {
                    console.log("dai not initialized")
                    console.log(e)
                    setDai(undefined)
                }
            } else {
                setTicketSales(undefined)
                setDai(undefined)
                //throw new Error('Provider is undefined')
            }
        }
        init()
    }, [address, connectedNetworkId, provider])

    return (
        <Web3Context.Provider
            value={{
                onboard,
                provider,
                address,
                balance,
                walletConnected,
                connectedNetworkId,
                validConnectedNetworkId,
                requestWallet,
                disconnectWallet,
                walletName,
                getWriteContract,
                ticketSales,
                dai,
            }}
        >
            { children }
        </Web3Context.Provider>
    )
}

export function useWeb3Context() {
    const ctx = useContext(Web3Context)
    if (ctx === undefined) {
        throw new Error('useApp must be used within Web3Provider')
    }
    return ctx
}

export default Web3ContextProvider