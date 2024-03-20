import {
  isValid,
  parseISO,
  format,
  parse,
  endOfDay,
  startOfDay,
  compareAsc,
  formatDistance,
  subDays,
} from "date-fns";

export const validDate = (dateString) => {
  const parsedDate = parseISO(dateString);
  return isValid(parsedDate);
};

export const getDateRange = (date, currentDate) => {
  const startDate = format(
    startOfDay(subDays(currentDate, date - 1)),
    "yyyy-MM-dd"
  );
  const endDate = format(endOfDay(currentDate, 1), "yyyy-MM-dd");
  return { startDate, endDate };
};

export const formatDate = (date) => {
  const formatString = "yyyy-MM-dd";
  const formattedDate = format(date, formatString);
  return formattedDate;
};

export const findNearestTime = (times) => {
  if (!Array.isArray(times) || times.length === 0)
    return { total: 0, finished: 0, nextMedicine: {} };
  const currentTime = new Date();
  const currentMilliseconds = currentTime.getTime();
  const newTime = times.map((time) => {
    const timeDate = parse(time.time, "hh:mm aa", new Date());
    const currentTimeInMs = timeDate.getTime();
    return {
      ...time,
      currentTime: currentTimeInMs,
    };
  });
  const total = times.length;
  const finished = times.reduce((count, medicineItem) => {
    return count + (medicineItem.finished === "true" ? 1 : 0);
  }, 0);
  newTime.push({ currentTime: currentMilliseconds, time: currentTime });
  const sortedTime = newTime.sort((a, b) => a.currentTime - b.currentTime);
  const index = sortedTime.findIndex(
    (time) => time.currentTime === currentMilliseconds
  );
  const nextTime = (time) => {
    let parsedTime = parse(time, "h:mm a", new Date());
    if (compareAsc(new Date(), parsedTime) == 1) {
      parsedTime = addDays(parsedTime, 1);
    }
    const formatD = formatDistance(parsedTime, new Date());
    return formatD;
  };

  if (index == sortedTime.length - 1)
    return {
      total,
      finished,
      nextMedicine: { in: nextTime(sortedTime[0].time), ...sortedTime[0] },
    };
  else
    return {
      total,
      finished,
      nextMedicine: {
        in: nextTime(sortedTime[index + 1].time),
        ...sortedTime[index + 1],
      },
    };
};

export const isValidObjectId = (str) => {
  return /^[0-9a-fA-F]{24}$/.test(str);
};
