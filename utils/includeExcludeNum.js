const includeExcludeNumber = (
  queryObject,
  field,
  includeValues,
  excludeValues
) => {
  const parseValues = (values) => {
    if (Array.isArray(values) && values.length > 0) {
      return values.map((value) => parseInt(value));
    }
    return parseInt(values);
  };

  const parsedIncludeValues = parseValues(includeValues);
  const parsedExcludeValues = parseValues(excludeValues);

  if (parsedIncludeValues) {
    queryObject[field] = { $in: parsedIncludeValues };
  }

  if (parsedExcludeValues) {
    if (queryObject[field] && queryObject[field].$in) {
      queryObject[field].$nin = parsedExcludeValues;
    } else {
      queryObject[field] = { $nin: parsedExcludeValues };
    }
  }
};

module.exports = includeExcludeNumber;
