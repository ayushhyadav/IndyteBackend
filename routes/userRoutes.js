const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController');



const {signup}  = require('../controllers/userController');

router.route('/signup').post(signup)

router.post('/sendotp', userController.sendOtp)

router.post('/verifyotp', userController.verifyOtp)

module.exports = router