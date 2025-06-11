import dotenv from "dotenv";
dotenv.config();
import otpValidate from "../helpers/otpValidate.js";
import Twilio from "twilio";
const accountSid = process.env.TWILO_ACCOUNT_SID;
const authToken = process.env.TWILO_AUTH_TOKEN;
const client = new Twilio(accountSid, authToken);

import prisma from "../db/db.config.js";

// user singup

function generateOTP() {
  // Generate a random 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString(); // Convert to string to ensure leading zeros are preserved
}

const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).send("Phone number is required");
    }

    const oldOtp = await prisma.otp.findUnique({
      where: {
        phone,
      },
    });
    const otp = generateOTP();
    if (oldOtp !== null) {
      await prisma.otp.update({
        where: {
          id: oldOtp.id,
        },
        data: {
          otp,
        },
      });
    } else {
      await prisma.otp.create({
        data: {
          otp,
          phone,
        },
      });
    }

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "+14066238552",
      to: phone,
    });

    return res.json({
      status: 200,
      message: "Otp send to the client successfully.",
    });
  } catch (error) {
    console.log("Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

const sendOTP = async (phone) => {
  try {
    if (!phone) return { error: "No phone available" };
    const oldOtp = await prisma.otp.findUnique({
      where: {
        phone,
      },
    });
    const otp = generateOTP();
    if (oldOtp)
      await prisma.otp.update({
        where: {
          id: oldOtp.id,
        },
        data: {
          otp,
        },
      });
    else {
      await prisma.otp.create({
        data: {
          otp,
          phone,
        },
      });
    }
    await client.messages.create({
      body: `Your Indyte OTP is: ${otp}`,
      from: "+14066238552",
      to: phone,
    });

    return { message: "Otp sent successfully." };
  } catch (error) {
    console.log(error);
    return { error: error.message };
  }
};

const verifyOTP = async (phone, otp) => {
  try {
    if (!phone || !otp) {
      return { error: "Phone number and OTP are required." };
    }
    const otpData = await prisma.otp.findUnique({
      where: {
        phone,
      },
    });
    if (!otpData) return { error: "Otp is not available." };
    if (otpData.otp !== otp) {
      return { error: "Otp is not valid." };
    }
    const isOtpValid = otpValidate(otpData.updatedAt);

    if (!isOtpValid) {
      return { error: "OTP is expired" };
    }
    return { message: "OTP verified successfully" };
  } catch (error) {
    console.log("Error verifying OTP:", error);
    return { error: error.message };
  }
};

const verifyOtp = async (req, res, phone, otp) => {
  try {
    if (!phone || !otp) {
      return res.status(400).send("Phone number and OTP are required");
    }
    const otpData = await prisma.otp.findUnique({
      where: {
        phone,
      },
    });

    console.log(otpData);
    if (otpData.otp !== otp) {
      return res.send("Invalid OTP");
    }
    const isOtpValid = otpValidate(otpData.updatedAt);

    if (!isOtpValid) {
      return res.send("OTP is expired");
    }
    return res.send("OTP verified successfully");
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.send("Failed to verify OTP");
  }
};

export { sendOtp, verifyOtp, sendOTP, verifyOTP };
