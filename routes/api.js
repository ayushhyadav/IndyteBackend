import { Router } from "express";
import AuthController from "../controllers/user/AuthController.js";
import authMiddleware, {
  onlyUser,
  adminOrDietician,
} from "../middleware/Authenticate.js";

import ProfileController from "../controllers/ProfileController.js";
import DeiticianProfileController from "../AdminController/DieticianProfileController.js";

import ClientMealController from "../controllers/dietician/ClientMealController.js";

import MealController from "../AdminController/MealController.js";
import ClientController from "../AdminController/ClientController.js";
import UserMealController from "../controllers/user/UserMealController.js";
import waterIntakeController from "../controllers/water/waterIntakeController.js";
import waterLogController from "../controllers/water/waterLogController.js";
import stepsIntakeController from "../controllers/steps/stepsIntakeController.js";
import StepsLogController from "../controllers/steps/stepsLogController.js";
import sleepIntakeController from "../controllers/sleep/sleepIntakeController.js";
import SleepLogController from "../controllers/sleep/sleepLogController.js";
import UserController from "../controllers/user/UserContoller.js";
import GetLogs from "../controllers/user/LogsInATimeFrameController.js";
import WorkoutController from "../AdminController/WorkoutController.js";
import ExcersiseController from "../AdminController/ExcersiseController.js";
import WeightLogController from "../controllers/weight/weightLogContoller.js";
import ProgressTracker from "../controllers/user/ProgressController.js";
import MedicineController from "../controllers/user/MedicineController.js";
import MealStatsController from "../controllers/meal/MealStatsController.js";
import WorkoutStatsController from "../controllers/workout/WorkoutStatsController.js";
import DieticianAuthController from "../controllers/dietician/AuthController.js";

const router = Router();

// User side routing ->

router.post("/auth/register", AuthController.register);
router.post("/auth/registerverify", AuthController.verifyOtpandRegister);

//email login
router.post("/auth/login", AuthController.login);

//this is for otp login and verify
router.post("/auth/otplogin", AuthController.otpLogin);
router.post("/auth/verifylogin", AuthController.verifyOtpandLogin);
router.post("/auth/forgetpass", AuthController.forgotPasswordSendOtp);
router.post("/auth/resetpass", AuthController.resetPassword);

router.get("/profile", authMiddleware, ProfileController.index); // private route
router.put("/profile/:id", authMiddleware, ProfileController.update); // private route
router.get("/getuserprofile", ProfileController.getSingleUseronId);

// --------------------------------------------->
// create dietician
router.post("/diet", DeiticianProfileController.register);
router.post("/dietician-login", DieticianAuthController.login);
router.post(
  "/dietician-forgetpass",
  DieticianAuthController.forgotPasswordSendOtp
);
router.post("/dietician-resetpass", DieticianAuthController.resetPassword);

//get dieticians
router.get("/getdiet", DeiticianProfileController.index);

// get dieticiansById
router.get("/getdietbyid/:id", DeiticianProfileController.getById);
// update dietician
router.put("/updatedietbyid/:id", DeiticianProfileController.updateById);
// delete dietician
router.delete("/deletedietbyid/:id", DeiticianProfileController.deleteById);

// ---------------------- Meal - --------------->

// create meal
router.post("/meal", MealController.register);
router.get("/getallmeal", MealController.index);

// get meal
router.get("/getmealbyid/:id", MealController.getById);
// update meal
router.put("/updatemealbyid/:id", MealController.updateById);
// delete meal
router.delete("/deletemealbyid/:id", MealController.deleteById);

// crud ->
router.post("/assignmeal", ClientMealController.assignMeal);
router.get("/getusermeals", ClientMealController.getUserMeals);
router.put("/unassignmeal", ClientMealController.unassignMeal);
router.get("/getusermealsbydate", ClientMealController.getUserMealsForADate);

// admin assigns clients to dieticians
//dietician to client

router.post("/assignclient", ClientController.assignClients);
router.post("/assignmanyclients", ClientController.assignManyClients);
router.post("/updateclient", ClientController.updateClients);
router.get("/getclients", ClientController.getClients);

//user functionality with meal

router.post("/markfinished", UserMealController.CreateMealLog);
router.get("/getusermeallog", UserMealController.getUserMealLog);
router.get("/getusermeallogbyday", UserMealController.getUserMealForDay);
router.get("/getusermeallogbymonth", GetLogs.GetLogsByMonth);

// we need to do this date wise ------->

// user functionality with water

router.post("/water-intake", waterIntakeController.createWaterIntake);

