import React from 'react';
import AdminPanel from './AdminPanel';
import Calendar from './Calendar';
import './App.css';
import LoanForm from './LoanForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Agenda</h1>
      </header>
      <Calendar />
      <LoanForm />
      <AdminPanel />
    </div>
  );
}

export default App;
