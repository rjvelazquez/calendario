import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';
import LoanForm from './LoanForm';
import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Modal, Box, Typography, Button } from '@mui/material';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events'));
    const eventsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvents(eventsData);
  };

  const openModal = (date) => {
    setSelectedDate(date);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  const handleDateClick = (arg) => {
    openModal(arg.date);
  };

  const handleEventClick = async (info) => {
    const newTitle = prompt('Edit event title:', info.event.title);
    if (newTitle) {
      const eventDoc = doc(db, 'events', info.event.id);
      await updateDoc(eventDoc, { title: newTitle });
      info.event.setProp('title', newTitle);
    }
  };

  const handleEventDrop = async (info) => {
    const { event } = info;
    const eventDoc = doc(db, 'events', event.id);
    await updateDoc(eventDoc, { start: event.start });
    setEvents(events.map(e => e.id === event.id ? { ...e, start: event.start } : e));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        editable={true}
        droppable={true}
      />
      <Modal open={modalIsOpen} onClose={closeModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <Typography variant="h6" component="h2">
            Agregar Evento
          </Typography>
          <LoanForm selectedDate={selectedDate} closeModal={closeModal} isOpen={modalIsOpen} />
          <Button onClick={closeModal}>Cerrar</Button>
        </Box>
      </Modal>
    </>
  );
};

export default Calendar;
