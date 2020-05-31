//args: [{id, quantity}],{shipping address:according to schema},paymentMethod

/*
Prod A: qty a
Prod B: qty b
Prod C: qty c
*/

/*
STEP1: get all products inside a  transaction whose ids are given
STEP2: check if those products exists and are forSale and their stocks are >= their corresponding productQuantities
STEP3: create order document 
create document by transaction
STEP 4: remove those product from the cart.
STEP 5: decrese the stock by product quantity 
*/
const { functions, admin, refs, db, serverTime } = require("./firebase_config");
const protos = require("./protos");
const utils = require("./utils");
const { doSale } = require("./easypay");

const isValidProduct = (productDoc, reqdQty) => {
  if (!productDoc.exists) return false;
  if (productDoc.get("status.value") !== "forSale") return false;
  if (reqdQty > productDoc.get("stockValue")) return false;
  return true;
};

const getNewOrderDocument = ({
  totalPrice,
  totalQuantity,
  productMap,
  shippingDetails,
  customerDetails,
  phoneNumber,
  paymentDetails,
}) => {
  const { address, city, country } = shippingDetails;
  const { displayName, uid } = customerDetails;
  const paymentMethod = utils.enforce_enum(paymentDetails.paymentMethod, [
    "online",
    "cash",
  ]);

  if (paymentMethod === "online") {
    const {
      transactionId,
      authCode,
      cvvResponse,
      avsResponse,
    } = paymentDetails;
    paymentDetails = {
      transactionId,
      authCode,
      cvvResponse,
      avsResponse,
    };
  }
  paymentDetails.paymentMethod = paymentMethod;

  return {
    products: {
      ...productMap, //can be deep checked to make it more independent
      metaData: protos.metaData.created().createdAt,
      shippingDetails: {
        address,
        city,
        country,
        phoneNumber,
      },
      customerDetails: {
        displayName,
        uid,
      },
      paymentDetails,
      status: protos.status({ value: "pending" }),
      totalPrice,
      totalProductsQuantity: totalQuantity,
      expectedDeliveryDate: null,
    },
  };
};

const newOrder = async (data, context) => {
  try {
    const uid = context.auth.uid;
    const { products, shippingAddress, paymentMethod } = data;

    await db().runTransaction(async (transaction) => {
      try {
        //STEP1: get all products inside a  transaction whose ids are given
        const [
          userDoc,
          userPrivateDoc,
          ...productDocs
        ] = await transaction.getAll(
          refs.users.doc(uid),
          refs.user_private(uid).doc("privateData"),
          ...products.map((product) => refs.products.doc(product.id))
        );
        const phoneNumber = userPrivateDoc.get("contactDetails.phoneNumber");

        const customerDetails = {
          displayName: userDoc.data().displayName,
          uid: uid,
        };

        const productsMap = {};
        let totalPrice = 0,
          totalProductsQuantity = 0;

        //STEP2: check if those products exists and are forSale and their stocks are >= their corresponding productQuantities
        for (let i = 0; i < productDocs.length; ++i) {
          const reqdProd = products[i];
          const productDoc = productDocs[i];
          if (!isValidProduct(productDoc, reqdProd.quantity))
            throw new Error(
              `product ${productDoc.id}: not for sale or insufficient stock`
            );
          const cartUpdates = {};
          cartUpdates[productDoc.id] = db.FieldValue.delete();
          const productData = productDoc.data();
          productsMap[productDoc.id] = {
            productDetails: {
              title: productData.title,
              artistDetails: {
                name: productData.artist.name,
                uid: productData.artist.uid,
              },
              dimensions: productData.dimensions,
            },
            price: productData.price,
            image: productData.images[productData.displayImageIndex].thumbnail,
            productQuantity: reqdProd.quantity,
          };
          totalPrice += productData.price.value * reqdProd.quantity;
          totalProductsQuantity += reqdProd.quantity;
        }

        const orderRef = refs.orders.doc();
        //Withdraw amount from customer's card if online payment
        if (paymentMethod === "online") {
          const {
            first_name,
            last_name,
            payment_token,
            city,
            country,
            zip,
            ipaddress,
          } = data.paymentFields;
          const saleResp = await doSale({
            first_name,
            last_name,
            payment_token,
            city,
            country,
            zip,
            ipaddress,
            amount: totalPrice,
            orderid: orderRef.id,
          });
        }

        //STEP3: create order document
        transaction.set(
          orderRef,
          getNewOrderDocument({
            totalPrice,
            totalQuantity: totalProductsQuantity,
            productMap,
            shippingAddress,
            customerDetails,
            phoneNumber,
            paymentDetails:
              paymentMethod === "online"
                ? {
                    paymentMethod,
                    transactionId: saleResp.transactionid,
                    authCode: saleResp.authcode,
                    avsResponse: saleResp.avsresponse,
                    cvvResponse: saleResp.cvvresponse,
                  }
                : { paymentMethod },
          })
        );

        //STEP 4: remove those product from the cart.
        transaction.update(refs.cart(uid), cartUpdates);

        //STEP 5: decrese the stock by product quantity
        products.forEach((prod, index) => {
          transaction.update(refs.products.doc(prod.id), {
            stockValue: productDocs[index].get("stockValue") - prod.quantity,
          });
        });
      } catch (e) {
        throw e;
      }
    });
  } catch (e) {
    throw e;
  }
};

const Order = {
  on_new: newOrder,
};
module.exports = Order;
