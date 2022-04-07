import React, { useState, useEffect } from 'react'
import { TextField, makeStyles, Typography } from '@material-ui/core'
import Button from '../../components/buttons/Button'
import { useWeb3Context } from '../../contexts/Web3Context'
import { ethers } from 'ethers'

const useStyles = makeStyles({
    field: {
        marginTop: 20,
        marginBottom: 20,
        maxWidth: 400,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        align: 'center',
    }
})

const Manage = () => {
    const classes = useStyles()

    const [events, setEvents] = useState()

    const { provider, address, ticketSales } = useWeb3Context()

    const handleShowEvents = (e) => {
        console.log(events)
    } 

    const checkEvents = async () => {
        const filter = ticketSales.filters.NewEvent(null,address.toString())
        const returnEvents = await ticketSales.queryFilter(filter, 0, await provider.getBlockNumber())
        setEvents(returnEvents)
    }

    useEffect( async () => {
        if (provider) {
            if (ticketSales) {
                await checkEvents()
            } else {
                console.log("ticketSales contract not connected")
                setEvents(undefined)
            }
        } else {
            console.log("Connect wallet")
            setEvents(undefined)
        }
    }, [provider, address, ticketSales])

    return (
        <div align="center">
            <h4>Manage Page</h4>
            <Button text="Events" onClick={handleShowEvents}></Button>
        </div>
    )
}

export default Manage