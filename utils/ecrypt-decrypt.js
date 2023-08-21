const CryptoJS = require("crypto-js");

const encryptionKey = process.env.ENCRYPT_DECRYPT_KEY;

// Encrypt function
function encryptData(data) {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    encryptionKey
  ).toString();
  return ciphertext;
}

// Decrypt function
function decryptData(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
  const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
}

module.exports = { encryptData, decryptData };
