const crypto = require("crypto");

const encryptionKey = crypto
  .createHash("sha512")
  .update(process.env.ENCRYPTION_KEY)
  .digest("hex")
  .substring(0, 32);

const encryptionIv = crypto
  .createHash("sha512")
  .update(process.env.ENCRYPTION_IV)
  .digest("hex")
  .substring(0, 16);

const decrypt = (encryptedData) => {
  try {
    const buff = Buffer.from(encryptedData, "base64");

    const decipher = crypto.createDecipheriv(
      process.env.ENCRYPTION_METHOD,
      Buffer.from(encryptionKey),
      Buffer.from(encryptionIv)
    );

    let decryptedData = decipher.update(buff, "binary", "utf8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
  } catch (error) {
    throw new Error("Decryption failed");
  }
};

const decryptionMiddleware = (req, res, next) => {
  if (req.method === "GET" || req.is("multipart/form-data")) {
    console.log("Skipping decryption for GET request or multipart/form-data");
    return next();
  }
  if (
    req.body !== "GET" &&
    !req.is("multipart/form-data") &&
    req.body &&
    req.body.data
  ) {
    try {
      const encryptedData = req.body.data;
      const decryptedData = decrypt(encryptedData);

      req.body = JSON.parse(decryptedData);
      console.log("Decrypted data: ", req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        message: error.message,
        data: null,
        success: false,
      });
    }
  } else {
    next();
  }
};

module.exports = decryptionMiddleware;
