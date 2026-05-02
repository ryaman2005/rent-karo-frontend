const nodemailer = require("nodemailer");

// Use nodemailer with Gmail since the user's Gmail is verified and works
const transporter = nodemailer.createTransport({
  pool: true,
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail({ toEmail, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("[Email] EMAIL_USER or EMAIL_PASS not found! Email not sent.");
    return;
  }

  try {
    await transporter.sendMail({
      from: `"rentKaro" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: html,
    });
  } catch (err) {
    console.error("[Email] Error:", err.message);
    throw err;
  }
}

/**
 * Send an Email confirmation to the renter.
 */
async function sendRentalConfirmation({ toEmail, renterName, productName, duration, price, deposit }) {
  if (!toEmail) return;

  const totalRent = parseInt(price) * duration;
  const grandTotal = totalRent + parseInt(deposit);

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #4f46e5;">✅ Rental Confirmed</h2>
      <p>Hi <strong>${renterName}</strong>,</p>
      <p>Your rental request has been confirmed by the owner!</p>

      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;">🛒 <strong>Item:</strong> ${productName}</p>
        <p style="margin: 5px 0;">📅 <strong>Duration:</strong> ${duration} month${duration > 1 ? "s" : ""}</p>
        <p style="margin: 5px 0;">💰 <strong>Monthly Rent:</strong> ₹${price}/mo</p>
        <p style="margin: 5px 0;">💳 <strong>Total Rent:</strong> ₹${totalRent}</p>
        <p style="margin: 5px 0;">🔒 <strong>Security Deposit:</strong> ₹${deposit} (refundable)</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 15px 0;"/>
        <p style="margin: 5px 0; font-size: 18px;"><strong>Total Due:</strong> ₹${grandTotal}</p>
      </div>

      <p>Thank you for using <strong>rentKaro</strong>. Return the item anytime to get your deposit back.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">— Team rentKaro</p>
    </div>
  `;

  try {
    await sendEmail({
      toEmail,
      subject: `Rental Confirmed: ${productName}`,
      html
    });
    console.log(`[Email] Confirmation sent to ${toEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send message:", err.message);
  }
}

/**
 * Send an Email rejection notice to the renter.
 */
async function sendRentalRejection({ toEmail, renterName, productName }) {
  if (!toEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #ef4444;">❌ Rental Update</h2>
      <p>Hi <strong>${renterName}</strong>,</p>
      <p>Unfortunately, the owner was unable to confirm your rental request for <strong>${productName}</strong> at this time.</p>
      <p>Please browse other available items on our platform.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">— Team rentKaro</p>
    </div>
  `;

  try {
    await sendEmail({
      toEmail,
      subject: `Rental Update: ${productName}`,
      html
    });
    console.log(`[Email] Rejection sent to ${toEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send rejection:", err.message);
  }
}

/**
 * Send an OTP Email for signup verification.
 */
async function sendOtpEmail({ toEmail, otp }) {
  if (!toEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #4f46e5;">🔐 Verification Code</h2>
      <p>Hi,</p>
      <p>Your one-time password (OTP) to complete your signup at <strong>rentKaro</strong> is:</p>
      <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
      </div>
      <p>This code will expire in <strong>5 minutes</strong>. Do not share it with anyone.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">— Team rentKaro</p>
    </div>
  `;

  try {
    await sendEmail({
      toEmail,
      subject: `Your Verification Code: ${otp}`,
      html
    });
    console.log(`[Email] OTP sent to ${toEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send OTP:", err.message);
  }
}

/**
 * Send an Email notification to the renter that their request was placed.
 */
async function sendRentalPlaced({ toEmail, renterName, productName }) {
  if (!toEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #4f46e5;">⏳ Request Submitted</h2>
      <p>Hi <strong>${renterName}</strong>,</p>
      <p>Your rental request for <strong>${productName}</strong> has been successfully placed!</p>
      <p>We are waiting for the owner to confirm your request. You will receive another email once they respond.</p>
      <p>Thank you for using <strong>rentKaro</strong>.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">— Team rentKaro</p>
    </div>
  `;

  try {
    await sendEmail({
      toEmail,
      subject: `Rental Request Placed: ${productName}`,
      html
    });
    console.log(`[Email] Rental placed email sent to renter: ${toEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send rental placed email:", err.message);
  }
}

/**
 * Send an Email notification to the owner about a new rental request.
 */
async function sendOwnerNewRequest({ toEmail, ownerName, renterName, productName }) {
  if (!toEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
      <h2 style="color: #4f46e5;">🔔 New Rental Request!</h2>
      <p>Hi <strong>${ownerName || "Owner"}</strong>,</p>
      <p><strong>${renterName}</strong> just requested to rent your item: <strong>${productName}</strong>.</p>
      <p>Please log in to your <strong>rentKaro</strong> admin dashboard to review and confirm or reject this request.</p>
      <p style="color: #64748b; font-size: 12px; margin-top: 30px;">— Team rentKaro</p>
    </div>
  `;

  try {
    await sendEmail({
      toEmail,
      subject: `New Rental Request for ${productName}`,
      html
    });
    console.log(`[Email] New request email sent to owner: ${toEmail}`);
  } catch (err) {
    console.error("[Email] Failed to send new request email to owner:", err.message);
  }
}

module.exports = { sendRentalConfirmation, sendRentalRejection, sendOtpEmail, sendRentalPlaced, sendOwnerNewRequest };
