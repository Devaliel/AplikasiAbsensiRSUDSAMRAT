const CryptoJS = require('crypto-js');

// Encryption
const plainText = "Hello, world!";
const SECRET_KEY = "u/Gu5posvwDsXUnV5Zaq4g==";
const aesKey = CryptoJS.enc.Base64.parse(SECRET_KEY);
const encryptedData = CryptoJS.AES.encrypt(plainText, aesKey).toString();

// Decryption
const decrypted = CryptoJS.AES.decrypt(
  encryptedData,
  aesKey,
  { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
);
const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

console.log("Encrypted data:", encryptedData);
console.log("Decrypted text:", decryptedText);
