//#region  modules
import {} from 'dotenv/config';
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
//#endregion

//#region  local modules
import './src/database/connectdb.js';
import authRoute from './src/routes/auth.route.js';
import productsRoute from './src/routes/products.route.js';
import profileRoute from './src/routes/user.route.js';
import uploadRoute from './src/routes/upload.route.js'
import getDataRoute from './src/routes/getData.route.js';
import transactionRoute from './src/routes/transaction.route.js'
import creditsRoute from './src/routes/credits.route.js'
import cartRoute from './src/routes/cart.route.js';
import orderRoute from './src/routes/order.route.js';
//#endregion

//variables
const app = express();
const port = process.env.PORT || 3000;
const cortOptions = {
    origin: true,
    credentials: true,
    accessControlAllowOrigin: true,
};

app.use(morgan('dev'));
app.use(cors(cortOptions));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/products', productsRoute);
app.use('/api/v1/profile', profileRoute);
app.use('/api/v1/upload', uploadRoute);
app.use('/api/v1/data', getDataRoute);
app.use('/api/v1/transactions', transactionRoute);
app.use('/api/v1/credits', creditsRoute);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);

app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Agromarket API'
    });
});

app.listen(port, () => {
    console.log('Server is running...');
    console.log(`Server running in http://localhost:${port}`);
});