require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Failed to connect to MongoDB", err);
  });

app.use("/api/auth", require("./routes/auth"));
app.use("/api/operations", require("./routes/operations"));
app.use("/api/records", require("./routes/records"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
