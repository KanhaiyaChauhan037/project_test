const ExportedData = require("../models/exportData");

const exportHistoryController = async (req, res) => {
  try {
    const userId = req.query.employeeId;
    const exportHistory = await ExportedData.find({ exportedBy: userId }).sort({
      createdDate: -1,
    });

    // Map the export history to include parsed filters
    const historyWithFilters = exportHistory.map((item) => {
      return {
        filters: JSON.parse(item.filters),
        exportedBy: item.exportedBy,
        createdDate: item.createdDate,
        selectedIds: item.selectedIds,
      };
    });

    res.json(historyWithFilters);
  } catch (error) {
    // console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
};

module.exports = exportHistoryController;
