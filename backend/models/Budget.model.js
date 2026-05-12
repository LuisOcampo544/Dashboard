const mongoose = require("mongoose");

const BudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["draft", "active", "archived"],
        default: "active"
    },
    currency: {
        type: String,
        required: true,
        default: "USD",
        uppercase: true,
        trim: true
    },
    expenseToIncomeAlertThreshold: {
        type: Number,
        default: 1,
        min: 0,
        max: 1
    }
}, {
    timestamps: true
});

BudgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("Budget", BudgetSchema);
