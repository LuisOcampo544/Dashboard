const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
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
    normalizedName: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

CategorySchema.index({ userId: 1, normalizedName: 1 }, { unique: true });

module.exports = mongoose.model("Category", CategorySchema);
