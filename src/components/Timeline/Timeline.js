import { useState } from "react";
import { findOverlappingEvents, parseEvents } from "../../utils";
import timelineItems from "../../timelineItems";
import "./Timeline.css";

export default function Timeline() {
  const [parsedEvents, setParsedEvents] = useState(parseEvents(timelineItems));
  const [editingEventId, setEditingEventId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [draggingEventId, setDraggingEventId] = useState(null);
  const [initialMouseX, setInitialMouseX] = useState(0);
  const [initialStartDate, setInitialStartDate] = useState(null);
  const [initialEndDate, setInitialEndDate] = useState(null);

  const handleDoubleClick = (event) => {
    setEditingEventId(event.id);
    setEditingName(event.name);
  };

  const handleChangeName = (e) => {
    setEditingName(e.target.value);
  };

  const handleBlur = () => {
    setParsedEvents(
      parsedEvents.map((event) =>
        event.id === editingEventId ? { ...event, name: editingName } : event
      )
    );

    setEditingEventId(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const handleDragStart = (event, e) => {
    console.log(event, e);
    setDraggingEventId(event.id);
    setInitialMouseX(e.clientX);
    setInitialStartDate(event.startDate);
    setInitialEndDate(event.endDate);
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragMove = (e) => {
    if (draggingEventId !== null) {
      const deltaX = e.clientX - initialMouseX;
      const columnWidth = 100;
      const days = Math.floor(deltaX / columnWidth);
      setParsedEvents(
        parsedEvents.map((evt) => {
          if (evt.id === draggingEventId) {
            const newStartDate = new Date(initialStartDate.getTime() + days * 24 * 60 * 60 * 1000);
            const newEndDate = new Date(initialEndDate.getTime() + days * 24 * 60 * 60 * 1000);
            return {
              ...evt,
              startDate: newStartDate,
              endDate: newEndDate,
            };
          }
          return evt;
        })
      );
    }
  };

  const handleDragEnd = () => {
    setDraggingEventId(null);
  };

  const lanes = findOverlappingEvents(parsedEvents);

  return (
    <div className="timeline">
      <div className="timeline-container" onMouseMove={handleDragMove} onMouseUp={handleDragEnd}>
        {lanes.map((lane, index) => (
          <div key={index} className="timeline-lane">
            {lane?.map((event) => {
              const startDate = new Date(event.startDate);
              const endDate = new Date(event.endDate);
              const timelineStartDate = new Date("2021-01-01");

              // // Log values for debugging
              // console.log(`Event: ${event.name}`);
              // console.log(`Start Date: ${startDate}`);
              // console.log(`End Date: ${endDate}`);
              // console.log(`Timeline Start Date: ${timelineStartDate}`);

              const gridColumnStart = (startDate - timelineStartDate) / (1000 * 60 * 60 * 24) + 1;
              const gridColumnEnd = (endDate - timelineStartDate) / (1000 * 60 * 60 * 24) + 2;

              // // Log the calculated grid columns
              // console.log(`gridColumnStart: ${gridColumnStart}`);
              // console.log(`gridColumnEnd: ${gridColumnEnd}`);

              return (
                <div
                  key={event.id}
                  className="timeline-event"
                  style={{
                    gridColumnStart: gridColumnStart,
                    gridColumnEnd: gridColumnEnd,
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(event, e)}
                  onDoubleClick={() => handleDoubleClick(event)}
                >
                  {editingEventId === event.id ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => handleChangeName(e)}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyPress}
                      className="timeline-input"
                      autoFocus
                    />
                  ) : (
                    event.name
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
