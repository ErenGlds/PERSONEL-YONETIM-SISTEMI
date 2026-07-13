import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import { protect, AuthRequest } from "./middleware/authMIDDLEware";
import departmentRoutes from "./routes/departmentRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.get("/api/profile", protect, (req: AuthRequest, res) => {
  res.json({
    message: "Bu bir korumalı rotadır/This is a protected route",
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.json({ message: "API çalışıyor/ API is running" });
});

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `Server http://localhost:${PORT} adresinde çalışıyor/ Server is running at http://localhost:${PORT}`,
    );
  });
};

startServer();
