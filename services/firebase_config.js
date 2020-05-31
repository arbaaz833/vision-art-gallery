const firebase = require("firebase");
require("firebase/firestore");
require("firebase/auth");

let firebaseConfig = {
  apiKey: "AIzaSyBHiwSH8R8T5ysvueYmXMYqcbkcv3Q-MnI",
  authDomain: "vision-art-gallery.firebaseapp.com",
  databaseURL: "https://vision-art-gallery.firebaseio.com",
  projectId: "vision-art-gallery",
  storageBucket: "vision-art-gallery.appspot.com",
  messagingSenderId: "647315385957",
  appId: "1:647315385957:web:f7ad884ccedb53a38c608c",
  measurementId: "G-GB28YWD4PT",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//const db = firebase.firestore;
const users = db().collection("users");
const user_private = (uid) => users.doc(uid).collection("private");
const products = db().collection("products");
const cart = (uid) => user_private(uid).doc("cartItems");
const wishlist = (uid) => user_private(uid).doc("wishlist");
const orders = firebase.firestore().collection("users");

export const db = firebase.firestore;
export const refs = {
  users,
  user_private,
  products,
  cart,
  wishlist,
  orders,
};

export const server_timestamp = () => {
  firebase.firestore.FieldValue.serverTimestamp();
};
export const c_user = () => firebase.auth().currentUser;
