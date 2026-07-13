import mongoose from "mongoose";
export const connectDB = async (): Promise<void> => {
  try {
    const mongori = process.env.MONGO_URI;
    if (!mongori) {
      throw new Error(
        "MONGO_URI değişkeni tanımlı değil/ MONGO_URI is not defined in the environment variables",
      );
    }
    await mongoose.connect(mongori);
    console.log("MongoDB başarıyla bağlandı/MongoDB connected successfully");
  } catch (error) {
    console.error(
      "MongoDB bağlantısı başarısız oldu/MongoDB connection failed",
      error,
    );
    process.exit(1);
  }
};
