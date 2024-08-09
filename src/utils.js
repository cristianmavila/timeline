/**
 * Parse event to transform string date into javascript date objects
 */
export const parseEvents = (events) => {
  return events.map((event) => ({
    ...event,
    startDate: new Date(event.start),
    endDate: new Date(event.end),
  }));
};

/**
 * Calculating lanes to avoid overlapping events
 */
export const findOverlappingEvents = (events) => {
  let all = [];

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
