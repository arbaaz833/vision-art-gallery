const { admin, functions, refs, db } = require("./firebase_config");
const bucket = admin.storage().bucket();

const path = require("path");
const os = require("os");
const fs = require("fs-extra");
const sharp = require("sharp");
const utils = require("./utils");
const _ = require("lodash");

const paramsToUrl = (filePath, token) => {
  const BUCKET_NAME = "vision-art-gallery.appspot.com";
  return (
    "https://firebasestorage.googleapis.com/v0/b/" +
    BUCKET_NAME +
    "/o/" +
    encodeURIComponent(filePath) +
    "?alt=media&token=" +
    token
  );
};

const getDownloadUrl = async (filePath) => {
  try {
    const file = bucket.file(filePath);
    const uuid = utils.gen_hash_string(24);
    await file.setMetadata({
      metadata: {
        firebaseStorageDownloadTokens: uuid,
      },
    });
    return paramsToUrl(filePath, uuid);
  } catch (e) {
    throw e;
  }
};

const uploadFile = async (fileLoc, destination) => {
  try {
    const uuid = utils.gen_hash_string(24);
    const data = await bucket.upload(fileLoc, {
      destination,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });

    let file = data[0];
    return paramsToUrl(file.name, uuid);
  } catch (error) {
    throw error;
  }
};

const generateImageVariants = async (object) => {
  try {
    const sourcePath = object.name;
    const metadata = object.metadata;

    //chceking conditions
    if (!metadata.resize) return;
    if (!object.contentType.startsWith("image/"))
      throw new Error(`can not resize contentType of ${metadata.contentType}`);

    const variants = metadata.resize.variants;
    const sourceName = path.basename(sourcePath);
    const bucketDir = path.dirname(sourcePath);
    console.log(bucketDir);

    // fetching document
    const doc = await admin.firestore().doc(metadata.resize.docRef).get();
    if (!doc.exists) throw new Error(`document:${doc.id} does not exist`);

    //making directory and paths in temp
    const workingDir = path.join(os.tmpdir(), "variants");
    const tempFilePath = path.join(workingDir, sourceName);
    await fs.ensureDir(workingDir);

    //download the source file.
    await bucket.file(sourcePath).download({
      destination: tempFilePath,
    });

    //getting source file width and heigth through sharp
    const source = sharp(tempFilePath);
    const sourceData = await source.metadata();
    const width = sourceData.width;
    const height = sourceData.height;

    //finding the largest value in variant object
    const maxValue = Math.max(...Object.values(variants));
    const maxKey = Object.keys(variants).find(
      (key) => variants[key] === maxValue
    );
    const variantsArray = Object.keys(variants);
    const indexOfMaxKey = variantsArray.indexOf(maxKey);
    let uploadPromisses = [];

    //iterating on variants
    for (let variant in variants) {
      if (variant === maxKey) {
        uploadPromisses.push(getDownloadUrl(sourcePath));
        continue;
      }

      let VariantName = `${utils.file_name_without_extension(
        sourceName
      )}@${variant}_${variants[variant]}${path.extname(sourceName)}`;
      let variantPath = path.join(workingDir, VariantName);

      const area = variants[variant] * variants[variant];

      let toDim = utils.reduce_to_area({ width, height, area });

      console.log(toDim);

      //resizing image
      await sharp(tempFilePath)
        .resize(toDim.width, toDim.height)
        .toFile(variantPath);
      //pushing uploads in array
      uploadPromisses.push(
        uploadFile(variantPath, bucketDir + "/" + VariantName)
      );
    }
    //simultaneously uploading variants to storage
    let urls = await Promise.all(uploadPromisses);
    let imageschema = {};

    urls.forEach((url, index) => {
      imageschema[variantsArray[index]] = url;
    });

    const docData = doc.data();
    _.set(docData, metadata.resize.urlsLocation, imageschema);

    //uploading document back in db
    await doc.ref.set(docData);

    //removing the temp files
    await fs.remove(workingDir);
  } catch (error) {
    throw error;
  }
};

const test = (object) => {
  object = {
    metadata: {
      resize: {
        variants: {
          small: 200,
          large: 800,
          medium: 500,
        },
        docRef: "products/dmVMXL8ecvgYkrO2dKmr",
        urlsLocation: "images[1]",
      },
    },
    name: "images/village.jpg",
    contentType: "image/jpeg",
    //mediaLink:
    //"https://firebasestorage.googleapis.com/v0/b/vision-art-gallery.appspot.com/o/images%2Fvillage.jpg?alt=media&token=d0bfb3a9-f175-4638-bcda-47fc05a7e323",
  };
  return generateImageVariants(object);
};

const Storage = {
  generate_image_variants: generateImageVariants,
  test,
};

module.exports = Storage;

async function order() {
  const orders = await refs.orders
    .where("customerDetails.uid", "==", "abcd")
    .orderBy("metadata.createdAt")
    .get();
  orders.forEach((order) => console.log(order.data()));
}

order();
