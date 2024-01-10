/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const { buildTokenManager } = require('./model/token-manager')
const { buildRoutes } = require("./api/routes")
const { buildRun } = require("./model/run")
const { buildCache } = require("./model/build-cache")

initializeApp()

const db = getFirestore()
const cache = buildCache(db)
const run = buildRun(cache)
const tokenManager = buildTokenManager(run)
const routes = buildRoutes(tokenManager, logger)


exports.api = onRequest(routes)
