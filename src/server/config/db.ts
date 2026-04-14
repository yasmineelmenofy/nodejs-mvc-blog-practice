import mongoose from "mongoose";

mongoose.set("strictQuery", true);
mongoose.set("debug", true);

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI as string;

  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 2000,
    });

    console.log(` MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected — retrying...");
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};
