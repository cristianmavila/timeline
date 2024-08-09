import "./Timeline.css";
import { Event } from "./types";
import timelineItems from "../../timelineItems";
import { ChangeEvent, DragEvent, useState } from "react";
import { findOverlappingEvents, parseEvents } from "../../utils";

export default function Timeline() {
  const [parsedEvents, setParsedEvents] = useState<Event[]>(parseEvents(timelineItems as Event[]));
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>("");
  const [draggingEventId, setDraggingEventId] = useState<number | null>(null);
  const [initialMouseX, setInitialMouseX] = useState<number>(0);
  const [initialStartDate, setInitialStartDate] = useState<Date | null>(null);
  const [initialEndDate, setInitialEndDate] = useState<Date | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom * 1.2, 5)); // Zoom in with a factor of 1.2, max zoom is 5x
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom / 1.2, 0.2)); // Zoom out with a factor of 1.2, min zoom is 0.2x
  };

  const handleDoubleClick = (event: Event) => {
    setEditingEventId(event.id);
    setEditingName(event.name);
  };

  const handleChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingName(e.target.value);
  };

  const handleBlur = () => {
    setParsedEvents(
      parsedEvents.map((event: Event) =>
        event.id === editingEventId ? { ...event, name: editingName } : event
      )
    );

    setEditingEventId(null);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const handleDragStart = (event: Event, e: DragEvent<HTMLDivElement>) => {
    // console.log(event, e);
    setDraggingEventId(event.id);
    setInitialMouseX(e.clientX);
    setInitialStartDate(event.startDate);
    setInitialEndDate(event.endDate);
  };

  const handleDragMove = (e: { clientX: number }) => {
    if (draggingEventId !== null) {
      const deltaX = e.clientX - initialMouseX;
      const columnWidth = 100;
      const days = Math.floor(deltaX / columnWidth);
      setParsedEvents(
        parsedEvents.map((evt) => {
          if (evt.id === draggingEventId && initialStartDate && initialEndDate) {
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
      <div className="zoom-controls">
        <button onClick={handleZoomIn} disabled={zoomLevel === 5}>
          Zoom In
        </button>
        <button onClick={handleZoomOut} disabled={zoomLevel === 0.2}>
          Zoom Out
        </button>
      </div>
      <div
        className="timeline-container"
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        style={{
          gridTemplateColumns: `repeat(100, ${zoomLevel * 50}px)`,
        }}
      >
        {lanes.map((lane, index) => (
          <div key={index} className="timeline-lane">
            {lane?.map((event: Event) => {
              const startDate = new Date(event.startDate).valueOf();
              const endDate = new Date(event.endDate).valueOf();
              const timelineStartDate = new Date("2021-01-01").valueOf();

              // // Log values for debugging
              // console.log(`Event: ${event.name}`);
              // console.log(`Start Date: ${startDate}`);
              // console.log(`End Date: ${endDate}`);
              // console.log(`Timeline Start Date: ${timelineStartDate}`);

              const gridColumnStart: number =
                (startDate - timelineStartDate) / (1000 * 60 * 60 * 24) + 1;
              const gridColumnEnd: number =
                (endDate - timelineStartDate) / (1000 * 60 * 60 * 24) + 2;

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
