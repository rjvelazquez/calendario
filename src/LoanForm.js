import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import moment from 'moment-timezone';
import { Modal, Box, Typography, Button, TextField, MenuItem, Select, InputLabel, FormControl, FormHelperText, IconButton, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const LoanForm = ({ selectedDate, closeModal, isOpen, selectedEvent }) => {
  const [loanNumber, setLoanNumber] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.loanNumber : '');
  const [clientName, setClientName] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.clientName : '');
  const [clientEmail, setClientEmail] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.clientEmail : '');
  const [startDate, setStartDate] = useState(selectedEvent ? moment(selectedEvent.start).tz('America/Puerto_Rico').format('YYYY-MM-DD') : '');
  const [startTime, setStartTime] = useState(selectedEvent ? moment(selectedEvent.start).tz('America/Puerto_Rico').format('HH:mm') : '');
  const [endDate, setEndDate] = useState(selectedEvent ? moment(selectedEvent.end).tz('America/Puerto_Rico').format('YYYY-MM-DD') : '');
  const [endTime, setEndTime] = useState(selectedEvent ? moment(selectedEvent.end).tz('America/Puerto_Rico').format('HH:mm') : '');
  const [contribution, setContribution] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.contribution : '');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      const date = moment(selectedDate).tz('America/Puerto_Rico');
      if (!selectedEvent || !selectedEvent.id) {
        setStartDate(date.format('YYYY-MM-DD'));
        const currentTime = moment().tz('America/Puerto_Rico');
        setStartTime(currentTime.format('HH:mm'));
        const endTime = moment(currentTime).add(30, 'minutes');
        setEndDate(date.format('YYYY-MM-DD'));
        setEndTime(endTime.format('HH:mm'));
      }
    }
  }, [selectedDate, selectedEvent]);
    
  const [abogados, setAbogados] = useState([]);
  const [procesadoras, setProcesadoras] = useState([]);
  const [originadores, setOriginadores] = useState([]);
  const [selectedAbogado, setSelectedAbogado] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.abogado : '');
  const [selectedProcesadora, setSelectedProcesadora] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.procesadora : '');
  const [selectedOriginador, setSelectedOriginador] = useState(selectedEvent && selectedEvent.extendedProps ? selectedEvent.extendedProps.originador : '');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const abogadosSnapshot = await getDocs(collection(db, 'abogados'));
        const procesadorasSnapshot = await getDocs(collection(db, 'procesadoras'));
        const originadoresSnapshot = await getDocs(collection(db, 'originadores'));

        setAbogados(abogadosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setProcesadoras(procesadorasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setOriginadores(originadoresSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data: ", error);
        alert("Error al cargar los datos. Por favor, inténtelo de nuevo.");
      }
    };

    fetchData();
  }, []);

  const [pdfLink, setPdfLink] = useState(null);

  useEffect(() => {
    if (selectedEvent && selectedEvent.extendedProps && selectedEvent.extendedProps.file) {
      setPdfLink(selectedEvent.extendedProps.file);
    }
  }, [selectedEvent]);

const handleSubmit = async (e) => {
    e.preventDefault();

    let fileData = null;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        fileData = reader.result;

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
            file: fileData
          }
        };

        if (selectedEvent && selectedEvent.id) {
          const eventDoc = doc(db, 'events', selectedEvent.id);
          try {
            await updateDoc(eventDoc, event);
            alert('Evento actualizado exitosamente');
          } catch (error) {
            console.error("Error updating event: ", error);
            alert("Error al actualizar el evento. Por favor, inténtelo de nuevo.");
          }
        } else {
          try {
            await addDoc(collection(db, 'events'), event);
            alert('Evento creado exitosamente');
          } catch (error) {
            console.error("Error creating event: ", error);
            alert("Error al crear el evento. Por favor, inténtelo de nuevo.");
          }
        }

        closeModal();
      };
      reader.readAsDataURL(file);
    } else {
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
          file: null
        }
      };

      if (selectedEvent && selectedEvent.id) {
        const eventDoc = doc(db, 'events', selectedEvent.id);
        await updateDoc(eventDoc, event);
        alert('Evento actualizado exitosamente');
      } else {
        await addDoc(collection(db, 'events'), event);
        alert('Evento creado exitosamente');
      }

      closeModal();
    }
  };

  const handleDelete = async () => {
    if (selectedEvent) {
      const eventDoc = doc(db, 'events', selectedEvent.id);
      try {
        await deleteDoc(eventDoc);
        alert('Evento eliminado exitosamente');
      } catch (error) {
        console.error("Error deleting event: ", error);
        alert("Error al eliminar el evento. Por favor, inténtelo de nuevo.");
      }
      closeModal();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Por favor, suba un archivo PDF.');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
    } else {
      alert('Por favor, arrastra un archivo PDF válido.');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };


  const [isModified, setIsModified] = useState(false);

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setIsModified(true);
  };

  const handleClose = () => {
    if (isModified) {
      if (window.confirm("¿Estás seguro de que deseas cerrar? Se perderán los datos no guardados.")) {
        closeModal();
      }
    } else {
      closeModal();
    }
  };

