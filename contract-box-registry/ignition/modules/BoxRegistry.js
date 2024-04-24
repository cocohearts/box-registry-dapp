const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BoxModule", (m) => {
  const factory = m.contract("BoxRegistry");

  return { factory };
});
