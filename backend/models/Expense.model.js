const mongoose = require("mongoose");
const ExpenseSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    note: {
        type: String,
        trim: true,
        default: null
    },
}, {
    timestamps: true
});

ExpenseSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.model("Expense", ExpenseSchema);
