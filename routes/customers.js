const express = require("express");
const fs = require("fs");
const router = express.Router();
const multer = require("multer");
const Customer = require("../models/customer");
const csvExcelDownload = require("../controllers/exportController");
const filtersController = require("../controllers/filtersController");
const exportHistoryController = require("../controllers/exportHistoryController");
const validateRole = require("../middleware/validateApi");
const { Transform, pipeline } = require("stream");
const Excel = require("exceljs");
const { Writable } = require("stream");
const Papa = require("papaparse");
const { Readable } = require("stream");

const uploadFolder = "./uploads";
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  // Check the file type
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    cb(null, true); // Accept the file
  } else {
    cb(
      new Error("Invalid file type. Only CSV and Excel files are allowed."),
      false
    ); // Reject the file
  }
};

const upload = multer({ storage, fileFilter });

router.post(
  "/upload",
  validateRole(["admin"]),
  upload.single("file"),
  async (req, res) => {
    const file = req.file;

    if (!file) {
      res.status(400).send("No file uploaded");
      return;
    }

    if (file.mimetype === "text/csv") {
      // Read and parse CSV file
      const stream = fs.createReadStream(file.path);

      const openCsvInputStream = (fileInputStream) => {
        const csvInputStream = new Readable({ objectMode: true });
        csvInputStream._read = () => {};

        Papa.parse(fileInputStream, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          step: (results) => {
            csvInputStream.push(results.data);
          },
          complete: () => {
            csvInputStream.push(null);
          },
          error: (err) => {
            csvInputStream.emit("error", err);
          },
        });

        return csvInputStream;
      };
      const headers_changes = new Transform({
        writableObjectMode: true,
      });
      // Transform the headers to lowercase and remove spaces

      headers_changes._transform = function (obj, e, cb) {
        const transformedObj = {};
        for (let key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const transformedKey = key.toLowerCase().replace(/\s/g, "");
            transformedObj[transformedKey] = obj[key];
          }
        }
        const data = JSON.stringify(transformedObj) + "\n";

        this.push(data); // Push to the next stream

        cb();
      };

      const batchSize = 85000;
      let batch = [];

      const addToBatch = async (record) => {
        try {
          batch.push(record);

          if (batch.length === batchSize) {
            await Customer.insertMany(batch);
            batch = [];
          }
        } catch (error) {
          // console.log(error);
        }
      };
      const writableStream = new Writable({
        objectMode: true,
        write: async (record, encoding, next) => {
          try {
            await addToBatch(JSON.parse(record));
            next();
          } catch (error) {
            // console.log(error);
          }
        },
        final: async (callback) => {
          try {
            if (batch.length > 0) {
              await Customer.insertMany(batch);
              batch = [];
            }
            callback();
          } catch (error) {
            // console.log(error);
            callback(error);
          }
        },
      });

      pipeline(
        openCsvInputStream(stream),
        headers_changes,
        writableStream,
        (err) => {
          if (err) {
            // console.log("Pipeline failed with an error:", err);
          } else {
            console.log("Pipeline ended successfully");
            fs.rmSync(file.path);
            return res.json("Added Customer successfully");
          }
        }
      );
    } else if (
      file.mimetype === "application/vnd.ms-excel" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      // Read and parse Excel file

      const options = {
        worksheets: "emit",
      };

      const rows = [];
      const batchSize = 85000;

      const workbookReader = new Excel.stream.xlsx.WorkbookReader(
        file.path,
        options
      );

      workbookReader.read();

      workbookReader.on("worksheet", (worksheet) => {
        let isFirstRow = true;
        const headers = [];
        worksheet.on("row", (row) => {
          if (isFirstRow) {
            const transformedRow = row.values.map((value) => {
              if (typeof value === "string") {
                return value.toLowerCase().replace(/\s/g, "");
              } else {
                return value;
              }
            });
            headers.push(...transformedRow);
            isFirstRow = false;
          } else {
            const document = {};
            row.values.forEach((value, index) => {
              const header = headers[index];
              document[header] = value;
            });
            rows.push(document);

            if (rows.length === batchSize) {
              insertBatch();
            }
          }
        });
      });

      workbookReader.on("end", async () => {
        if (rows.length > 0) {
          try {
            await insertBatch();
          } catch (err) {
            console.error("Error inserting batch:", err);
          }
        }

        try {
          fs.rmSync(file.path);
          console.log("Pipeline ended successfully");
          return res.json("Added Customer successfully");
        } catch (err) {
          console.error("An error occurred:", err);
        }
      });

      const insertBatch = async () => {
        const chunk = rows.splice(0, batchSize);
        try {
          await Customer.insertMany(chunk);
        } catch (err) {
          console.error("An error occurred:", err);
        }
      };

      // workbookReader.on("error", (err) => {
      //   // console.error("An error occurred:", err);
      // });
    } else {
      res.status(400).send("Unsupported file type");
      return;
    }
  }
);

// get customers with pagination
router.get("/getAll", validateRole(["admin", "employee"]), async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const customers = await Customer.find();
    const distinctCompanies = await Customer.distinct("company");
    const distinctIndustries = await Customer.distinct("industry");
    const totalCompanies = distinctCompanies.length;
    const totalIndustries = distinctIndustries.length;

    res.json({
      totalCustomers,
      totalCompanies,
      totalIndustries,
      data: customers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Filter customers with pagination
router.post("/filter", validateRole(["admin", "employee"]), filtersController);

// export customerdata to csv/excel file
router.post("/export", validateRole(["admin", "employee"]), csvExcelDownload);

// get export data history
router.get(
  "/export",
  validateRole(["admin", "employee"]),
  exportHistoryController
);

module.exports = router;
