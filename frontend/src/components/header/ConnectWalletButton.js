import React from 'react'
import { useWeb3Context } from '../../contexts/Web3Context'
import Button  from '../buttons/Button'

const ConnectWalletButton = () => {
  const { requestWallet, address } = useWeb3Context()

  const handleRequestWallet = () => {
    requestWallet()
  }

  return (
    <Button text={address? address.truncate() : 'Connect Wallet'} onClick={handleRequestWallet}></Button>
  )
}

export default ConnectWalletButton