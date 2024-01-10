const express = require("express");
const bodyParser = require("body-parser");
const {Address, PrivateKey} = require("@runonbitcoin/nimble");
const handle = require("express-async-handler");
const {buildErrorHandler} = require("./error-handler");
const {GnError} = require("../model/gn-error");

function buildRoutes(tokenManager, logger) {
  const app = express();
  app.use(bodyParser.json());

  app.post("/balance", handle(async (req, res) => {
    const body = req.body;
    const ownerAddress = body.ownerAddress;

    if (!ownerAddress) {
      throw new GnError("missing address", 400);
    }

    const address = Address.fromString(ownerAddress);
    res.json(await tokenManager.balance(address));
  }));

  app.post("/send", handle(async (req, res) => {
    const props = ["ownerWif", "purseWif", "receiverAddress", "amount"];
    props.forEach((prop) => {
      if (!req.body[prop]) {
        throw new GnError(`missing ${prop}`, 400);
      }
    });

    const wifs = ["ownerWif", "purseWif"];
    const [ownerPk, pursePk] = wifs.map((wifProp) => {
      try {
        return PrivateKey.fromString(req.body[wifProp]);
      } catch (e) {
        throw new GnError(
            `Wrong wif format for ${wifProp}`,
            400,
            {[wifProp]: {provided: req.body[wifProp]}},
        );
      }
    });

    const [receiverAddress] = ["receiverAddress"].map((addrProp) => {
      const addrStr = req.body[addrProp];
      try {
        return Address.fromString(addrStr);
      } catch (e) {
        throw new GnError(
            `Wrong address format for ${addrProp}`,
            400,
            {[addrProp]: {provided: addrStr}},
        );
      }
    });

    const {amount} = req.body;

    if (Number.isNaN(Number(amount))) {
      throw new GnError(`'amount' should be a number`, 400, {amount: {original: "amount"}});
    }

    const location = await tokenManager
        .send(ownerPk, pursePk, receiverAddress, amount);
    res.json(location);
  }));

  app.use(buildErrorHandler(logger));

  return app;
}

module.exports = {buildRoutes};
