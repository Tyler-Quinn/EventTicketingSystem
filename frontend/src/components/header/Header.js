import React from 'react'
import Button from '../buttons/Button'
import Box from '@material-ui/core/Box'
import HeaderRoutes from './HeaderRoutes'
import { Link } from 'react-router-dom'
import ConnectWalletButton from './ConnectWalletButton'

const Header = () => {
    return (
        <Box className='header' display="flex" alignItems="center">
            <Box display="flex" flexDirection="row" flex={1} justifyContent="flex-start" >
                <Link to="/">
                    <Button text='Home'></Button>
                </Link>
            </Box>

            <Box display="flex" flexDirection="row" flex={1} justifyContent="center" alignSelf="center">
                <HeaderRoutes />
            </Box>

            <Box display="flex" flexDirection="row" flex={1} justifyContent="flex-end" alignSelf="center">
              <ConnectWalletButton />
            </Box>

        </Box>
    )
}

export default Header

/*
<Button text='Connect Wallet' onClick={login}></Button>
*/