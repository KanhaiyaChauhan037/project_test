const addLocationQuery = require("./addLocationQuery");
const employeesByDept = require("./employeesByDept");
const getRangeQuery = require("./getRangeQuery");
const includeExcludeFilter = require("./includeExcludeFilter");
const includeExcludeNumber = require("./includeExcludeNum");

async function applyFilters(queryObject, filters, loadOptions) {
  const {
    name,
    title,
    excTitle,
    seniority,
    departments,
    company,
    excComp,
    industry,
    excInd,
    keywords,
    exckeywords,
    technologies,
    excTech,
    minEmployeeCount,
    maxEmployeeCount,
    minRevenue,
    maxRevenue,
    mintotalfunding,
    maxtotalfunding,
    minfoundedyear,
    maxfoundedyear,
    minRetailLoc,
    maxRetailLoc,
    siccodes,
    excSiccodes,
    contactlocation,
    companylocation,
    excludeContactLoc,
    excludeCompanyLoc,
    emailstatus,
    phonestatus,
    jobfunction,
    employeesCountByDept,
    latestfunding,
    minlastfunding,
    maxlastfunding,
    fundingstartdate,
    fundingenddate,
  } = filters;

  //name filter
  if (name) {
    if (name[0]?.includes(" ")) {
      const nameParts = name.flatMap((name) => name.split(" "));

      const firstname = nameParts[0].trim();
      const lastname = nameParts[1];

      queryObject.$and = queryObject.$and || [];
      queryObject.$and.push({
        $and: [
          { firstname: { $in: new RegExp(`\\b${firstname}\\b`, "i") } },
          { lastname: { $in: new RegExp(`\\b${lastname}\\b`, "i") } },
        ],
      });
    } else {
      const regexPattern = new RegExp(`\\b${name}\\b`, "i");

      queryObject.$and = queryObject.$and || [];
      queryObject.$and.push({
        $or: [{ firstname: regexPattern }, { lastname: regexPattern }],
      });
    }
  }

  // contact location filter
  addLocationQuery(
    queryObject,
    contactlocation,
    excludeContactLoc,
    "city",
    "state",
    "country"
  );

  // company location filter
  addLocationQuery(
    queryObject,
    companylocation,
    excludeCompanyLoc,
    "companycity",
    "companystate",
    "companycountry"
  );

  // Query for job functions (departments and titles)
  if (jobfunction && jobfunction.length > 0) {
    const departmentQueries = jobfunction.map((job) => {
      const departmentPattern = new RegExp(job.departmentName, "i");
      const titlePatterns = job.titles.map((title) => new RegExp(title, "i"));

      return {
        $and: [
          { departments: departmentPattern },
          { title: { $in: titlePatterns } },
        ],
      };
    });

    queryObject.$and = queryObject.$and || [];
    queryObject.$and.push({
      $or: departmentQueries,
    });
  }

  // Employees count By department

  const deptCounts = (await employeesByDept(employeesCountByDept)) || [];
  if (employeesCountByDept && deptCounts.length > 0) {
    includeExcludeFilter(queryObject, "company", deptCounts, []);
  } else if (employeesCountByDept) {
    includeExcludeFilter(queryObject, "company", null, []);
  }

  //Email status
  includeExcludeFilter(queryObject, "emailstatus", emailstatus);
  // Phone status
  includeExcludeFilter(queryObject, "phonestatus", phonestatus);

  // include-exclude string
  includeExcludeFilter(queryObject, "company", company, excComp, loadOptions);
  includeExcludeFilter(queryObject, "industry", industry, excInd, loadOptions);
  includeExcludeFilter(queryObject, "keywords", keywords, exckeywords);
  includeExcludeFilter(queryObject, "technologies", technologies, excTech);
  includeExcludeFilter(queryObject, "title", title, excTitle, loadOptions);
  includeExcludeFilter(queryObject, "seniority", seniority);
  includeExcludeFilter(queryObject, "departments", departments);
  includeExcludeFilter(queryObject, "latestfunding", latestfunding);

  //include-exclude number
  includeExcludeNumber(queryObject, "siccodes", siccodes, excSiccodes);

  // # Employee range
  getRangeQuery(
    queryObject,
    "employeesCount",
    minEmployeeCount,
    maxEmployeeCount
  );
  // annual revenue
  getRangeQuery(
    queryObject,
    "annualrevenue",
    minRevenue * 1000000,
    maxRevenue * 1000000
  );

  //total-funding
  getRangeQuery(
    queryObject,
    "totalfunding",
    mintotalfunding * 1000000,
    maxtotalfunding * 1000000
  );

  //last-funding
  getRangeQuery(
    queryObject,
    "latestFundingAmount",
    minlastfunding * 1000000,
    maxlastfunding * 1000000
  );

  if (fundingstartdate || fundingenddate) {
    const fundingStartDate = new Date(fundingstartdate);
    const fundingEndDate = new Date(fundingenddate);   
    queryObject.lastRaisedAt = {
      $gte: fundingStartDate.toISOString(),
      $lte: fundingEndDate.toISOString(),
    };
  }

  //founded-year
  getRangeQuery(queryObject, "foundedyear", minfoundedyear, maxfoundedyear);

  //reatail-locations
  getRangeQuery(queryObject, "retaillocations", minRetailLoc, maxRetailLoc);

  // console.log(queryObject);
}

module.exports = applyFilters;
