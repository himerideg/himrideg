/*
|--------------------------------------------------------------------------
| HimRideG Hybrid Shared Upload Storage — Phase 4
|--------------------------------------------------------------------------
|
| Existing Render persistent-disk files remain primary and untouched.
| UPLOAD_STORAGE_MODE=hybrid-gridfs hone par new profile/document uploads are
| mirrored into MongoDB GridFS. Missing local files can then be served from
| GridFS on any backend instance. Startup migration mirrors existing local
| files best-effort, so horizontal scaling does not require deleting old data.
|
| No new package is required: Mongoose exposes MongoDB GridFSBucket.
|
*/

const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");

const {
  driverProfileDirectory,
  driverDocumentsDirectory
} = require("../config/uploads");

const BUCKET_NAME = "himrideg_uploads";

let mirroredCount = 0;
let servedFromSharedCount = 0;
let migrationCount = 0;
let errorCount = 0;
let lastError = "";

function configuredStorageMode() {
  return String(
    process.env.UPLOAD_STORAGE_MODE ||
      ""
  )
    .trim()
    .toLowerCase();
}

function sharedStorageExplicitlyDisabled() {
  return String(
    process.env.UPLOAD_STORAGE_SHARED_DISABLED ||
      "false"
  )
    .trim()
    .toLowerCase() === "true";
}

function storageMode() {
  const configured =
    configuredStorageMode();

  /*
  |-----------------------------------------------------------------------
  | Phase 6 shared-storage auto-heal
  |-----------------------------------------------------------------------
  | Older Render environments may still contain UPLOAD_STORAGE_MODE as
  | persistent-disk (or may not contain it at all). The application already
  | has a safe local-disk-first + GridFS-mirror implementation, so production
  | now promotes that legacy value to hybrid-gridfs automatically.
  |
  | Nothing is deleted from the persistent disk. Local files continue to win
  | on reads; GridFS is the shared mirror/fallback for additional instances.
  | An explicit emergency opt-out remains available through
  | UPLOAD_STORAGE_SHARED_DISABLED=true.
  */
  if (
    sharedStorageExplicitlyDisabled()
  ) {
    return "persistent-disk";
  }

  if (
    configured === "gridfs" ||
    configured === "hybrid-gridfs"
  ) {
    return configured;
  }

  if (
    !configured ||
    configured === "persistent-disk"
  ) {
    return "hybrid-gridfs";
  }

  return configured;
}

function sharedStorageEnabled() {
  return [
    "hybrid-gridfs",
    "gridfs"
  ].includes(storageMode());
}

function gridFsReady() {
  return Boolean(
    sharedStorageEnabled() &&
      mongoose.connection.readyState === 1 &&
      mongoose.connection.db
  );
}

function bucket() {
  if (!gridFsReady()) {
    return null;
  }

  return new mongoose.mongo.GridFSBucket(
    mongoose.connection.db,
    {
      bucketName: BUCKET_NAME
    }
  );
}

function safeFilename(value) {
  return path.basename(
    String(value || "")
  );
}

async function findSharedFile(
  filename,
  kind = ""
) {
  const name = safeFilename(filename);
  const storage = bucket();

  if (!name || !storage) {
    return null;
  }

  const query = {
    filename: name
  };

  if (kind) {
    query["metadata.kind"] =
      String(kind);
  }

  return storage
    .find(query)
    .sort({ uploadDate: -1 })
    .limit(1)
    .next();
}

async function mirrorUploadToSharedStorage(
  file,
  metadata = {}
) {
  if (
    !gridFsReady() ||
    !file?.path ||
    !file?.filename ||
    !fs.existsSync(file.path)
  ) {
    return false;
  }

  try {
    const existing =
      await findSharedFile(
        file.filename,
        metadata.kind || ""
      );

    if (existing) {
      return true;
    }

    const storage = bucket();

    await new Promise(
      (resolve, reject) => {
        const uploadStream =
          storage.openUploadStream(
            safeFilename(
              file.filename
            ),
            {
              contentType:
                file.mimetype ||
                "application/octet-stream",
              metadata: {
                originalName:
                  String(
                    file.originalname || ""
                  ).slice(0, 255),
                kind:
                  String(
                    metadata.kind || "upload"
                  ).slice(0, 50),
                ownerId:
                  String(
                    metadata.ownerId || ""
                  ).slice(0, 100)
              }
            }
          );

        const source =
          fs.createReadStream(
            file.path
          );

        source.on("error", reject);
        uploadStream.on("error", reject);
        uploadStream.on("finish", resolve);
        source.pipe(uploadStream);
      }
    );

    mirroredCount += 1;
    lastError = "";
    return true;
  } catch (error) {
    errorCount += 1;
    lastError = String(
      error?.message ||
        error ||
        "Shared upload mirror error"
    );

    console.error(
      "[SharedUploads] mirror fallback:",
      lastError
    );

    return false;
  }
}

