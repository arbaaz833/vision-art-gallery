const { server_timestamp } = require("./firebase_config");

const status = ({
  value,
  timestamp = server_timestamp(),
  description = null,
}) => ({
  value,
  timestamp,
  description,
});

const price = ({ value, oldValue = null }) => ({
  value,
  oldValue,
});
const artist = ({ name, avatar, id = null }) => ({
  name,
  avatar,
  id,
});

const metaData = {
  updated: ({ updatedAt = server_timestamp(), updatedBy = c_user() }) => ({
    updatedAt,
    updatedBy,
  }),
  created: ({ createdAt = server_timestamp(), createdBy = c_user() }) => ({
    createdAt,
    createdBy,
  }),
};

const dimension_2d = ({ width, height }) => ({
  width,
  height,
});

const images = ({ images }) => {
  return images.map((original) => image({ original }));
};

const image = ({
  original,
  thumbnail = null,
  medium = null,
  large = null,
}) => ({
  thumbnail,
  medium,
  large,
  original,
});

const user_Details = ({ name, avatar }) => ({
  name,
  avatar: image({ avatar }),
  id: c_user(),
});
const protos = {
  status,
  price,
  images,
  dimension_2d,
  metaData,
  user_Details,
  image,
  artist,
};

module.exports = protos;
