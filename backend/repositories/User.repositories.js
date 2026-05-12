const User = require("../models/User.model");

module.exports.createUser = async (userData) => {
    return User.create(userData);
};

module.exports.findUserByEmail = async (email, options = {}) => {
    const { includePassword = false } = options;
    const query = User.findOne({ email });

    if (includePassword) {
        query.select("+password");
    }

    return query;
};

module.exports.findUserById = async (id) => {
    return User.findById(id);
};

module.exports.updateUserProfile = async (id, updateData) => {
    return User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true
    });
};

module.exports.updateUserPassword = async (id, password) => {
    const user = await User.findById(id).select("+password");

    if (!user) {
        return null;
    }

    user.password = password;
    await user.save();

    return User.findById(id);
};

module.exports.deleteUser = async (id) => {
    return User.findByIdAndDelete(id);
};
