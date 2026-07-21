import cron from "node-cron";
import { prisma } from "./prisma.js";

// Check queue expiry every minute (Nepal Time)
cron.schedule(
    "* * * * *",
    async () => {
        console.log("Checking queue expiry...");

        try {
            // Current Nepal Time
            const nowNepal = new Date(
                new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Kathmandu",
                })
            );

            const currentHour = nowNepal.getHours();
            const currentMinute = nowNepal.getMinutes();

            // Get all waiting queues with their service center
            const waitingQueues = await prisma.queue.findMany({
                where: {
                    status: "WAITING",
                },
                include: {
                    serviceCenter: {
                        select: {
                            name: true,
                            closingHour: true,
                            closingMinute: true,
                        },
                    },
                },
            });

            if (waitingQueues.length === 0) {
                return;
            }

            for (const queue of waitingQueues) {
                const { closingHour, closingMinute } = queue.serviceCenter;

                const officeClosed =
                    currentHour > closingHour ||
                    (currentHour === closingHour &&
                        currentMinute >= closingMinute);

                if (!officeClosed) continue;

                await prisma.$transaction([
                    // Expire queue
                    prisma.queue.update({
                        where: { id: queue.id },
                        data: {
                            status: "EXPIRED",
                            expiresAt: new Date(),
                        },
                    }),

                    // Notify user
                    prisma.notification.create({
                        data: {
                            userId: queue.userId,
                            title: "Queue Expired",
                            message: `Your queue token #${queue.tokenNumber} for ${queue.serviceCenter.name} has expired because the service center has closed for today. Please join again tomorrow.`,
                        },
                    }),
                ]);

                console.log(
                    `Expired Queue Token #${queue.tokenNumber} (${queue.serviceCenter.name})`
                );
            }
            console.log("Queue expiry job completed.")
        } catch (error) {
            console.error("Queue expiry job failed:", error);
        }
    },
    {
        timezone: "Asia/Kathmandu",
    }
);
