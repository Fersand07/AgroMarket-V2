import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

async function checkDatabaseConnection() {
    try {
        // Intenta conectar a la base de datos
        await prisma.$connect();
        console.log('✅ Base de datos conectada exitosamente (PostgreSQL en Neon).');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos PostgreSQL:');
        console.error(error.message);
    }
}

checkDatabaseConnection();