async function serveSharedUploadByFilename(
  filename,
  res,
  {
    privateFile = false,
    cacheSeconds = 300,
    kind = ""
  } = {}
) {
  if (!gridFsReady()) {
    return false;
  }

  try {
    const file =
      await findSharedFile(
        filename,
        kind
      );

    if (!file) {
      return false;
    }

    const storage = bucket();

    res.setHeader(
      "Content-Type",
      file.contentType ||
        "application/octet-stream"
    );

    res.setHeader(
      "Cache-Control",
      privateFile
        ? `private, max-age=${Math.max(0, cacheSeconds)}`
        : `public, max-age=${Math.max(0, cacheSeconds)}`
    );

    servedFromSharedCount += 1;

    await new Promise(
      (resolve, reject) => {
        const stream =
          storage.openDownloadStream(
            file._id
          );

        stream.on("error", reject);
        stream.on("end", resolve);
        stream.pipe(res);
      }
    );

    lastError = "";
    return true;
  } catch (error) {
    errorCount += 1;
    lastError = String(
      error?.message || error
    );

    console.error(
      "[SharedUploads] serve error:",
      lastError
    );

    if (!res.headersSent) {
      return false;
    }

    try {
      res.end();
    } catch (_) {
      // Response already closing.
    }

    return true;
  }
}

async function removeSharedUploadByFilename(
  filename,
  kind = ""
) {
  if (!gridFsReady()) {
    return false;
  }

  try {
    const file =
      await findSharedFile(
        filename,
        kind
      );

    if (!file) {
      return false;
    }

    await bucket().delete(
      file._id
    );

    return true;
  } catch (error) {
    errorCount += 1;
    lastError = String(
      error?.message || error
    );

    console.error(
      "[SharedUploads] cleanup warning:",
      lastError
    );

    return false;
  }
}

async function mirrorDirectory(
  directory,
  kind
) {
  if (
    !gridFsReady() ||
    !fs.existsSync(directory)
  ) {
    return 0;
  }

  const names =
    await fs.promises.readdir(
      directory
    );

  let count = 0;

  for (const name of names) {
    const filePath =
      path.join(
        directory,
        safeFilename(name)
      );

    let stat;

    try {
      stat =
        await fs.promises.stat(
          filePath
        );
    } catch (_) {
      continue;
    }

    if (!stat.isFile()) {
      continue;
    }

    const mirrored =
      await mirrorUploadToSharedStorage(
        {
          path: filePath,
          filename: safeFilename(name),
          originalname: safeFilename(name),
          mimetype:
            name.toLowerCase().endsWith(".pdf")
              ? "application/pdf"
              : name.toLowerCase().endsWith(".png")
                ? "image/png"
                : name.toLowerCase().endsWith(".webp")
                  ? "image/webp"
                  : "image/jpeg"
        },
        { kind }
      );

    if (mirrored) {
      count += 1;
    }
  }

  return count;
}

async function migrateLocalUploadsToSharedStorage() {
  if (!gridFsReady()) {
    return {
      enabled: sharedStorageEnabled(),
      ready: false,
      mirrored: 0
    };
  }

  const profileCount =
    await mirrorDirectory(
      driverProfileDirectory,
      "driver-profile"
    );

  const documentCount =
    await mirrorDirectory(
      driverDocumentsDirectory,
      "driver-document"
    );

  migrationCount +=
    profileCount + documentCount;

  return {
    enabled: true,
    ready: true,
    mirrored:
      profileCount + documentCount,
    profileCount,
    documentCount
  };
}

function getSharedUploadStorageStatus() {
  const configuredMode =
    configuredStorageMode();

  const effectiveMode =
    storageMode();

  return {
    mode: effectiveMode,
    configuredMode:
      configuredMode || null,
    autoPromotedToShared:
      !sharedStorageExplicitlyDisabled() &&
      (
        !configuredMode ||
        configuredMode === "persistent-disk"
      ) &&
      effectiveMode === "hybrid-gridfs",
    emergencySharedStorageDisabled:
      sharedStorageExplicitlyDisabled(),
    sharedEnabled:
      sharedStorageEnabled(),
    sharedReady:
      gridFsReady(),
    bucketName:
      sharedStorageEnabled()
        ? BUCKET_NAME
        : null,
    mirroredCount,
    servedFromSharedCount,
    migrationCount,
    errorCount,
    lastError:
      lastError || null
  };
}

module.exports = {
  mirrorUploadToSharedStorage,
  serveSharedUploadByFilename,
  removeSharedUploadByFilename,
  migrateLocalUploadsToSharedStorage,
  getSharedUploadStorageStatus,
  sharedStorageEnabled
};
