import vine from "@vinejs/vine";

export const registerSchema = vine.object({
  name: vine.string().minLength(2).maxLength(150),
  email: vine.string().email(),
  phone: vine.string().minLength(13).maxLength(13),
  password: vine.string().minLength(6).maxLength(100),
  height: vine.string().nullable().optional(e=>e??null),
  height_unit: vine.string().nullable().optional(e=>e??null),
  weight: vine.string().nullable().optional(e=>e??null),
  weight_unit: vine.string().nullable().optional(e=>e??null),
  date_of_birth: vine.string().nullable().optional(e=>e??null),
  gender: vine.string().nullable().optional(e=>e??null),
  goal: vine.string().nullable().optional(e=>e??null),
  profile: vine.string().nullable().optional(e=>e??null),
});

export const stepSchema = vine.object({
  userId: vine.string(),
  stepsTaken: vine.number(),
  recordedAt: vine.string(),
  timeInMins: vine.number(),
  distance: vine.number(),
  caloriesBurned: vine.number(),
  stepsTaken: vine.number(),
});

export const dateMonthScheme = vine.object({
  month: vine.number().min(1).max(12),
  year: vine.number().min(1900).max(2100),
});

export const updateSchema = vine.object({
  height: vine.number().optional(),
  height_unit: vine.string().optional(),
  weight: vine.number().optional(),
  weight_unit: vine.string().optional(),
  date_of_birth: vine.string().optional(),
  gender: vine.string().optional(),
  goal: vine.string().optional(),
  profile: vine.string().optional(),
});
export const loginSchema = vine.object({
  email: vine.string().email(),
  password: vine.string().minLength(6).maxLength(100),
});

export const generateOtpSchema = vine.object({
  email: vine.string().email(),
  phone: vine.string().minLength(13).maxLength(13),
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
  profile: vine.string().optional(),
  phone: vine.string().minLength(13).maxLength(13),
  work_exp: vine.string(),
  email: vine.string().email(),
});
export const dieticianUpdateSchema = vine.object({
  qualification: vine.string().optional(),
  address: vine.string().optional(),
  aadhar: vine.string().optional(),
  pan: vine.string().optional(),
  profile: vine.string().optional(),
  other_doc: vine.string().optional(),
  certificate: vine.string().optional(),
  work_exp: vine.string().optional(),
});
export const adminRegisterSchema = vine.object({
  username: vine.string(),
  password: vine.string().minLength(6).maxLength(100),
  name: vine.string().minLength(2).maxLength(150),
  logo: vine.string().optional(),
  address: vine.string(),
  company: vine.string().optional(),
  company_details: vine.string(),
  profile: vine.string().optional(),
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
