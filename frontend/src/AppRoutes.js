import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Purchase from './pages/Purchase/Purchase'
import Create from './pages/Create/Create'
import Manage from './pages/Manage/Manage'
import Check from './pages/Check/Check'

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/purchase" element={<Purchase />} /> 
            <Route path="/create" element={<Create />} /> 
            <Route path="/manage" element={<Manage />} /> 
            <Route path="/check" element={<Check />} /> 
        </Routes>
    )
}

export default AppRoutes