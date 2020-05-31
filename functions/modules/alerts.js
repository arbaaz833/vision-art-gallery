/*
generate alerts when:

1.price of the product is decreased.
2. state of the order is changed.
3. a new event is created by the admin.

 an alert is created by the trigger function on the coresponding documents.
*/
const BigBatch = require("./BigBatch");
const protos = require("./protos");
const { refs } = require("./firebase_config");

const getNewAlertDocument = ({ content, onProfile, data }) => {
  return {
    content: {
      title: content.title,
      body: content.body,
      image: content.image,
    },
    onProfile: onProfile.map((type) => type),
    data,
    status: protos.status({ value: "sent" }),
    metadata: {
      createdAt: protos.metaData.created().createdAt,
    },
  };
};

async function sendAlerts(uids, alertData) {
  try {
    const alertDoc = getNewAlertDocument(alertData);
    const batch = new BigBatch();
    uids.forEach((uid) => {
      batch.set(refs.alerts(uid), alertDoc);
    });
    await batch.commit();
  } catch (error) {
    throw error;
  }
}
