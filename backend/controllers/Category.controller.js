const {
    listCategories,
    createCategory,
    deleteCategory
} = require("../services/Category.service");

module.exports.listCategories = async (req, res) => {
    const categories = await listCategories(req.user.id);
    res.status(200).json(categories);
};

module.exports.createCategory = async (req, res) => {
    const category = await createCategory(req.user.id, req.body);
    res.status(201).json(category);
};

module.exports.deleteCategory = async (req, res) => {
    await deleteCategory(req.user.id, req.params.id);
    res.status(204).send();
};
