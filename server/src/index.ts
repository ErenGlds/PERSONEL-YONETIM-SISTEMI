import express from "express";

const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.json({ message: "API çalışıyor" });
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
});
