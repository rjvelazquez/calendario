import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';
import moment from 'moment-timezone';
import LoanForm from './LoanForm';
import { db } from './firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Modal, Box } from '@mui/material';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventModalIsOpen, setEventModalIsOpen] = useState(false);

  const fetchEvents = async () => {
    const querySnapshot = await getDocs(collection(db, 'events'));
    const eventsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      start: doc.data().start.toDate(),
      end: doc.data().end.toDate(),
      extendedProps: doc.data().extendedProps
    }));
    setEvents(eventsData);
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    setEventModalIsOpen(true);
  };

  const closeEventModal = () => setEventModalIsOpen(false);

  const handleDateClick = (arg) => {
    const currentDateTime = moment().tz('America/Puerto_Rico').format();
    setSelectedEvent({
      title: '',
      start: currentDateTime,
      end: currentDateTime,
      allDay: true,
    });
    setEventModalIsOpen(true);
  };

  const handleEventClick = (info) => {
    openEventModal(info.event);
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
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        eventDrop={handleEventDrop}
        editable={true}
        droppable={true}
      />
      <Modal open={eventModalIsOpen} onClose={closeEventModal}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          <LoanForm selectedDate={selectedEvent ? selectedEvent.start : null} closeModal={closeEventModal} isOpen={eventModalIsOpen} />
        </Box>
      </Modal>
    </>
  );
};

export default Calendar;
