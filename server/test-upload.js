const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

async function run() {
  try {
    const form = new FormData();
    form.append("name", "Test Item");
    form.append("price", "100");
    form.append("deposit", "50");
    form.append("category", "Tech");
    form.append("lat", "19.07");
    form.append("lng", "72.87");
    form.append("address", "Bandra");

    fs.writeFileSync("dummy.jpg", "fake img");
    form.append("image", fs.createReadStream("dummy.jpg"));

    // We need a valid token. Let's just try without one to see if it reaches protect
    const res = await axios.post("http://localhost:8000/api/products", form, {
      headers: form.getHeaders(),
    });
    console.log("Success", res.data);
  } catch(err) {
    if (err.response) {
      console.error("HTTP ERROR:", err.response.status);
      console.error("REASON:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
}
run();
