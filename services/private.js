import { refs, db, c_user } from "./firebase_config";

async function order() {
  try {
    const orders = await refs.orders
      .where("customersDetails.uid", "==", c_user().uid)
      .orderBy("metadata.createdAt")
      .get();
    const orderDocs = [];
    orders.forEach((order) => {
      orderDocs.push(order.data());
    });
    return orderDocs;
  } catch (error) {
    throw error;
  }
}

async function wishlist() {
  try {
    const listDocs = await refs.wishlist(c_user().uid).get();
    const wishlistData = [];
    listDocs.forEach((product) => {
      wishlistData.push(product.data());
      return wishlistData;
    });
  } catch (error) {
    throw error;
  }
}

async function cartItems() {
  try {
    const cartItemsDocs = await refs.cart(c_user().uid).get();
    const cartItemsData = [];
    cartItemsDocs.forEach((item) => {
      cartItemsData.push(item.data());
    });
    return cartItemsData;
  } catch (error) {
    throw error;
  }
}
