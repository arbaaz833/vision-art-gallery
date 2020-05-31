import Protos from "./protos";
import { db, c_user, refs } from "./firebase_config";
import Utils from "./utils";

async function getNewPaintingDocument(
  {
    title,
    description,
    price,
    artistUid,
    images,
    displayImageIndex,
    genre,
    canvasType,
    paintType,
    collection,
    dimension,
    completionDate,
    status,
  },
  data
) {
  return {
    title: title ? title : null,
    description: description ? description : null,
    price: Protos.price(price),
    // only take artist uid and fetch artist data
    artist: {
      displayName: data.displayName,
      avatar: data.avatar.thumbnail,
      uid: artistUid,
    },
    images: images.map((img) => null),
    displayImageIndex: Utils.snap_to_array_index(displayImageIndex, images),
    genre,
    canvasType,
    paintType,
    collection: collection,
    dimension: Protos.dimension2d(dimension),
    completionDate,
    productType: "painting",
    status:
      status === "forSale"
        ? Protos.status({ value: status })
        : Protos.status({ value: "archived" }),
    stockValue: 1,
    metaData: {
      ...Protos.metaData().created,
      ...Protos.metaData().updated,
    },
  };
}
async function createNewProduct(newProduct) {
  try {
    const artistDoc = await refs.users.doc(artistUid).get();
    const artistData = artistDoc.data();
    const res = getNewPaintingDocument(newProduct, artistData);
    await refs.products.add(res);
  } catch (error) {
    return error;
  }
}

async function updateProductPrice(newPrice, productId) {
  try {
    //try ... catch*
    await refs.products.doc(productId).update({
      "price.value": newPrice,
    });
  } catch (error) {
    throw error;
  }
}

async function addToCart(productId) {
  //condition for status === 'forSale' && stock > 0*
  try {
    const uid = c_user().uid;
    db().runTransaction(async (transaction) => {
      const res = await transaction.get(refs.products.doc(productId));
      if (!res.exists) throw new Error("product no longer exists");
      const product = res.data();
      if (product.status.value === "forSale" && product.stockValue > 0) {
        transaction.set(
          refs.cart(uid),
          {
            [productId]: {
              //match schema of cart item
              productDetails: {
                title: product.title,
                artistDeatils: {
                  name: product.artist.displayName,
                  id: product.artist.uid,
                },
                dimensions: product.dimensions,
                price: product.price,
                image: {
                  thumbnail:
                    product.images[product.displayImageIndex].thumbnail,
                },
                metadata: {
                  createdAt: Protos.metaData.created().createdAt,
                },
              },
              documentType: "cart",
            },
          },
          { merge: true }
        );
      } else throw new Error("product out of stock");
    });
  } catch (e) {
    throw e;
  }
}

async function addToWishList(productId) {
  const uid = c_user().uid;
  try {
    //apply transaction with same conditions as in case of cart*
    db().runTransaction(async (transactions) => {
      const res = await transactions.get(refs.products.doc(productId));
      if (!res.exists) throw new Error("Product no longer exists");
      const product = res.data();
      if (product.status.value === "forSale" && product.stockValue > 0) {
        transactions.set(
          refs.wishlist(uid),
          {
            [productId]: {
              productDetails: {
                title: product.title,
                artistDeatils: {
                  name: product.artist.displayName,
                  id: product.artist.uid,
                },
                price: product.price,
                image: {
                  thumbnail:
                    product.images[product.displayImageIndex].thumbnail,
                },
                metadata: {
                  createdAt: Protos.metaData.created().createdAt,
                },
              },
              documentType: "cart",
            },
          },
          { merge: true }
        );
      } else throw new Error("product out of stock");
    });
  } catch (e) {
    throw e;
  }
}
// create product*
// update product price*
// CF trigger for update price*
// Bucket trigger

async function removeFromCart(productID) {
  try {
    const uid = c_user().uid;
    await refs.cart(uid).update({
      [productID]: db.FieldValue.delete(),
    });
  } catch (error) {
    throw error;
  }
}

async function removeFromWishlist(productID) {
  try {
    const uid = c_user().uid;
    await refs.wishlist(uid).update({
      [productID]: db.FieldValue.delete(),
    });
  } catch (error) {
    throw error;
  }
}
