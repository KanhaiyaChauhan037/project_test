function addLocationQuery(
  queryObject,
  locationArray,
  excludeArray,
  cityField,
  stateField,
  countryField
) {
  if (
    locationArray &&
    Array.isArray(locationArray) &&
    locationArray.length > 0
  ) {
    const regexPatterns = locationArray.map(
      (location) => new RegExp(location, "i")
    );
    queryObject.$and = queryObject.$and || [];
    queryObject.$and.push({
      $or: [
        { [cityField]: { $in: regexPatterns } },
        { [stateField]: { $in: regexPatterns } },
        { [countryField]: { $in: regexPatterns } },
      ],
    });
  }

  if (excludeArray && Array.isArray(excludeArray) && excludeArray.length > 0) {
    const regexPatterns = excludeArray.map(
      (location) => new RegExp(location, "i")
    );
    queryObject.$and = queryObject.$and || [];
    queryObject.$and.push({
      $nor: [
        { [cityField]: { $in: regexPatterns } },
        { [stateField]: { $in: regexPatterns } },
        { [countryField]: { $in: regexPatterns } },
      ],
    });
  }
}

module.exports = addLocationQuery;
