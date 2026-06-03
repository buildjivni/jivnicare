require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDoctor() {
    try {
        await prisma.doctor.updateMany({
            data: {
                availableTimeSlots: {
                    "Monday": {"start": "00:00", "end": "23:59"},
                    "Tuesday": {"start": "00:00", "end": "23:59"},
                    "Wednesday": {"start": "00:00", "end": "23:59"},
                    "Thursday": {"start": "00:00", "end": "23:59"},
                    "Friday": {"start": "00:00", "end": "23:59"},
                    "Saturday": {"start": "00:00", "end": "23:59"},
                    "Sunday": {"start": "00:00", "end": "23:59"}
                },
                availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
            }
        });
        console.log('Doctor availability updated to 24x7.');
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
updateDoctor();
