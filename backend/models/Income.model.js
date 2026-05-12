const mongoose = require("mongoose");

const IncomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0.01
    },
    source: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "confirmed"
    },
    date: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        trim: true,
        default: null
    }
}, {
    timestamps: true
});

IncomeSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Income", IncomeSchema);
