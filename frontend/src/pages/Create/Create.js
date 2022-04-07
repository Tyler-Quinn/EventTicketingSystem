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

const Create = () => {
    const classes = useStyles()
    
    const [name, setName] = useState('')
    const [price, setPrice] = useState('')
    const [quantity, setQuantity] = useState('')
    const [nameValid, setNameValid] = useState(false)
    const [priceValid, setPriceValid] = useState(false)
    const [quantityValid, setQuantityValid] = useState(false)
    const [txState, setTxState] = useState('None')

    const { address, ticketSales } = useWeb3Context()

    const handleNameChange = (e) => {
        setName(e.target.value)
    }

    const handlePriceChange = (e) => {
        const number = e.target.value.replace(/[^0-9.]/g, '')
        if (number.length > 1) {
            if (number.length - number.match(/[^.]/g || []).length < 2) {
                setPrice(number)
            }
        } else {
            setPrice(number)
        }
        console.log(ticketSales)
    }

    const handleTicketQuantityChange = (e) => {
        const number = e.target.value.replace(/[^0-9]/g, '')
        setQuantity(number)
    }

    const handleCreateEvent = async (e) => {
        try {
            if (nameValid && priceValid && quantityValid) {
                const tx = await ticketSales.createEvent(name, ethers.utils.parseUnits(price, "ether"), quantity)
                setTxState("Pending")
                checkEvents()
            } else {
                console.log("Cannot create event, inputs invalid")
                setTxState("None")
            }
        } catch (err) {
            setTxState("None")
            console.log("Cannot write to ticketSales contract")
            console.log(err)
        }
    }

    const checkEvents = () => {
        const filter = ticketSales.filters.NewEvent(null,address.toString())
        ticketSales.on(filter, (_eventNameHash, _owner, _ticketPrice, _ticketQuantity) => {
            console.log("Got Event: NewEvent")
            console.log(_eventNameHash, _owner, _ticketPrice.toString(), _ticketQuantity.toString())
            setTxState("Confirmed")
        })
    }

    // Update nameValid on change of the name state variable
    useEffect(() => {
        if (name != '') {
            setNameValid(true)
        } else {
            setNameValid(false)
        }
        setTxState("None")
    }, [name])

    // Update priceValid on change of the price state variable
    useEffect(() => {
        if (parseFloat(price) > 0) {
            setPriceValid(true)
        } else {
            setPriceValid(false)
        }
        setTxState("None")
    }, [price])

    // Update quantityValid on change of the quantity state variable
    useEffect(() => {
        if (parseFloat(quantity) > 0) {
            setQuantityValid(true)
        } else {
            setQuantityValid(false)
        }
        setTxState("None")
    }, [quantity])

    return (
        <div align="center">
            <Typography variant="h4">
                Create Event
            </Typography>
            <TextField
                className={classes.field}
                id="outlined-basic"
                label="Name"
                type={"text"}
                variant="outlined"
                onChange={handleNameChange}
            />
            <TextField
                className={classes.field}
                id="outlined-basic"
                label="Price (Dai)"
                type="text"
                variant="outlined"
                onChange={handlePriceChange}
                value={price}
            />
            <TextField
                className={classes.field}
                id="outlined-basic"
                label="Ticket Quantity"
                type="text"
                variant="outlined"
                onChange={handleTicketQuantityChange}
                value={quantity}
            />
            <Button text={txState=="None" ? "Create" : txState} onClick={handleCreateEvent}></Button>
        </div>
    )
}

export default Create

// onChange={(e) => setName(e.target.value)}