const path = require("node:path");

/*
|--------------------------------------------------------------------------
| Upload Storage Root
|--------------------------------------------------------------------------
|
| Local development:
|   <server>/uploads
|
| Production (Render persistent disk recommended):
|   UPLOAD_ROOT=/var/data/himrideg-uploads
|
*/

const uploadRoot = process.env.UPLOAD_ROOT
  ? path.resolve(process.env.UPLOAD_ROOT)
  : path.resolve(process.cwd(), "uploads");

const driverUploadRoot = path.join(
  uploadRoot,
  "drivers"
);

const driverProfileDirectory = path.join(
  driverUploadRoot,
  "profile"
);

const driverDocumentsDirectory = path.join(
  driverUploadRoot,
  "documents"
);

module.exports = {
  uploadRoot,
  driverUploadRoot,
  driverProfileDirectory,
  driverDocumentsDirectory
};
