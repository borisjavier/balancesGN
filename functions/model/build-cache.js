const { FirestoreCache } = require("./firestore-cache")

function buildCache (db) {
    return new FirestoreCache(db)
}

module.exports = { buildCache }