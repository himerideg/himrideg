const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const policy = require("../src/utils/appReleasePolicy");
const file = path.join(__dirname, "../src/controllers/appReleaseController.js");
const code = fs.readFileSync(file, "utf8");
const roleUrl = role => `https://www.himrideg.com/downloads/HimRideG-${role === "driver" ? "Driver" : "Customer"}.apk`;
const release = { _id: "release1", enabled: true, appRole: "customer", version: "4.0.62", downloadUrl: roleUrl("customer") };
assert.ok(policy.validRelease("customer", { ...release }));
assert.equal(policy.validRelease("customer", { ...release, downloadUrl: roleUrl("driver") }), false);
assert.equal(policy.validRelease("customer", { ...release, downloadUrl: "https://evil.example/app.apk" }), false);
function setup({ found = release, tokenCount = 0, providerFails = false } = {}) {
  const batches = [], updates = [];
  const Model = {
    findOneAndUpdate: () => ({ lean: async () => found }),
    updateOne: async (filter, update) => { updates.push({ filter, update }); }
  };
  const User = { find: () => ({ select: () => ({ lean: () => ({ cursor: async function* () {
    yield { fcmTokens: Array.from({ length: tokenCount }, (_, i) => `ExpoPushToken[${i}]`) };
  } }) }) }) };
  const context = { exports: {}, Date, Set, String, Error, AbortSignal,
    require: name => name.includes("AppRelease") ? Model : name.endsWith("models/User") ? User
      : name.endsWith("appReleasePolicy") ? policy : { cleanToken: x => x },
    fetch: async (url, options) => {
      const messages = JSON.parse(options.body); batches.push(messages);
      if (providerFails) throw Error("provider failed");
      return { ok: true, json: async () => ({ data: messages.map(() => ({ status: "ok" })) }) };
    }
  };
  vm.createContext(context); vm.runInContext(code, context);
  const res = { statusCode: 200, status(n) { this.statusCode = n; return this; }, json(body) { this.body = body; return this; } };
  return { controller: context.exports, res, batches, updates };
}
(async () => {
  let test = setup();
  await test.controller.notifyRelease({ user: { role: "customer" }, params: { appRole: "customer" }, body: { confirm: true } }, test.res);
  assert.equal(test.res.statusCode, 403); assert.equal(test.batches.length, 0);
  test = setup();
  await test.controller.notifyRelease({ user: { role: "admin" }, params: { appRole: "customer" }, body: {} }, test.res);
  assert.equal(test.res.statusCode, 400); assert.equal(test.batches.length, 0);
  test = setup({ found: null });
  await test.controller.notifyRelease({ user: { role: "admin" }, params: { appRole: "customer" }, body: { confirm: true } }, test.res);
  assert.equal(test.res.statusCode, 409); assert.equal(test.batches.length, 0);
  test = setup({ tokenCount: 205 });
  await test.controller.notifyRelease({ user: { role: "admin" }, params: { appRole: "customer" }, body: { confirm: true } }, test.res, error => { throw error; });
  assert.equal(test.batches.map(b => b.length).join(","), "100,100,5");
  assert.equal(test.res.body.data.acceptedByExpo, 205); assert.equal(test.res.body.data.deliveryConfirmed, false);
  assert.equal(test.batches[0][0].data.appRole, "customer");
  assert.equal(test.batches[0][0].data.downloadUrl, roleUrl("customer"));
  test = setup({ tokenCount: 1, providerFails: true }); let failure;
  await test.controller.notifyRelease({ user: { role: "admin" }, params: { appRole: "customer" }, body: { confirm: true } }, test.res, error => { failure = error; });
  assert.ok(failure); assert.equal(test.updates[0].update.$set.lastNotificationResult.partialOrFailed, true);
  console.log("PASS: trusted app release, admin-only send, explicit send, cooldown lock, 100-device batches, honest delivery status and failure lock release");
})().catch(error => { console.error(error); process.exitCode = 1; });
