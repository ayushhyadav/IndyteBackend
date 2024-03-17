const errorMiddleware = async (error, req, res, next) => {
  console.log(error.message);
  res.status(500).json({ message: "Internal server error" });
};

export default errorMiddleware;
