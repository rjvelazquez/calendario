import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Box, Paper, IconButton, Divider, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

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
    <Grid container sx={{ p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#f5f5f5', maxWidth: 'xl', mx: 'auto' }} spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom align="center">Panel de Administración</Typography>
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField label="Nombre" name="name" value={newEntry.name} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Email" name="email" value={newEntry.email} onChange={handleInputChange} fullWidth />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Categoría</InputLabel>
                <Select name="category" value={newEntry.category} onChange={handleInputChange}>
                  <MenuItem value="abogados">Abogados de Hipoteca</MenuItem>
                  <MenuItem value="procesadoras">Procesadoras</MenuItem>
                  <MenuItem value="originadores">Originadores</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="contained" color="primary" startIcon={<AddCircleIcon />} onClick={handleAddEntry}>
              Agregar
            </Button>
          </Box>
        </Paper>
      </Grid>

      {['abogados', 'procesadoras', 'originadores'].map(category => (
        <Grid item xs={12} md={4} key={category}>
          <Paper sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {entries[category].map(entry => (
            <EntryItem
                key={entry.id}
                category={category}
                entry={entry}
                handleEditEntry={handleEditEntry}
                handleDeleteEntry={handleDeleteEntry}
              />
            ))}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

const EntryItem = ({ category, entry, handleEditEntry, handleDeleteEntry }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState({ name: entry.name, email: entry.email });

  const handleEditInputChange = (e) => {
    setEditedEntry({ ...editedEntry, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    handleEditEntry(category, entry.id, editedEntry);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedEntry({ name: entry.name, email: entry.email });
  };

  return (
    <Box key={entry.id} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
      {isEditing ? (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
          <TextField
            label="Nombre"
            name="name"
            value={editedEntry.name}
            onChange={handleEditInputChange}
            sx={{ mr: { sm: 1 }, mb: { xs: 1, sm: 0 } }}
            size="small"
          />
          <TextField
            label="Email"
            name="email"
            value={editedEntry.email}
            onChange={handleEditInputChange}
            sx={{ mr: { sm: 2 } }}
            size="small"
          />
        </Box>
      ) : (
        <Typography sx={{ mb: { xs: 1, sm: 0 }, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{entry.name} ({entry.email})</Typography>
      )}
      <Box>
        {isEditing ? (
          <>
          <IconButton color="primary" onClick={handleSaveEdit}>
            <SaveIcon />
          </IconButton>
          <IconButton color="secondary" onClick={handleCancelEdit}>
            <CancelIcon />
          </IconButton>
          </>
        ) : (
          <>
            <IconButton color="primary" onClick={() => setIsEditing(true)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDeleteEntry(category, entry.id)}>
              <DeleteIcon />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default AdminPanel;
