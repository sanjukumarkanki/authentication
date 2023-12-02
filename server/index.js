const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const emailValidator = require("email-validator");

app.use(cors());
app.use(express.json());

const EmployeeModel = require("./models/Employee");

mongoose.connect("mongodb://localhost:27017/user");

// USER REGISTRATION API -----------------------------------------------------------------------
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (emailValidator.validate(email)) {
    const existingUser = await EmployeeModel.findOne({ email });
    if (existingUser === null) {
      const hashPassword = await bcrypt.hash(password, 10);
      const insetData = await EmployeeModel.create({
        name,
        email,
        password: hashPassword,
      });
      res.send(`Response Sucessfully Added`);
    } else {
      res.status(409);
      res.send({ error: "Email alreday exists" });
    }
  } else {
    res.status(403);
    res.send({ error: "Enter a valid email" });
  }
});

// User LOGIN API-----------------------------
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const getUserDetails = await EmployeeModel.findOne({ email });
  if (getUserDetails !== null) {
    const isValidated = await bcrypt.compare(password, getUserDetails.password);
    if (isValidated) {
      const payload = {
        email: email,
      };
      let token = jwt.sign(payload, "secret");
      res.status(200);
      res.send({ jwt: token });
    } else {
      res.status(406).send({ error: "Invalid Password" });
    }
  } else {
    res.status(405).send({ error: "No User Found. Enter Valid E-mail" });
  }
});

app.listen(3001, () =>
  console.log("Server is running ar http://localhost:3001")
);
