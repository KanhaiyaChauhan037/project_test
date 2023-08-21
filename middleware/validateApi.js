const { decryptData } = require("../utils/ecrypt-decrypt");

function validateRole(allowedRoles) {
  return function (req, res, next) {
    // Check if the role in the decrypted data matches the required role
    const encryptedData = req.headers["encrypted-data"];

    if (!encryptedData) {
      return res.status(400).json({ error: "Required header missing" });
    }

    const decryptedData = decryptData(encryptedData);
    if (!allowedRoles.includes(decryptedData.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    // Role is valid, allow access to the API endpoint
    next();
  };
}

module.exports = validateRole;


