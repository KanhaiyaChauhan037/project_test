const Customer = require("../models/customer");
const applyFilters = require("../utils/applyfilters");

const filtersController = async (req, res) => {
  try {
    const { page, limit, filters, selectedIds, loadOptions = false } = req.body;
    
    let queryObject = {};
    let filteredData;

    if (selectedIds && selectedIds.length > 0) {
      queryObject = { _id: { $in: selectedIds } };
      filteredData = await Customer.find(queryObject);
    }

    if (filters) {
      await applyFilters(queryObject, filters);
    }
    if (filters && loadOptions) {
      await applyFilters(queryObject, filters, loadOptions);
    }

    const cPage = parseInt(page) || 1;
    const cLimit = parseInt(limit) || 20;
    const skip = (page - 1) * cLimit;
    if (!filteredData) {
      filteredData = await Customer.find(queryObject).skip(skip).limit(cLimit);
    } else {
      filteredData = await Customer.find(queryObject)
        .or(queryObject)
        .skip(skip)
        .limit(cLimit);
    }

    const totalCustomers = await Customer.countDocuments(queryObject);
    const distinctCompanies = await Customer.distinct("company");
    const distinctIndustries = await Customer.distinct("industry");
    const totalCompanies = distinctCompanies.length;
    const totalIndustries = distinctIndustries.length;

    const totalPages = Math.ceil(totalCustomers / limit);

    res.status(200).json({
      totalPages,
      cPage,
      totalCustomers,
      totalCompanies,
      totalIndustries,
      filteredData,
    });
  } catch (error) {
    res.status(404).send({ error });
  }
};

module.exports = filtersController;
