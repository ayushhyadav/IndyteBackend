import otpValidate from '../helpers/otpValidate.js';
import otpgen from 'otp-generator';
import Twilio from 'twilio'
const accountSid = "AC00611250c27880073ef08129ede99689"
const authToken = "15a74c2d4d1f0c2393114f582e513eff";
const client = new Twilio(accountSid, authToken);

import prisma from '../db/db.config.js';


// user singup 

function generateOTP() {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); // Convert to string to ensure leading zeros are preserved
}

const sendOtp = async(req, res) => {
  try{
        const phoneNumber = req.body.phone;
        if (!phoneNumber) {
          return res.status(400).send('Phone number is required');
        }

        const oldOtp = await prisma.otp.findUnique({
          where: {
            phone: phoneNumber
          }
        })
        const otp = generateOTP()
        if(oldOtp!==null)
        {
        await prisma.otp.update({
            where: {
              id: oldOtp.id
            },
            data: {
              otp
            }
          })
        } 
        else{
          await prisma.otp.create({
            data: {
                otp,
                phone: phoneNumber
            },
        });
        }
        
      await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: '+14066238552',
      to: phoneNumber
    });
    return res.json(
      {
        status: 200,
        message: "Otp send " + otp,
      }
    );
    
  }
  catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).send('Failed to send OTP');
  }
};

const verifyOtp = async (req,res,phone,otp) => {
  try {

      if (!phone || !otp) {
        return res.status(400).send('Phone number and OTP are required');
      }
      const otpData = await prisma.otp.findUnique({
        where: {
          phone,
        }
      })

      console.log(otpData)
      if (otpData.otp !== otp) {
        return res.send('Invalid OTP');
      }
      const isOtpValid = otpValidate(otpData.updatedAt);

      if(!isOtpValid){
        return res.send("OTP is expired");
      }
      return res.send('OTP verified successfully');
  } 
  catch (error) {

      console.error('Error verifying OTP:', error);
      res.send('Failed to verify OTP');
  }
}

export { sendOtp, verifyOtp }