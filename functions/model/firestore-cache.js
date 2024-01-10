class FirestoreCache {
  constructor(db) {
    this.db = db;
  }

  async get(key) {
    // Firestore does not allow forward slashes in keys
    key = key.split("://").join("-");

    const entry = await this.db.collection("state").doc(key).get();

    if (entry.exists) {
      return JSON.parse(entry.data().value);
    }
  }

  async set(key, value) {
    // Firestore does not allow forward slashes in keys
    key = key.replace(/:\/\/+/g, "-");

    const serialized = {
      value: JSON.stringify(value),
    };

    return this.db.collection("state").doc(key).set(serialized);
  }
}

module.exports = {FirestoreCache};
