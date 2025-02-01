import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Box } from '@mui/material';

const AdminPanel = () => {
  const [entries, setEntries] = useState({ abogados: [], procesadoras: [], originadores: [] });
  const [newEntry, setNewEntry] = useState({ name: '', email: '', category: 'abogados' });

  useEffect(() => {
    const fetchEntries = async () => {
      const categories = ['abogados', 'procesadoras', 'originadores'];
      const fetchedEntries = {};
      for (const category of categories) {
        const querySnapshot = await getDocs(collection(db, category));
        fetchedEntries[category] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      setEntries(fetchedEntries);
    };
    fetchEntries();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEntry({ ...newEntry, [name]: value });
  };

  const handleAddEntry = async () => {
    const { name, email, category } = newEntry;
    if (name && email) {
      const docRef = await addDoc(collection(db, category), { name, email });
      setEntries({ ...entries, [category]: [...entries[category], { id: docRef.id, name, email }] });
      setNewEntry({ name: '', email: '', category: 'abogados' });
    }
  };

  const handleEditEntry = async (category, id, updatedEntry) => {
    const entryDoc = doc(db, category, id);
    await updateDoc(entryDoc, updatedEntry);
    setEntries({
      ...entries,
      [category]: entries[category].map(entry => (entry.id === id ? { id, ...updatedEntry } : entry)),
    });
  };

  const handleDeleteEntry = async (category, id) => {
    const entryDoc = doc(db, category, id);
    await deleteDoc(entryDoc);
    setEntries({
      ...entries,
      [category]: entries[category].filter(entry => entry.id !== id),
    });
  };

  return (
    <div>
      <h1>Admin Panel</h1>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Nombre"
          name="name"
          value={newEntry.name}
          onChange={handleInputChange}
        />
        <TextField
          label="Email"
          name="email"
          value={newEntry.email}
          onChange={handleInputChange}
        />
        <FormControl>
          <InputLabel>Categoría</InputLabel>
          <Select
            name="category"
            value={newEntry.category}
            onChange={handleInputChange}
          >
            <MenuItem value="abogados">Abogados de Hipoteca</MenuItem>
            <MenuItem value="procesadoras">Procesadoras</MenuItem>
            <MenuItem value="originadores">Originadores</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleAddEntry}>Agregar</Button>
      </Box>
      {['abogados', 'procesadoras', 'originadores'].map(category => (
        <div key={category}>
          <Typography variant="h6" component="h2">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Typography>
          {entries[category].map(entry => (
            <Box key={entry.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography>{entry.name} ({entry.email})</Typography>
              <Box>
                <Button variant="outlined" onClick={() => handleEditEntry(category, entry.id, { name: 'Nuevo Nombre', email: 'nuevoemail@example.com' })}>Editar</Button>
                <Button variant="outlined" color="error" onClick={() => handleDeleteEntry(category, entry.id)}>Eliminar</Button>
              </Box>
            </Box>
          ))}
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
