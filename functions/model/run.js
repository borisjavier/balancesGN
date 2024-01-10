require("./monkey-patch-run");
const Run = require("gdn-run-sdk");

function buildRun(cache) {
  return new Run({
    trust: ["a5c5b72267ea32eab1ff4c7a87da1d2c8515ddb260d88c05eb84b2c16e393e48", "3ba617b9adf0ad3730d05c5a0bc10442182917823865e7c7e4a613a70ab14089"],
    api: "whatsonchain",
    // purse: 'L2FLdLwbF3kyfAGhvMzV3y7mtxYtMAradjJqnSXHSKsqTofoKycT',
    state: new Run.plugins.LocalState(),
    cache,
    networkTimeout: 20000,
    timeout: 10000000,
    networkRetries: 5,
  });
}

async function load(run, location) {
  try {
    return run.load(location);
  } catch (e) {
    if (e.message === "Not a RUN transaction: invalid OP_RETURN protocol") {
      return null;
    } else {
      throw e;
    }
  }
}

module.exports = {
  buildRun,
  load,
};
