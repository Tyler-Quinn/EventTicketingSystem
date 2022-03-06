import React from 'react'
import './App.css';
import Header from './components/header/Header'
import AppRoutes from './AppRoutes'
import Box from '@material-ui/core/Box'



function App() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh" className="App">
      <Header />
      <div>
        <AppRoutes />
      </div>
    </Box>
  );
}

export default App;
