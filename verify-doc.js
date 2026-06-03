require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDoc() {
    try {
        await prisma.doctor.updateMany({
            where: { name: 'Audit Test Doctor' },
            data: { verificationStatus: 'VERIFIED', isAcceptingAppointments: true }
        });
        console.log('Doctor verified.');
    } finally {
        await prisma.$disconnect();
    }
}
verifyDoc();
