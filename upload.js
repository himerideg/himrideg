const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const multer = require("multer");

const {
  driverUploadRoot: uploadRootDirectory
} = require("../config/uploads");

fs.mkdirSync(uploadRootDirectory, {
  recursive: true
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const directoryName =
      file.fieldname === "profilePhoto"
        ? "profile"
        : "documents";

    const destination = path.join(
      uploadRootDirectory,
      directoryName
    );

    fs.mkdirSync(destination, {
      recursive: true
    });

    callback(null, destination);
  },

  filename(req, file, callback) {
    const extension =
      path.extname(file.originalname)
        .toLowerCase()
        .replace(/[^.a-z0-9]/g, "") ||
      ".bin";

    const safeName = [
      req.user?._id || "driver",
      Date.now(),
      crypto.randomBytes(8).toString("hex")
    ].join("-");

    callback(
      null,
      `${safeName}${extension}`
    );
  }
});

function fileFilter(
  req,
  file,
  callback
) {
  if (
    !allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    const error = new Error(
      "Sirf JPG, PNG, WEBP ya PDF file upload karo"
    );

    error.statusCode = 400;
    return callback(error);
  }

  return callback(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

module.exports = upload;
