import { app } from "./app";
import  connectDB  from "./db/connect";
import dotenv from "dotenv";

dotenv.config();

const port = parseInt(process.env.PORT || "3000", 10);

const start = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI missing in .env");
    }
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`Server running on port ${port}`));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

start();