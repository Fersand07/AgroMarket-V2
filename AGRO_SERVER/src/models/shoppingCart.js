import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const shoppingCartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }]
}, {
    timestamps: true
});
export const ShoppingCart = model('ShoppingCart', shoppingCartSchema);