import React, { useState, useEffect } from 'react'
import { TextField, makeStyles, Typography } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
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
    const [claimBalance, setClaimBalance] = useState('0')
    const [txStateClaimButton, setTxStateClaimButton] = useState("None")

    const { provider, address, ticketSales, dai } = useWeb3Context()

    const handleClaim = async () => {
        try {
            if (provider) {
                if (ticketSales) {
                    const tx = await ticketSales.claimBalance(dai.address.toString(), ethers.utils.formatBytes32String('DAI'))
                    setTxStateClaimButton("Pending")
                    checkBalanceClaimed()
                } else {
                    throw new Error("Cannot connect to ticketSales contract")
                }
            } else {
                throw new Error("No valid provider")
            }
        } catch (err) {
            setTxStateClaimButton("None")
            console.log("Cannot write to ticketSales contract")
            console.log(err)
        }
    }

    const handleShowEvents = (e) => {
        console.log(events)
        console.log(eventHashes)
    } 

    const checkBalanceClaimed = async () => {
        const filter = ticketSales.filters.BalanceClaimed(address.toString())
        ticketSales.on(filter, (_receiver, _asset, _amount) => {
            console.log("Got Event: BalanceClaimed")
            console.log(_receiver, _asset, _amount)
            setTxStateClaimButton("Confirmed")
        })
    }

    const checkNewEvent = async () => {
        const filter = ticketSales.filters.NewEvent(null,address.toString())
        const returnEvents = await ticketSales.queryFilter(filter, 0, await provider.getBlockNumber())
        await setEvents(returnEvents)
    }

    const updateClaimBalance = async () => {
        if (provider) {
            if (ticketSales) {
                await setClaimBalance(await ticketSales.balances(address.toString(), ethers.utils.formatBytes32String("DAI")))
            }
        }
    }

    useEffect(() => {
        if (provider) {
            if (ticketSales) {
                checkNewEvent()
                updateClaimBalance()
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
            <Card
                className={classes.field}
            >
                <Grid container>
                    <Grid item xs={12}>
                        <Box
                            sx={{
                                textAlign: "left",
                                ml: 2
                            }}
                        >
                            <Typography variant="h6">
                                Claim Balance
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <Box
                            sx={{
                                textAlign: "left",
                                ml: 2,
                                mt: 1,
                                mb: 1
                            }}
                        >
                            <Button text={txStateClaimButton=="None" ? "Claim" : txStateClaimButton} onClick={handleClaim}></Button>
                        </Box>
                    </Grid>
                    <Grid item xs={8}>
                        <Box
                            sx={{
                                textAlign: "right",
                                mt: 1,
                                mb: 1,
                                mr: 2
                            }}
                        >
                            {claimBalance}
                        </Box>
                    </Grid>
                    <Grid item xs={1}>
                        <Box
                            sx={{
                                textAlign: "right",
                                mr: 2,
                                mt: 1,
                                mb: 1
                            }}
                        >
                            <Typography align="right">DAI</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
        </div>
    )
}

export default Manage