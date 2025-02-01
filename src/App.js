import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import AdminPanel from './AdminPanel';
import Calendar from './Calendar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Calendario
              </Typography>
              <Button color="inherit" component={Link} to="/">Inicio</Button>
              <Button color="inherit" component={Link} to="/admin">Admin Panel</Button>
            </Toolbar>
          </AppBar>
        </header>
        <Routes>
          <Route exact path="/" element={<Calendar />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
