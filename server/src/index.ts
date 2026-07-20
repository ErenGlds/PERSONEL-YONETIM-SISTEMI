import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import employeeRoutes from "./routes/employeeRoutes";
import leaveRoutes from "./routes/leaveRoutes";
import holidayRoutes from "./routes/holidayRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import notificationRoutes from "./routes/notificationRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API çalışıyor" });
});

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use(errorHandler);

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `Server http://localhost:${PORT} adresinde çalışıyor/Server is running at http://localhost:${PORT}`,
    );
  });
};

startServer();
