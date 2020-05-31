const protos = require("./protos");
const { admin, refs, db } = require("./firebase_config");

const onPriceUpdate = async (change, context) => {
  try {
    let id = context.params.productId;
    let query = admin.firestore().collectionGroup("private").orderby(id);

    const newPrice = change.after.data().price.value;
    const oldPrice = change.before.data().price.value;

    //only continue if products's price has changed
    const isForSale = newData.status.value === "forSale" ? true : false;

    //if product is not for sale then only update its old price
    if (!isForSale)
      await change.after.ref.update({
        "price.oldValue": oldPrice,
      });

    await admin.firestore().runTransaction(async (transaction) => {
      try {
        //Step 2: get all those wishlist/cartItems through transaction which have this product
        let res = await transaction.get(query);

        //Step 3 : iterate through those docs and update this product's price inside them
        //TODO: handle the case if iteration count is greater than 500
        res.forEach((doc) => {
          transaction.update(doc.ref, {
            [`${id}.price`]: {
              value: newPrice,
              oldValue: oldPrice,
            },
          });
        });

        //Step 4: Update old price of the products's document itself
        transaction.update(change.after.ref, {
          "price.oldValue": oldPrice,
        });
      } catch (e) {
        throw e;
      }
    });
  } catch (e) {
    throw e;
  }
};

const on_update = async (change, context) => {
  try {
    const oldData = change.before.data();
    const newData = change.after.data();

    if (newData.price.value !== oldData.price.value) {
      await onPriceUpdate(change, context);
    }
  } catch (error) {
    throw error;
  }
};

const Product = {
  on_update,
};

module.exports = Product;
