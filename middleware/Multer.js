import multer from "multer";

const multerMiddleware = async (req, res, next) => {
  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  upload.single('image');
  next();
};

export default multerMiddleware;
