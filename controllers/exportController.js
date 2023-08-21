const Customer = require("../models/customer");
const ExportedData = require("../models/exportData");
const applyFilters = require("../utils/applyfilters");
const fields = require("../utils/export_data/exportFields");
const { Parser } = require("json2csv");
const ExcelJS = require("exceljs");

const csvExcelDownload = async (req, res) => {
  try {
    const { fileType = "csv", filters, employee, selectedIds } = req.body;

    let filteredData;
    const batchSize = 100000;
    let currentBatch = [];

    if (fileType === "xlsx") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Sk Web Global.${fileType}`
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({
        stream: res,
        useStyles: false,
        useSharedStrings: false,
      });

      const worksheet = workbook.addWorksheet("Sk Web Global");

      // Add headers
      fields.forEach((field, columnIndex) => {
        const headerCell = worksheet.getCell(1, columnIndex + 1);
        headerCell.value = field.label;
        // headerCell.font = { bold: true };
      });

      const processBatch = async (batch) => {
        batch.forEach((row) => {
          const rowData = fields.map((field) => row[field.value]);
          const dataRow = worksheet.addRow(rowData);
          dataRow.commit();
        });
        currentBatch = [];
      };

      if (selectedIds && selectedIds.length > 0) {
        filteredData = await Customer.find({
          _id: { $in: selectedIds },
        }).lean();
        await processBatch(filteredData);
      } else {
        const queryObject = {};
        await applyFilters(queryObject, filters);

        const cursor = Customer.find(queryObject).lean().cursor();

        let doc;
        while ((doc = await cursor.next())) {
          currentBatch.push(doc);

          if (currentBatch.length === batchSize) {
            await processBatch(currentBatch);
          }
        }
      }
      // Process any remaining data in the last batch
      if (currentBatch.length > 0) {
        await processBatch(currentBatch);
      }

      // Commit the workbook and finalize the stream
      await worksheet.commit();
      await workbook.commit();
    } else if (fileType === "csv") {
      res.header("Content-Type", "text/csv");
      res.attachment(`Sk Web Global.${fileType}`);
      const processBatch = async (batch) => {
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(batch);
        currentBatch = [];
        res.write(csv, "utf-8");
      };

      let cursor;
      if (selectedIds && selectedIds.length > 0) {
        filteredData = await Customer.find({
          _id: { $in: selectedIds },
        }).lean();
        await processBatch(filteredData);
        res.end();
      } else {
        const queryObject = {};
        await applyFilters(queryObject, filters);

        cursor = Customer.find(queryObject).lean().cursor();

        let doc;
        while ((doc = await cursor.next())) {
          currentBatch.push(doc);

          if (currentBatch.length === batchSize) {
            await processBatch(currentBatch);
          }
        }
      }
      // Process any remaining data in the last batch
      if (currentBatch.length > 0) {
        await processBatch(currentBatch);
      }
      res.end();
    }

    // Save the export history
    const exportedData = new ExportedData({
      exportedBy: employee.id,
      filters: JSON.stringify(filters),
      selectedIds: selectedIds || [],
      createdAt: new Date(),
    });
    await exportedData.save();
  } catch (err) {
    // console.error(err);
    res.status(500).json({ error: "Failed to retrieve customer data" });
  }
};

module.exports = csvExcelDownload;
