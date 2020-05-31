import { refs, db } from "./firebase_config";

const filters = {
  artists: [],
  genre: [],
  canvasType: [],
  paintType: [],
  "dimensions.width": {
    min: "",
    max: "",
  },
  "dimensions.height": { min: "", max: "" },

  price: {
    min: "",
    max: "",
  },
};

const query_builder = (filters, priceOrdering) => {
  const basic_query = refs.products
    .where("productType", "==", "painting")
    .where("status.value", "==", "forSale");
  let query = basic_query;

  let rangeFilters = [];

  for (let key in filters) {
    const filter = filters[key];
    if (Array.isArray(filter)) query = query.where(key, "in", filter);
    else rangeFilters.push([key, filter]);
  }

  if (rangeFilters.length > 0) {
    const priceIndex = rangeFilters.findIndex((e) => e[0] === "price");
    if (priceIndex > -1) {
      //if price filter is present
      const [key, val] = rangeFilters[priceIndex];
      query = query.where(key, ">=", val.min).where(key, "<=", val.max);
      rangeFilters = rangeFilters.splice(priceIndex, 1);
    } else if (!priceOrdering) {
      //if price sorting is not present
      const [key, val] = rangeFilters[0];
      query = query.where(key, ">=", val.min).where(key, "<=", val.max);
      rangeFilters = rangeFilters.slice(1);
    }
  }

  if (priceOrdering) query = query.orderBy("price", priceOrdering);

  return { query, manualFilters: rangeFilters };
};

const get_paintings = async ({
  query,
  manualFilters,
  batchSize,
  startAfter,
}) => {
  try {
    let paintings = [];
    if (startAfter) query = query.startAfter(startAfter);

    const snap = await query.limit(batchSize).get();
    snap.forEach((doc) => {
      const painting = { id: doc.id, ...doc.data() };
      for (let filter of manualFilters) {
        const [key, val] = filter;
        if (painting[key] < val.min || painting[key] > val.max) return;
      }
      paintings.push(painting);
    });

    return { paintings, lastDoc: snap.docs[batchSize - 1] };
  } catch (error) {
    throw error;
  }
};

export default class FilteredPaintings {
  constructor({ filters, priceOrdering }) {
    this.filters = filters;
    this.priceOrdering = priceOrdering;
    this.limitReached = false;
  }

  async get_next(batchSize = 15) {
    if (this.limitReached) return [];
    const { query, manualFilters } = query_builder(
      this.filters,
      this.priceOrdering
    );
    const { paintings, lastDoc } = await get_paintings({
      query,
      manualFilters,
      batchSize,
      startAfter: this.lastDoc,
    });
    if (!lastDoc) this.limitReached = true;
    this.lastDoc = lastDoc;
    return paintings;
  }
}
