const express = require("express");
const router = express.Router();
const Employee = require("../models/employee");
const validateRole = require("../middleware/validateApi");

//Get all employees
const getAllEmployees = async (req, res) => {
  try {
    const { _id, name, page = 1, limit = 20 } = req.query;
    let query = {};

    if (_id) {
      query._id = _id;
    } else if (name) {
      const namePattern = new RegExp(name, "i");
      query.name = namePattern;
    }

    const cPage = parseInt(page) || 1;
    const cLimit = parseInt(limit) || 20;
    const skip = (cPage - 1) * cLimit;

    const totalCount = await Employee.countDocuments(query);
    const totalPages = Math.ceil(totalCount / cLimit);

    const employees = await Employee.find(query)
      .select("-password") // exclude password field
      .skip(skip)
      .limit(cLimit);
    const activeCount = await Employee.countDocuments({ status: "active" });
    const suspendedCount = await Employee.countDocuments({
      status: "suspended",
    });

    res.json({
      employees,
      cPage,
      totalPages,
      totalCount,
      activeCount,
      suspendedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//Add Employee
const addEmployee = async (req, res) => {
  const employee = new Employee({
    name: req.body.name,
    email: req.body.email,
    contact: req.body.contact,
    password: req.body.password,
    role: req.body.role,
    status: req.body.status,
  });
  try {
    const newEmployee = await employee.save();
    res
      .status(201)
      .json({ message: "Employee created successfully", newEmployee });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// update employee
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.name = req.body.name || employee.name;
    employee.email = req.body.email || employee.email;
    employee.contact = req.body.contact || employee.contact;
    employee.password = req.body.password || employee.password;
    employee.status = req.body.status || employee.status;
    employee.role = req.body.role || employee.role;
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

router.get("/", validateRole(["admin", "employee"]), getAllEmployees);
router.post("/", validateRole(["admin"]), addEmployee);
router.put("/:id", validateRole(["admin", "employee"]), updateEmployee);

module.exports = router;
