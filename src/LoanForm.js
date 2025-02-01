import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import moment from 'moment-timezone';
import { Modal, Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, FormHelperText } from '@mui/material';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const LoanForm = ({ selectedDate, closeModal, isOpen }) => {
  const [loanNumber, setLoanNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (selectedDate) {
      const date = moment(selectedDate).tz('America/Puerto_Rico');
      setStartDate(date.format('YYYY-MM-DD'));
      setStartTime(date.format('HH:mm'));
      setEndDate(date.format('YYYY-MM-DD'));
      setEndTime(date.add(1, 'hour').format('HH:mm'));
    }
  }, [selectedDate]);
  const [contribution, setContribution] = useState('');
  const [abogados, setAbogados] = useState([]);
  const [procesadoras, setProcesadoras] = useState([]);
  const [originadores, setOriginadores] = useState([]);
  const [selectedAbogado, setSelectedAbogado] = useState('');
  const [selectedProcesadora, setSelectedProcesadora] = useState('');
  const [selectedOriginador, setSelectedOriginador] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const abogadosSnapshot = await getDocs(collection(db, 'abogados'));
      const procesadorasSnapshot = await getDocs(collection(db, 'procesadoras'));
      const originadoresSnapshot = await getDocs(collection(db, 'originadores'));

      setAbogados(abogadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setProcesadoras(procesadorasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setOriginadores(originadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Debe adjuntar un archivo PDF.');
      return;
    }

    const event = {
      title: `Préstamo: ${loanNumber} - ${clientName}`,
      start: new Date(`${startDate}T${startTime}`),
      end: new Date(`${endDate}T${endTime}`),
      extendedProps: {
        loanNumber,
        clientName,
        clientEmail,
        contribution,
        abogado: selectedAbogado,
        procesadora: selectedProcesadora,
        originador: selectedOriginador,
        file: file ? file.name : null
      }
    };

    await addDoc(collection(db, 'events'), event);
    alert('Evento creado exitosamente');
    closeModal();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Por favor, suba un archivo PDF.');
    }
  };

  return (
    <Modal open={isOpen} onClose={closeModal}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
        maxHeight: '80vh',  // Limita la altura máxima
        overflowY: 'auto'   // Activa el scroll vertical
      }}>
        <Typography variant="h6" component="h2" align="center" sx={{ mb: 2 }}>
          Crear Evento de Préstamo
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Número de Préstamo"
            type="text"
            value={loanNumber}
            onChange={(e) => setLoanNumber(e.target.value)}
            required
            fullWidth
            margin="normal"
            inputProps={{ pattern: '\\d{1,20}', title: 'Solo números y máximo de 20 caracteres.' }}
          />

          <TextField
            label="Nombre del Cliente"
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            label="Email del Cliente"
            type="email"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Fecha de Inicio"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Hora de Inicio"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Fecha de Fin"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Hora de Fin"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Contribución"
            type="number"
            value={contribution}
            onChange={(e) => setContribution(e.target.value)}
            step="0.01"
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Abogado de Hipoteca</InputLabel>
            <Select
              value={selectedAbogado}
              onChange={(e) => setSelectedAbogado(e.target.value)}
              label="Abogado de Hipoteca"
            >
              <MenuItem value="">
                <em>Seleccione un abogado</em>
              </MenuItem>
              {abogados.map(abogado => (
                <MenuItem key={abogado.id} value={abogado.id}>
                  {abogado.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Selecciona un abogado de la lista</FormHelperText>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Procesadora</InputLabel>
            <Select
              value={selectedProcesadora}
              onChange={(e) => setSelectedProcesadora(e.target.value)}
            >
              <MenuItem value="">
                <em>Seleccione una procesadora</em>
              </MenuItem>
              {procesadoras.map(procesadora => (
                <MenuItem key={procesadora.id} value={procesadora.id}>
                  {procesadora.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>Originador</InputLabel>
            <Select
              value={selectedOriginador}
              onChange={(e) => setSelectedOriginador(e.target.value)}
            >
              <MenuItem value="">
                <em>Seleccione un originador</em>
              </MenuItem>
              {originadores.map(originador => (
                <MenuItem key={originador.id} value={originador.id}>
                  {originador.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          Closing Disclosure: 
          </Typography>

          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 2 }}
          >
            Subir Archivo PDF
            <input type="file" onChange={handleFileChange} accept="application/pdf" hidden />
          </Button>
          {/* Separador */}
          <Box sx={{ height: 16 }} />
          {/* Linea separadora */}
          <hr />
          {/* Separador */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button variant="outlined" onClick={closeModal} sx={{ width: '48%' }}>
              Cerrar
            </Button>
            <Button type="submit" variant="contained" sx={{ width: '48%' }}>
              Enviar
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default LoanForm;
