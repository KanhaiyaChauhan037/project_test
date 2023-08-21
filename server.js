const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to database!");
});

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

const employeesRouter = require("./routes/employees");
const customersRouter = require("./routes/customers");
const loginRouter = require("./routes/login");

app.use("/api/employees", employeesRouter);
app.use("/api/customers", customersRouter);
app.use("/api/login", loginRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server Started listening to port " + PORT);
});
