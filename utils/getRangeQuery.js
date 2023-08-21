const getRangeQuery = (queryObject, field, minValue, maxValue) => {
  const parseValue = (value) => {
    if (Array.isArray(value) && value.length > 0) {
      return parseInt(value[0]);
    }
    return parseInt(value);
  };

  const parsedMinValue = parseValue(minValue);
  const parsedMaxValue = parseValue(maxValue);

  if (parsedMinValue && parsedMaxValue) {
    queryObject[field] = {
      $gte: parsedMinValue,
      $lte: parsedMaxValue,
    };
  } else if (parsedMinValue) {
    queryObject[field] = { $gte: parsedMinValue };
  } else if (parsedMaxValue) {
    queryObject[field] = { $lte: parsedMaxValue };
  }
};

module.exports = getRangeQuery;
