// import { compareAsc, parse, addDays, formatDistance } from "date-fns";
// const nextTime = (time) => {
//   let parsedTime = parse(time, "h:mm a", new Date());
//   if (compareAsc(new Date(), parsedTime) == 1) {
//     parsedTime = addDays(parsedTime, 1);
//   }
//   const formatD = formatDistance(parsedTime, new Date());
//   return "in " + formatD;
// };

// const nextTimes = nextTime("06:00 PM");
// const nextTimes2 = nextTime("02:00 PM");

// console.log(compareAsc(new Date(), nextTimes2));

// console.log(nextTimes2);
// console.log(new Date());
// console.log(nextTimes);
// router.delete("/test", onlyAdmin, () => console.log("hello"));


import bcrypt from 'bcrypt';

// Your test password
const password = 'Mohit@112';

// Generate a salt with the same cost factor
const salt = bcrypt.genSaltSync(10);
console.log('Generated Salt:', salt);

// Hash the password with the generated salt
const hashedPassword = bcrypt.hashSync(password, salt);
console.log('Hashed Password:', hashedPassword);
