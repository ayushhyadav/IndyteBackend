import {
  isValid,
  parseISO,
  format,
  endOfDay,
  startOfDay,
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
