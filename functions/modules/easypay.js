const fetch = require("node-fetch");
const querystring = require("querystring");

const API_KEY = process.env.EASYPAY_API_KEY;

async function doSale(fields) {
  try {
    const endpoint = "https://secure.easypaydirectgateway.com/api/transact.php";
    const reqFields = [
      "payment_token",
      "amount",
      "orderid",
      "ipaddress",
      "first_name",
      "last_name",
      "city",
      "zip",
      "country",
    ];

    const data = {
      security_key: API_KEY,
      type: "sale",
    };

    //populate required fields
    for (let reqField of reqFields) {
      const value = fields[reqField];
      if (!value) throw new Error(`required field ${reqField} not found!`);
      else data[reqField] = value;
    }

    const postData = querystring.stringify(data);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
      body: postData,
    });

    if (!res.ok) throw new Error(res.statusText);
    const json = querystring.parse(await res.text());

    if (json.response !== "1")
      throw new Error(`Transaction Failed: ${json.responsetext}`);

    return json;
  } catch (e) {
    throw e;
  }
}

module.exports = { doSale };
