const roles = new Set(["customer", "driver"]);
function validRelease(role, value) {
  if (!roles.has(role) || !/^\d+\.\d+\.\d+$/.test(value?.version || "") || typeof value?.enabled !== "boolean") return false;
  try {
    const u = new URL(value.downloadUrl);
    return u.protocol === "https:" && !u.username && !u.password && !u.port
      && ["himrideg.com", "www.himrideg.com"].includes(u.hostname)
      && u.pathname === `/downloads/HimRideG-${role === "driver" ? "Driver" : "Customer"}.apk`;
  } catch { return false; }
}
module.exports = { roles, validRelease };
