const Customer = require("../models/customer");

const employeesByDept = async (employeesCountByDept) => {
  if (employeesCountByDept && employeesCountByDept.length > 0) {
    const aggregationPipeline = [];

    employeesCountByDept.forEach((deptFilter) => {
      const { departmentName, titles, minCount, maxCount } = deptFilter;

      if (
        departmentName &&
        titles &&
        (minCount !== undefined || maxCount !== undefined) &&
        (minCount < maxCount || minCount || maxCount)
      ) {
        const departmentRegex = new RegExp(departmentName, "i");
        const titlesRegex = titles.map((title) => new RegExp(title, "i"));

        aggregationPipeline.push(
          {
            $match: {
              departments: { $regex: departmentRegex },
              title: { $in: titlesRegex },
            },
          },
          {
            $group: {
              _id: { company: "$company" },
              count: { $sum: 1 },
            },
          },
          {
            $match: {
              count: {
                $gte: minCount !== undefined ? minCount : 1,
                $lte:
                  maxCount !== undefined ? maxCount : Number.MAX_SAFE_INTEGER,
              },
            },
          },
          {
            $group: {
              _id: "$_id.company",
              titles: { $push: "$_id.title" },
              count: { $sum: "$count" },
            },
          },
          {
            $project: {
              _id: 0,
              company: "$_id",
              titles: 1,
              count: 1,
            },
          }
        );
      }
    });

    const companies = await Customer.aggregate(aggregationPipeline);
    const companyFilter = companies?.map((company) => company.company);
    return companyFilter;
  }
};

module.exports = employeesByDept;
