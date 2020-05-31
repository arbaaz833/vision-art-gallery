const { admin, functions, refs, db } = require("./modules/firebase_config");

const Product = require("./modules/product(function)");
const protos = require("./modules/protos");
const Order = require("./modules/order");
const Storage = require("./modules/storagebucket");

exports.onProductUpdate = functions.firestore
  .document("products/{productId}")
  .onUpdate(Product.on_update);

exports.createNewArtist = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) throw new Error("unauthenticated");

    // checking the customs claims in the account
    const uid = context.auth.uid;
    const user = await admin.auth().getUser(uid);

    if (user.customClaims.admin === true) {
      // creating anonymous artist profile
      const profile = await admin.auth().createUser({});
      const artistUid = profile.uid;
      const batch = db().batch();

      // creating artist user document
      batch
        .set(refs.users.doc(artistUid), {
          displayName: data.diaplayName,
          avatar: protos.image({ original: data.avatar }),
          stats: {
            unopenedAlerts: 0,
          },
        })
        .set(refs.artist_profile(artistUid), {
          bio: data.bio,
        });

      await batch.commit();
    }
  } catch (e) {
    throw e;
  }
});

exports.makeNewOrder = functions.https.onCall(Order.on_new);
exports.makeImageVariants = functions.storage.object().onFinalize(Storage.test);

exports.checkOrderValidity = functions.https.onCall((data, context) => {
  try {
    //check if user is authenticated
    if (!context.auth) throw new Error("unauthenticated user");

    const { products } = data;

    db().runTransaction(async (transaction) => {
      const productDocs = await transaction.getAll(
        ...products.map((product) => refs.products.doc(product.id))
      );

      let result = true;

      for (let i = 0; i < productDocs.length; i++) {
        let productData = productDocs[i].data();
        let quantity = products[i].quantity;
        if (!productDocs[i].exists) result = false;
        if (productData.status != "forSale") result = false;
        if (quantity > productData.stockValue) result = false;

        if (result == false) {
          throw new functions.https.HttpsError(
            `product with quantity ${productData.stockValue} is out of stock`
          );
        }
      }
    });

    return { valid: true };
  } catch (error) {
    throw error;
  }
});
