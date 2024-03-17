import {
  isValid,
  parseISO,
  format,
  parse,
  endOfDay,
  startOfDay,
  differenceInMilliseconds,
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
  if (index == sortedTime.length - 1)
    return { total, finished, nextMedicine: sortedTime[0] };
  else return { total, finished, nextMedicine: sortedTime[index + 1] };
};
