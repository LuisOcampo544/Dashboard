const mongoose = require("mongoose");

const CategoryBudgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    budgetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Budget",
        required: true,
        index: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    limitAmount: {
        type: Number,
        required: true,
        min: 0.01
    },
    alertThreshold: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.8
    }
}, {
    timestamps: true
});

CategoryBudgetSchema.index({ userId: 1, budgetId: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("CategoryBudget", CategoryBudgetSchema);
