import jwt from "jsonwebtoken";
import {
  validatorCompile,
  tokenValidate,
} from "../validations/authValidation.js";
export const generateToken = async (data) => {
  const tokenData = await validatorCompile(tokenValidate, data);
  if (tokenData.error) throw new Error(tokenData.error);
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
  return token;
};
