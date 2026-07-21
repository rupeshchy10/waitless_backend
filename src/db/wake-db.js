// import { PrismaClient } from "../generated/prisma/client.js"
import { prisma } from "../utils/prisma.js";

async function wakeDatabase() {
    console.log("Trying to wake Neon...");

    while (true) {
        try {
            await prisma.$queryRaw`SELECT 1`;

            console.log("Database is awake!");
            break;
        } catch (err) {
            console.log("Database sleeping... retrying in 5 seconds");
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    }

    await prisma.$disconnect();
}

wakeDatabase();
