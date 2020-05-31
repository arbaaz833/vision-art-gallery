const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require("../service_account.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "vision-art-gallery.appspot.com",
});

const users = admin.firestore().collection("users");
const artist_profile = (uid) => user_private(uid).doc("artistProfile");
const user_private = (uid) => users.doc(uid).collection("private");
const products = admin.firestore().collection("products");
const cart = (uid) => user_private(uid).doc("cartItems");
const wishlist = (uid) => user_private(uid).doc("wishlist");
const orders = admin.firestore().collection("orders");
const server_timestamp = () => {
  admin.firestore.FieldValue.serverTimestamp();
};
const alerts = (uid) => users.doc(uid).collection("alerts");

const refs = {
  users,
  user_private,
  products,
  cart,
  wishlist,
  artist_profile,
  orders,
  alerts,
};

module.exports = {
  server_timestamp,
  db: admin.firestore,
  refs,
  admin,
  functions,
};
