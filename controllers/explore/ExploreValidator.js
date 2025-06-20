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

export const blogValidate = vine.object({
  title: vine.string().trim(),
  author: vine.string().trim(),
  content: vine.string().trim(),
});

export const getInspiredValidate = vine.object({
  title: vine.string().trim(),
  author: vine.string().trim(),
  content: vine.string().trim(),
  category: vine.string().trim(),
});

export const ourSuccessValidate = vine.object({
  title: vine.string().trim(),
  author: vine.string().trim(),
  content: vine.string().trim(),
  category: vine.string().trim(),
  clientName: vine.string().trim().optional(),
  clientDetails: vine.string().trim().optional(),
  tags: vine.array(vine.string().trim()),
});

export const publicMealValidate = vine.object({
  name: vine.string().trim(),
  nutrition: vine.object({
    cal: vine.number(),
    fats: vine.number().optional(),
    carbs: vine.number().optional(),
    protein: vine.number().optional(),
  }),
  description: vine.string().trim(),
  ingredients: vine.array(vine.string().trim()),
  steps: vine.array(vine.string().trim()),
});

export const clientStoriesValidate = vine.object({
  title: vine.string().trim(),
  author: vine.string().trim(),
  content: vine.string().trim(),
  category: vine.string().trim(),
  clientName: vine.string().trim(),
  clientDetails: vine.string().trim().optional(),
});

export const collectionValidate = vine.object({
  title: vine.string().trim(),
  author: vine.string().trim(),
  category: vine.string().trim(),
  content: vine.string().trim(),
});
export const articleValidate = vine.object({
  title: vine.string().trim(),
  author: vine.string().trim(),
  category: vine.string().trim(),
  content: vine.string().trim(),
  collectionId: vine.string().regex(/^[0-9a-fA-F]{24}$/),
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
