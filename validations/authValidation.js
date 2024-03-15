import vine from "@vinejs/vine";

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

export const dieticianRegisterSchema = vine.object({
  username: vine.string(),
  password: vine.string().minLength(6).maxLength(100),
  name: vine.string().minLength(2).maxLength(150),
  qualification: vine.string(),
  address: vine.string(),
  aadhar: vine.string(),
  pan: vine.string(),
  other_doc: vine.string(),
  certificate: vine.string(),
  phone: vine.string().minLength(13).maxLength(13),
  work_exp: vine.string(),
  email: vine.string().email(),
});
export const adminRegisterSchema = vine.object({
  username: vine.string(),
  password: vine.string().minLength(6).maxLength(100),
  name: vine.string().minLength(2).maxLength(150),
  logo: vine.string().optional(),
  address: vine.string(),
  company: vine.string().optional(),
  company_details: vine.string(),
  company_address: vine.string().optional(),
  tax_number: vine.string(),
  certificate: vine.string().optional(),
  phone: vine.string().minLength(13).maxLength(13),
  email: vine.string().email(),
});

export const dieticianLoginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(6).maxLength(100),
});

export const tokenValidate = vine.object({
  id: vine.string(),
  name: vine.string(),
  phone: vine.string(),
  email: vine.string(),
  role: vine.string(),
});

export const validatorCompile = async (compile, validate) => {
  try {
    const validator = vine.compile(compile);
    const payload = await validator.validate(validate);
    return payload;
  } catch (error) {
    return {
      error: error.messages.map((e) => {
        return e.message;
      }),
    };
  }
};
