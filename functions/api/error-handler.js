const {GnError} = require("../model/gn-error");

function buildErrorHandler(logger) {
  function errorHandler(err, req, res, next) {
    if (err.message === "bad checksum") {
      return res.status(400).json({
        message: "wrong address",
      });
    }
    if (err instanceof GnError) {
      return res.status(err.status).json({
        message: err.message,
        data: err.data,
      });
    }

    logger.warn(`Unknown error: ${err.message}`);
    res.status(500).send({
      message: "internal server error",
    });
  }

  return errorHandler;
}

module.exports = {
  buildErrorHandler,
};
