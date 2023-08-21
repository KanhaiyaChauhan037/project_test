const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");
const { encryptData } = require("../utils/ecrypt-decrypt");

// login user
router.post("/", async (req, res) => {
    try {
      const { email, password } = req.body;  
      const employee = await Employee.findOne({ email });
  
      if (!employee) {
        return res.status(401).json({ message: "Invalid Email" });
      }
  
      if (employee.status === "suspended") {
        return res.status(401).json({ message: "Account suspended" });
      }
      if (password !== employee.password) {
        return res.status(401).json({ message: "Invalid Password" });
      }
  
      // Encrypt the response data before sending
      const encryptedData = encryptData({
        id: employee._id,
        email: employee.email,
        role: employee.role,
        name: employee.name,
      });
      res.status(200).json({ encryptedData });
      
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  module.exports = router;