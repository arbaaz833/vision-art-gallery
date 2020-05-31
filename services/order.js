import { refs, db, c_user } from "./firebase_config";

const isValidProduct = (productDoc, reqdQty) => {
  if (!productDoc.exists) return false;
  if (productDoc.get("status.value") !== "forSale") return false;
  if (reqdQty > productDoc.get("stockValue")) return false;
  return true;
};

async function checkOrderValidity(data) {
  try {
    //check if user is authenticated
    if (!firebase.auth().currentUser) throw new Error("unauthenticated user");

    //products is an array of objects, products=[ { id:"" , quantity:"" } ]
    const { products } = data;
    const productids = products.map((product) =>
      refs.products.doc(product.id).get()
    );
    let productDocs = await Promise.all(productids);

    for (let i = 0; i < productDocs.length; i++) {
      let productDoc = productDocs[i];
      let reqdQty = products[i].quantity;
      if (!isValidProduct(productDoc, reqdQty)) {
        throw new Error(
          `product with quantity ${productDoc.get(
            "status.Value"
          )} is not for sale or out of stock`
        );
      }
      return true;
    }
  } catch (error) {
    throw error;
  }
}
