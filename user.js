import { functions } from "firebase";

async function createUser(data) {
  try {
    await db.collection("users").doc(firebase.auth().currentUser.uid).set(data);
  } catch (error) {
    throw error;
  }
}

async function updateUser(data) {
  try {
    await db
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update(data);
  } catch (error) {
    throw error;
  }
}
