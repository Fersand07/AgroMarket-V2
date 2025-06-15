import mongoose from "mongoose";

mongoose.set('strictQuery', false);

const uri = process.env.MONGODB_URI;

async function connectDB() {
    try {
        await mongoose.connect(uri, { useNewUrlParser: true });
        console.log('base de datos conectada');
    } catch (e) {
        console.log('error al conectar la base de datos: ' + e);
    }
}

connectDB();