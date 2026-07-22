import crypto from "node:crypto";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// A 6-digit numeric code, easy to type from an email/SMS.
const generateOtp = () => {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH - 1;
    return String(crypto.randomInt(min, max + 1));
};

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MS);

export { generateOtp, hashOtp, getOtpExpiry };