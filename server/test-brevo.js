require('dotenv').config();
const { sendRentalConfirmation } = require('./services/mailService');

async function test() {
  try {
    await sendRentalConfirmation({
      toEmail: "girrajbohra50@gmail.com",
      renterName: "Test Renter",
      productName: "Test Product",
      duration: 1,
      price: 100,
      deposit: 50
    });
    console.log("Done calling brevo.");
  } catch (e) {
    console.error("Error calling brevo:", e);
  }
}
test();
