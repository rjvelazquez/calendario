import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);

  const handleDateClick = (arg) => {
    const title = prompt('Enter event title:');
    if (title) {
      setEvents([...events, { title, start: arg.date }]);
    }
  };

  const handleEventClick = (info) => {
    const newTitle = prompt('Edit event title:', info.event.title);
    if (newTitle) {
      info.event.setProp('title', newTitle);
    }
  };

  const handleEventDrop = (info) => {
    const { event } = info;
    setEvents(events.map(e => e.id === event.id ? { ...e, start: event.start } : e));
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      events={events}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      eventDrop={handleEventDrop}
      editable={true}
      droppable={true}
    />
  );
};

export default Calendar;
