import vine from "@vinejs/vine";

export const isJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};
export const pollValidate = vine.object({
  title: vine.string().trim(),
  topic: vine.string().trim(),
  choice: vine.array(
    vine.object({
      name: vine.string(),
    })
  ),
  banner: vine.string().optional(),
});

export const pollCommentValidate = vine.object({
  pollsId: vine.string().regex(/^[0-9a-fA-F]{24}$/),
  comment: vine.string().minLength(2),
});
export const validatorCompile = async (compile, validate) => {
  try {
    const validator = vine.compile(compile);
    const payload = await validator.validate(validate);
    return payload;
  } catch (error) {
    console.log(error);
    return {
      error: error.messages.map((e) => {
        return e.message;
      }),
    };
  }
};
