const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        select: false
    },
    currency: {
        type: String,
        default: "USD",
        uppercase: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});


UserSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
});

module.exports = mongoose.model("User", UserSchema);
