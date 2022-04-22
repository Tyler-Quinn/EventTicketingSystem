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

    const [events, setEvents] = useState(undefined)
    const [eventHashes, setEventHashes] = useState(undefined)
    const [claimDaiValue, setClaimDaiValue] = useState('0')

    const { provider, address, ticketSales, dai } = useWeb3Context()

    const handleClaim = async () => {

    }

    const handleShowEvents = (e) => {
        console.log(events)
        console.log(eventHashes)
    } 

    const checkEvents = async () => {
        const filter = ticketSales.filters.NewEvent(null,address.toString())
        const returnEvents = await ticketSales.queryFilter(filter, 0, await provider.getBlockNumber())
        await setEvents(returnEvents)
    }

    useEffect(() => {
        if (provider) {
            if (ticketSales) {
                checkEvents()
            } else {
                console.log("ticketSales contract not connected")
                setEvents(undefined)
            }
            console.log("Connect wallet")
            setEvents(undefined)
        }
    }, [provider, address, ticketSales])

    useEffect(() => {
        if (events) {
            const eventsArrayLength = events.length
            const eventHashArray = []
            for (let i = 0; i < eventsArrayLength; i++) {
                eventHashArray[i] = events[i].args[0]
            }
            setEventHashes(eventHashArray)
            console.log(eventHashArray)
        }
    }, [events])

    return (
        <div align="center">
            <Typography variant="h4">
                Your Events
            </Typography>
            <Button text="Events" onClick={handleShowEvents}></Button>
        </div>
    )
}

export default Manage