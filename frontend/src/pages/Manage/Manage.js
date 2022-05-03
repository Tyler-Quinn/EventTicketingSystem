import React, { useState, useEffect } from 'react'
import { TextField, makeStyles, Typography } from '@material-ui/core'
import Card from '@material-ui/core/Card'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '../../components/buttons/Button'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { InputLabel } from '@material-ui/core'
import FormControl from '@material-ui/core/FormControl'
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
    const [claimBalance, setClaimBalance] = useState(0)
    const [txStateClaimButton, setTxStateClaimButton] = useState("None")
    const [selectedEvent, setSelectedEvent] = useState(undefined)
    const [eventTicketQuantity, setEventTicketQuantity] = useState(undefined)
    const [eventTicketQuantityIssued, setEventTicketQuantityIssued] = useState(undefined)
    const [checkerAddress, setCheckerAddress] = useState("")
    const [giftTicketAddress, setGiftTicketAddress] = useState("")

    const { provider, address, ticketSales, dai } = useWeb3Context()

    const handleClaim = async () => {
        try {
            if (provider) {
                if (ticketSales) {
                    const tx = await ticketSales.claimBalance(dai.address.toString(), ethers.utils.formatBytes32String('DAI'))
                    setTxStateClaimButton("Pending")
                    checkBalanceClaimed()
                } else { throw new Error("Cannot connect to ticketSales contract") }
            } else { throw new Error("No valid provider") }
        } catch (err) {
            setTxStateClaimButton("None")
            console.log("Cannot write to ticketSales contract")
            console.log(err)
        }
    }

    const handleAddChecker = async () => {
        try {
            if (provider) {
                if (ticketSales) {
                    if (ethers.utils.isHexString(checkerAddress) &&
                        (ethers.utils.hexDataLength(checkerAddress)==20))
                    {
                        const tx = await ticketSales.addChecker(selectedEvent, checkerAddress)
                    } else { throw new Error("Error when adding checker") }
                } else { throw new Error("Cannot connect to ticketSales contract") }
            } else { throw new Error("No valid provider") }
        } catch (err) {
            console.log("Cannot add checker")
            console.log(err)
        }
    }

    const handleRemoveChecker = async () => {
        try {
            if (provider) {
                if (ticketSales) {
                    if (ethers.utils.isHexString(checkerAddress) &&
                        (ethers.utils.hexDataLength(checkerAddress)==20))
                    {
                        const tx = await ticketSales.removeChecker(selectedEvent, checkerAddress)
                    } else { throw new Error("Error when removing checker") }
                } else { throw new Error("Cannot connect to ticketSales contract") }
            } else { throw new Error("No valid provider") }
        } catch (err) {
            console.log("Cannot remove checker")
            console.log(err)
        }
    }

    const handleCheckerTextField = (e) => {
        setCheckerAddress(e.target.value)
    }

    const handleGiftTicket = async () => {
        try {
            if (provider) {
                console.log(`isHexString: ${ethers.utils.isHexString(giftTicketAddress)}`)
                console.log(`hexDataLength: ${ethers.utils.hexDataLength(giftTicketAddress)}`)
                if (ticketSales) {
                    if (ethers.utils.isHexString(giftTicketAddress) &&
                        (ethers.utils.hexDataLength(giftTicketAddress)==20) &&
                        (eventTicketQuantityIssued<eventTicketQuantity))
                    {
                        const tx = await ticketSales.ownerIssueTicket(selectedEvent, giftTicketAddress)
                    } else { throw new Error("Error when gifting ticket") }
                } else { throw new Error("Cannot connect to ticketSales contract") }
            } else { throw new Error("No valid provider") }
        } catch (err) {
            console.log("Cannot gift ticket")
            console.log(err)
        }
    }

    const handleGiftTicketTextField = (e) => {
        setGiftTicketAddress(e.target.value)
    }

    const handleShowEvents = async (e) => {
        console.log(events)
        console.log(eventHashes)
        console.log(selectedEvent)
        console.log(eventTicketQuantity)
    } 

    const handleEventDropdownSelect = async (e) => {
        await setSelectedEvent(e.target.value)
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
                try {
                    const bal = await ticketSales.balances(address, ethers.utils.formatBytes32String("DAI"))
                    setClaimBalance(bal)
                } catch (err) {
                    setClaimBalance(0)
                }
            } else { setClaimBalance(0) }
        } else { setClaimBalance(0) }
    }

    const renderEventDetails = () => {
        if (provider) {
            if (ticketSales) {
                try {
                    return (
                        <Card
                            className={classes.field}
                        >

                            <Grid container>
                                <Grid item xs={12}>
                                    <FormControl 
                                        className={classes.field}
                                        sx={{
                                            textAlign: "center",
                                            ml: 2,
                                            mr: 2
                                        }}
                                    >
                                        <InputLabel>Event</InputLabel>
                                        <Select value={selectedEvent} onChange={handleEventDropdownSelect}>
                                            {eventHashes ? eventHashes.map((element, index) => {
                                                return (
                                                    <MenuItem value={element} key={index}>
                                                        {eventHashes[index]}
                                                    </MenuItem>
                                                )
                                                }) : null
                                            }
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={9}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 2,
                                            mb: 1
                                        }}
                                    >
                                        {selectedEvent ? "Tickets Sold:" : null}
                                    </Box>
                                </Grid>
                                <Grid item xs={3}>
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            mr: 2,
                                            mb: 1
                                        }}
                                    >
                                        <Typography
                                            align="center"
                                        >
                                            {selectedEvent ? `${eventTicketQuantityIssued} / ${eventTicketQuantity}` : null}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 2,
                                            mt: 2,
                                            mb: 1
                                        }}
                                    >
                                        <Typography align="left">Manage Checkers</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 2,
                                        }}
                                    >
                                        <Button text="Add Checker" onClick={handleAddChecker}></Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={6}>
                                    <Box
                                        sx={{
                                            textAlign: "right",
                                            mr: 2,
                                        }}
                                    >
                                        <Button text="Remove Checker" onClick={handleRemoveChecker}></Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 1,
                                            mr: 1
                                        }}
                                    >
                                        <TextField
                                            className={classes.field}
                                            id="outlined-basic"
                                            label="Checker Address"
                                            type={"text"}
                                            variant="outlined"
                                            onChange={handleCheckerTextField}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 2,
                                            mt: 2
                                        }}
                                    >
                                        <Typography align="left">Gift Ticket</Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={2}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 2,
                                            mt: 4,
                                            mb: 1
                                        }}
                                    >
                                        <Button text="Gift" onClick={handleGiftTicket}></Button>
                                    </Box>
                                </Grid>
                                <Grid item xs={10}>
                                    <Box
                                        sx={{
                                            textAlign: "left",
                                            ml: 1,
                                            mr: 1
                                        }}
                                    >
                                        <TextField
                                            className={classes.field}
                                            id="outlined-basic"
                                            label="Giftee Address"
                                            type={"text"}
                                            variant="outlined"
                                            onChange={handleGiftTicketTextField}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Card>
                    )
                } catch (err) { return null }
            } else { return null }
        } else { return null }
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

    useEffect(() => {
        async function updateData() {
            try {
                const selectedEventData = await ticketSales.events(selectedEvent)
                setEventTicketQuantity(selectedEventData.ticketQuantity)
                setEventTicketQuantityIssued(selectedEventData.ticketQuantityIssued)
            } catch (err) {
                console.log("No valid selectedEvent")
                console.log(err)
            }
        }
        updateData()
    }, [selectedEvent])

    return (
        <div align="center">
            <Typography variant="h4">
                Your Events
            </Typography>

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
                            <Button text={txStateClaimButton==="None" ? "Claim" : txStateClaimButton} onClick={handleClaim}></Button>
                        </Box>
                    </Grid>
                    <Grid item xs={7}>
                        <Box
                            sx={{
                                textAlign: "right",
                                mt: 1,
                                mb: 1,
                                mr: 1
                            }}
                        >
                            {claimBalance}
                        </Box>
                    </Grid>
                    <Grid item xs={2}>
                        <Box
                            sx={{
                                textAlign: "center",
                                mr: 2,
                                mt: 1,
                                mb: 1
                            }}
                        >
                            <Typography align="center">DAI</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            <Box>
                {renderEventDetails}
            </Box>
            
        </div>
    )
}

export default Manage