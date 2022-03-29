import React, { useState, useEffect } from 'react'
import { TextField, makeStyles, Typography } from '@material-ui/core'
import Button from '../../components/buttons/Button'
import { useWeb3Context } from '../../contexts/Web3Context'

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

    const { provider, address, balance, connectedNetworkId } = useWeb3Context()

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
    }

    const handleTicketQuantityChange = (e) => {
        const number = e.target.value.replace(/[^0-9]/g, '')
        setQuantity(number)
    }

    const displayName = (e) => {
        e.preventDefault()
        console.log(address)
        console.log(connectedNetworkId)
    }

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
                label="Price"
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
            <Button text='Create' onClick={displayName}></Button>
        </div>
    )
}

export default Create

// onChange={(e) => setName(e.target.value)}