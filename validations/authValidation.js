import vine from "@vinejs/vine";
// import { CustomErrorReporter } from "./customErrorReporter";

// * Custom Error Reporter

export const registerSchema = vine.object({
  name: vine.string().minLength(2).maxLength(150),
  email: vine.string().email(),
  phone: vine.string().minLength(13).maxLength(13),
  password: vine.string().minLength(6).maxLength(100),
});

export const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string(),
});