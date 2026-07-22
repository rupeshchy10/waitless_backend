import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/utils/prisma.js";

const seedAdmin = async () => {
    const {
        SEED_ADMIN_FULLNAME,
        SEED_ADMIN_EMAIL,
        SEED_ADMIN_PASSWORD,
        SEED_ADMIN_PHONE,
        SEED_ADMIN_ADDRESS,
    } = process.env;

    if (
        !SEED_ADMIN_FULLNAME ||
        !SEED_ADMIN_EMAIL ||
        !SEED_ADMIN_PASSWORD ||
        !SEED_ADMIN_PHONE ||
        !SEED_ADMIN_ADDRESS
    ) {
        console.error(
            "Missing SEED_ADMIN_* env vars. Set SEED_ADMIN_FULLNAME, SEED_ADMIN_EMAIL, " +
                "SEED_ADMIN_PASSWORD, SEED_ADMIN_PHONE, SEED_ADMIN_ADDRESS in your .env"
        );
        process.exit(1);
    }

    // Idempotency guard: if any admin already exists, do nothing. This is
    // what makes it safe to run this script again by accident.
    const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
    });

    if (existingAdmin) {
        console.log(
            `An admin already exists (${existingAdmin.email}). Skipping seed.`
        );
        return;
    }

    const normalizedEmail = SEED_ADMIN_EMAIL.trim().toLowerCase();

    const existingUserWithEmail = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (existingUserWithEmail) {
        console.error(
            `A user with email ${normalizedEmail} already exists but isn't an admin. ` +
                "Pick a different SEED_ADMIN_EMAIL, or promote that account manually."
        );
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);

    const admin = await prisma.user.create({
        data: {
            fullName: SEED_ADMIN_FULLNAME.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            phoneNumber: SEED_ADMIN_PHONE.trim(),
            address: SEED_ADMIN_ADDRESS.trim(),
            role: "ADMIN",
        },
    });

    console.log(`Admin account created: ${admin.email}`);
};

seedAdmin()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });