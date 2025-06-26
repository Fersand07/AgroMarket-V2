import mongoose from "mongoose";
const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const orderSchema = new Schema(
    {
        buyer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        seller: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        items: [orderItemSchema],
        eta: {
            type: String // e.g., "30 min"
        },
        route: {
            type: Object // stores the geojson from OpenRoute API
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "cancelled"],
            default: "pending"
        }
    },
    { timestamps: true }
);

export const Order = model("Order", orderSchema);