import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

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
      <div>
        <input
          type="text"
          name="name"
          value={newEntry.name}
          onChange={handleInputChange}
          placeholder="Nombre"
        />
        <input
          type="email"
          name="email"
          value={newEntry.email}
          onChange={handleInputChange}
          placeholder="Email"
        />
        <select name="category" value={newEntry.category} onChange={handleInputChange}>
          <option value="abogados">Abogados de Hipoteca</option>
          <option value="procesadoras">Procesadoras</option>
          <option value="originadores">Originadores</option>
        </select>
        <button onClick={handleAddEntry}>Agregar</button>
      </div>
      {['abogados', 'procesadoras', 'originadores'].map(category => (
        <div key={category}>
          <h2>{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
          <ul>
            {entries[category].map(entry => (
              <li key={entry.id}>
                {entry.name} ({entry.email})
                <button onClick={() => handleEditEntry(category, entry.id, { name: 'Nuevo Nombre', email: 'nuevoemail@example.com' })}>Editar</button>
                <button onClick={() => handleDeleteEntry(category, entry.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
