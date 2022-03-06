import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Route, Routes } from 'react-router-dom'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'

const HeaderRoutes = () => {
    const { pathname } = useLocation()
    const value = pathname.split('/').slice(0,2).join('/')

    const handleChange = (_value) => {
        console.log(_value)
    }

    return (
        <div>
            <Tabs value={value || '/purchase'} onChange={handleChange}>
                <Tab label='Purchase' value='/purchase' to='/purchase' component={Link} />
                <Tab label='Create' value='/create' to='/create' component={Link} />
                <Tab label='Manage' value='/manage' to='/manage' component={Link} />
                <Tab label='Check' value='/check' to='/check' component={Link} />
            </Tabs>
            <Routes>
                <Route path='/purchase' />
                <Route path='/create'  />
                <Route path='/manage' />
                <Route path='/check' />
            </Routes>
        </div> 
    )
}

export default HeaderRoutes