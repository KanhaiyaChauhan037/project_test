const mongoose = require("mongoose");

const exportedDataSchema = new mongoose.Schema({
  exportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true,
  },
  filters: {},
  selectedIds: {},
  createdDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const ExportedData = mongoose.model("ExportedData", exportedDataSchema);

module.exports = ExportedData;