return (
    <Modal open={isOpen} onClose={handleClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '95%', sm: 'sm', md: 'md' }, // Ajuste de anchura responsive
        maxWidth: 'md', // Anchura máxima para pantallas grandes
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: { xs: 2, sm: 3, md: 4 }, // Padding responsive
        borderRadius: 2,
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <Typography variant="h6" component="h2" align="center" sx={{ mb: 3 }}>
          Crear Evento de Préstamo
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Número de Préstamo"
            type="text"
            value={loanNumber}
            onChange={handleInputChange(setLoanNumber)}
            required
            fullWidth
            margin="normal"
            inputProps={{ pattern: '\\d{1,20}', title: 'Solo números y máximo de 20 caracteres.' }}
          />

          <TextField
            label="Nombre del Cliente"
            type="text"
            value={clientName}
            onChange={handleInputChange(setClientName)}
            required
            fullWidth
            margin="normal"
            inputProps={{ maxLength: 100 }}
          />

          <TextField
            label="Email del Cliente"
            type="email"
            value={clientEmail}
            onChange={handleInputChange(setClientEmail)}
            required
            fullWidth
            margin="normal"
          />

          <TextField
            label="Fecha de Inicio"
            type="date"
            value={startDate}
            onChange={handleInputChange(setStartDate)}
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
            onChange={handleInputChange(setStartTime)}
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
            onChange={handleInputChange(setEndDate)}
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
            onChange={handleInputChange(setEndTime)}
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
            onChange={handleInputChange(setContribution)}
            step="0.01"
            fullWidth
            margin="normal"
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Abogado de Hipoteca</InputLabel>
            <Select
              value={selectedAbogado}
              onChange={handleInputChange(setSelectedAbogado)}
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
              onChange={handleInputChange(setSelectedProcesadora)}
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
              onChange={handleInputChange(setSelectedOriginador)}
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

          <FormControl fullWidth margin="normal">
          <InputLabel shrink htmlFor="upload-file">Closing Disclosure (PDF)</InputLabel>
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              border: '2px dashed #007BFF',
              padding: '20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              backgroundColor: '#f9f9f9',
              marginTop: '20px',
              '&:hover': {
                backgroundColor: '#e6f7ff',
                borderColor: '#0056b3'
              }
            }}
          >
            <input
              id="upload-file"
              type="file"
              onChange={handleFileChange}
              accept="application/pdf"
              style={{ display: 'none' }}
            />
            <label htmlFor="upload-file" style={{ width: '100%', textAlign: 'center' }}>
              {file ? file.name : 'Haz clic o arrastra un archivo PDF aquí'}
            </label>
            </Box>
            
          {pdfLink && ( 
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2">
        <a href="#" onClick={() => {
          const newWindow = window.open();
          newWindow.document.write(
            `<iframe src="${pdfLink}" width="100%" height="100%"></iframe>`
          );
        }}>Ver PDF</a>
              </Typography>
            </Box>
          )}
          </FormControl>
          {/* Separador */}
          {/* Separador */}
          <Box sx={{ height: 24 }} />
          {/* Linea separadora */}
          <Divider sx={{ mb: 2 }} />
          {/* Separador */}
          <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 4 }}>
            <Button onClick={handleClose} variant="outlined" color="inherit" startIcon={<CloseIcon />}>
              Cancelar
            </Button>
            {selectedEvent.id && (
              <Button color="error" variant="contained" onClick={handleDelete} startIcon={<DeleteIcon />}>
                Eliminar
              </Button>
            )}
            <Button type="submit" color="primary" variant="contained" startIcon={<SaveIcon />}>
              Guardar
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default LoanForm;
