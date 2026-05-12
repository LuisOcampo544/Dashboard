const {
    loginUser,
    registerUser,
    getUserById,
    updateUser,
    updatePassword,
    deleteUser
} = require("../services/User.service");

module.exports.register = async (req, res) => {
    const response = await registerUser(req.body);
    res.status(201).json(response);
};

module.exports.login = async (req, res) => {
    const response = await loginUser(req.body);
    res.status(200).json(response);
};

module.exports.getUser = async (req, res) => {
    const user = await getUserById(req.user.id);
    res.status(200).json(user);
};

module.exports.updateUser = async (req, res) => {
    const user = await updateUser(req.user.id, req.body);
    res.status(200).json(user);
};

module.exports.updatePassword = async (req, res) => {
    const response = await updatePassword(req.user.id, req.body);
    res.status(200).json(response);
};

module.exports.deleteUser = async (req, res) => {
    await deleteUser(req.user.id);
    res.status(204).send();
};