// Get Daily Water Intake Logs for a User:
router.get("/water-logs/:userId/:date", waterLogController.getWaterLog);
router.delete(
  "/water-delete/:intakeId",
  waterIntakeController.deleteWaterIntake
);

// steps

router.post("/steps-intake", stepsIntakeController.createStepIntake);
router.get("/steps-logs/:userId/:date", StepsLogController.getStepsLog);
router.get("/getusersteps", onlyUser, StepsLogController.getUserStepProgress);
router.get(
  "/getusersteps/:id",
  adminOrDietician,
  StepsLogController.getUserStepProgress
);

// sleep wali bakchodiyan

router.post("/sleep-intake", sleepIntakeController.createSleepIntake);
router.get("/sleep-logs/:userId/:date", SleepLogController.getsleepLog);
router.put("/sleep-update/:intakeId", sleepIntakeController.updateSleepIntake);

// get all users

router.get("/getallusers", UserController.getAllUsers);
router.get("/getnewusers", UserController.getNewUsers);

// excercise

router.post("/createexercise", ExcersiseController.createExcersise);
router.get("/getallexercise", ExcersiseController.getExcersise);
router.post("/createworkout", WorkoutController.createWorkout);
router.post("/assignworkout", WorkoutController.assignWorkout);
router.get("/getallworkout", WorkoutController.getAllWorkouts);
router.post("/markfinishedworkout", WorkoutController.MarkFinished);
router.delete("/unassign-workout", WorkoutController.unassignWorkout);

router.get("/getuserworkout", WorkoutController.getUserWorkouts);
router.get("/getworkoutfordate", WorkoutController.getUserWorkoutsForDate);
router.get("/getallworkout", WorkoutController.getAllWorkouts);

router.post("/weight-logs/:userId", WeightLogController.createLog);
router.get("/get-weight-logs/:userId", WeightLogController.getLogs);

//progress Tracker
router.get(
  "/getusermealprogress",
  onlyUser,
  MealController.getUserMealsProgress
);

router.get(
  "/getusermealprogress/:id",
  adminOrDietician,
  MealController.getUserMealsProgress
);

router.get(
  "/getuserworkoutprogress",
  onlyUser,
  ProgressTracker.getUserWorkoutProgress
);

router.get(
  "/getuserworkoutprogress/:id",
  adminOrDietician,
  ProgressTracker.getUserWorkoutProgress
);

router.get("/getdailyworkoutprogress", ProgressTracker.getDailyWorkoutProgress);
router.get(
  "/getweeklyworkoutprogress",
  ProgressTracker.getLastWeekWorkoutProgress
);
router.get(
  "/getmonthlyworkoutprogress",
  ProgressTracker.getCurrentMonthWorkoutProgress
);
router.get(
  "/getyearlyworkoutprogress",
  ProgressTracker.getYearlyWorkoutProgress
);

router.get("/getdailydietprogress", ProgressTracker.DailyDietProgress);
router.get("/getweeklydietprogress", ProgressTracker.LastWeekDietProgress);
router.get(
  "/getmonthlydietprogress",
  ProgressTracker.getCurrentMonthDietProgress
);
router.get("/getyearlydietprogress", ProgressTracker.getYearlyDietProgress);

router.get("/getlastweekwaterprogress", ProgressTracker.LastWeekWaterProgress);
router.get(
  "/getlastmonthwaterprogress",
  ProgressTracker.LastMonthWaterProgress
);

router.get("/getlastweeksleepprogress", ProgressTracker.LastWeekSleepProgress);
router.get(
  "/getlastmonthsleepprogress",
  ProgressTracker.LastMonthSleepProgress
);

router.get(
  "/getlastweekweightprogress",
  ProgressTracker.LastWeekWeightProgress
);
// router.get('/getlastmonthweightprogress', ProgressTracker.LastMonthWeightProgress);

//medicine
router.get("/getmedicines", MedicineController.getMedicinesForDateAndUser);
router.post("/createmedicine", MedicineController.createMedicine);
router.post("/markmedicinetaken", MedicineController.markMedicineAsTaken);

// get meal stats
router.get("/meal-stats", MealStatsController.getMealStats);
router.get("/all-meal-stats", MealStatsController.getAllTimeData);

// get workout stats
router.get("/workout-stats", WorkoutStatsController.getStats);
router.get("/all-workout-stats", WorkoutStatsController.getAllTimeWorkoutData);

// getDashboardStats
router.get("/dashboard", onlyUser, GetLogs.getDashboard);
router.get("/caloriesProgress", onlyUser, ProgressTracker.caloriesTracker);
router.get(
  "/caloriesProgress/:id",
  adminOrDietician,
  ProgressTracker.caloriesTracker
);

export default router;
