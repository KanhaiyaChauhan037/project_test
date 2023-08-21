const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const includeExcludeFilter = (
  queryObject,
  field,
  includeValues,
  excludeValues,
  loadOptions = false
) => {
  if (loadOptions || field === "keywords" || field === "technologies") {
    
    if (Array.isArray(includeValues) && includeValues.length > 0) {
      const regexPattern = includeValues.map(
        (name) => new RegExp(name.trim(), "i")
      );
      queryObject[field] = { $in: regexPattern };
    } else if (typeof includeValues === "string") {
      queryObject[field] = new RegExp(includeValues, "i");
    }

    if (Array.isArray(excludeValues) && excludeValues.length > 0) {
      const regexPattern = excludeValues.map(
        (name) => new RegExp(name.trim(), "i")
      );
      if (queryObject[field] && queryObject[field].$in) {
        queryObject[field].$nin = regexPattern;
      } else {
        queryObject[field] = { $nin: regexPattern };
      }
    } else if (typeof excludeValues === "string") {
      const regexPattern = new RegExp(excludeValues, "i");
      if (queryObject[field] && queryObject[field].$in) {
        queryObject[field].$nin = regexPattern;
      } else {
        queryObject[field] = { $nin: [regexPattern] };
      }
    }
  } else {
    if (Array.isArray(includeValues) && includeValues.length > 0) {
      const regexPattern = includeValues.map(
        (name) => new RegExp(`^${escapeRegExp(name.trim())}$`, "i")
      );
      queryObject[field] = { $in: regexPattern };
    } else if (typeof includeValues === "string") {
      queryObject[field] = new RegExp(`^${escapeRegExp(includeValues)}$`, "i");
    } else if (includeValues === null) {
      queryObject[field] = null;
    }

    if (Array.isArray(excludeValues) && excludeValues.length > 0) {
      const regexPattern = excludeValues.map(
        (name) => new RegExp(`^${escapeRegExp(name.trim())}$`, "i")
      );
      if (queryObject[field] && queryObject[field].$in) {
        queryObject[field].$nin = regexPattern;
      } else {
        queryObject[field] = { $nin: regexPattern };
      }
    } else if (typeof excludeValues === "string") {
      const regexPattern = new RegExp(`^${escapeRegExp(excludeValues)}$`, "i");
      if (queryObject[field] && queryObject[field].$in) {
        queryObject[field].$nin = regexPattern;
      } else {
        queryObject[field] = { $nin: [regexPattern] };
      }
    }
  }
};

module.exports = includeExcludeFilter;
