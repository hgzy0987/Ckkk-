const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const BREVO_API_KEY = "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"; // Brevo API Key বসাও
const TEMPLATE_ID = "xoxE2DGK5e6EpXwfd7htqwkHvQwKUpzp3eTIJcxn6ohCHOmzlyX4GAps";
const OTP_STORE = {}; // email → otp

// Send OTP
app.post("/sendOtp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    OTP_STORE[email] = otp;

    await axios.post("https://api.brevo.com/v3/smtp/email", {
      to: [{ email }],
      templateId: TEMPLATE_ID,
      params: { otp },
      sender: { name: "Trust BD", email: "verify.trustbd@gmail.com" }
    }, {
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json"
      }
    });

    res.json({ message: "OTP sent" });
  } catch (err) {
    console.log(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/verifyOtp", (req, res) => {
  const { email, otp } = req.body;
  if (OTP_STORE[email] && OTP_STORE[email] == otp) {
    delete OTP_STORE[email]; // OTP used
    res.json({ message: "OTP verified" });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
