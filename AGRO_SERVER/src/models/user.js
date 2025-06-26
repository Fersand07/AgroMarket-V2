import bcrypt from 'bcryptjs';
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        index: { unique: true }
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    address: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    lng: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: "user"
    },
    credit: {
        type: Number,
        default: 0.0

    },
    image: {
        type: String,
        default: "https://res.cloudinary.com/agromarket/image/upload/v1669659305/Avatars/profile-sample.png"
    },
    location: {
        type: { type: String, default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }
    }
});

userSchema.pre('save', async function (next) {

    if (!this.isModified('password')) {
        next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(this.password, salt);
        this.password = passwordHash;
        next();
    }
    catch (error) {
        next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password
    );
}

userSchema.index({ location: "2dsphere" });


export const User = model("User", userSchema);