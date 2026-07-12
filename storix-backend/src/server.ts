import app from "./app";
import connectDB from "./config/db";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`server is runniing in port ${PORT}`);
  });
};

startServer();