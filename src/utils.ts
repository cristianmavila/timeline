import { Event } from "./components/Timeline/types";

/**
 * Parse event to transform string date into javascript date objects
 */
export const parseEvents = (events: Event[]) => {
  return events.map((event) => ({
    ...event,
    startDate: new Date(event.start),
    endDate: new Date(event.end),
  }));
};

/**
 * Calculating lanes to avoid overlapping events
 */
export const findOverlappingEvents = (events: Event[]) => {
  let all: Event[][] = [];

  events.forEach((element) => {
    let placed = false;

    for (let lane of all) {
      if (lane[lane.length - 1].endDate < element.startDate) {
        lane.push(element);
        placed = true;
        break;
      }
    }

    if (!placed) {
      all.push([element]);
    }
  });

  return all;
};
