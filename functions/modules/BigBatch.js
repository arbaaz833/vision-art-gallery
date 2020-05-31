const firebase = require("firebase-admin");

function checkAndRenewBatch() {
  if (this.writes >= 500) {
    this.batches.push(firebase.firestore().batch());
    this.i++;
    this.writes = 0;
  }
  this.writes++;
}

module.exports = class BigBatch {
  constructor() {
    this.batches = [firebase.firestore().batch()]; //batches array
    this.i = 0; //index number to indicate current batch
    this.writes = 0; //writes performed in current batch
  }

  set(docRef, data, options) {
    checkAndRenewBatch.call(this);
    this.batches[this.i].set(docRef, data, options);
    return this;
  }

  update(docRef, data, options) {
    checkAndRenewBatch.call(this);
    this.batches[this.i].set(docRef, data, options);
    return this;
  }

  delete(docRef) {
    checkAndRenewBatch.call(this);
    this.batches[this.i].delete(docRef);
    return this;
  }

  commit() {
    return Promise.all(this.batches.map(batch => batch.commit()));
  }
};
