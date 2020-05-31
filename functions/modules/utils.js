function reduce_to_area({ width, height, area }) {
  const imageArea = width * height;
  const ratio = Math.sqrt(imageArea / area);

  const shouldTransform = imageArea > area;

  return {
    width: shouldTransform ? Math.round(width / ratio) : width,
    height: shouldTransform ? Math.round(height / ratio) : height,
  };
}

function snap_to_array_index(index, arr) {
  return index < 0 ? 0 : index >= arr.length ? arr.length - 1 : index;
}

function enforce_enum(value, enums, fallback) {
  if (enums.includes(value)) return value;
  return fallback;
}

const delay = (duration) =>
  new Promise((res) => setTimeout(() => res(), duration));

const random_numeric_string = (digits) => {
  const offset = Math.pow(10, digits);
  return (Math.floor(Math.random() * offset) + offset).toString().substring(1);
};

const random_number = (min, max) => min + Math.random() * (max - min);

const random_int = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const pick_random = (arr) => arr[Math.floor(Math.random() * arr.length)];

const random_upper_string = (length) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const charsLength = chars.length;
  for (let i = 0; i < length; ++i)
    result += chars.charAt(Math.floor(Math.random() * charsLength));
  return result;
};

const gen_hash_string = (len) => {
  return "x".repeat(len).replace(/[xy]/g, (c) => {
    let r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const remove_key = (obj, key) => {
  let newObj = Object.assign({}, obj);
  delete newObj[key];
  return newObj;
};

const get_url_params = (query) => {
  const qPos = query.indexOf("?");
  const baseUrl = query.substr(0, qPos);
  query = query.slice(qPos + 1);
  const moreParams = query
    ? (/^[?#]/.test(query) ? query.slice(1) : query)
        .split("&")
        .reduce((params, param) => {
          let [key, value] = param.split("=");
          params[key] = value
            ? decodeURIComponent(value.replace(/\+/g, " "))
            : "";
          return params;
        }, {})
    : {};
  return { baseUrl, ...moreParams };
};

const file_name_without_extension = (path) => {
  const dotIndex = path.lastIndexOf(".");
  return path.slice(0, dotIndex);
};

const Utils = {
  snap_to_array_index,
  reduce_to_area,
  enforce_enum,
  delay,
  random_number,
  random_numeric_string,
  gen_hash_string,
  random_int,
  get_url_params,
  remove_key,
  pick_random,
  random_upper_string,
  file_name_without_extension,
};

module.exports = Utils;
