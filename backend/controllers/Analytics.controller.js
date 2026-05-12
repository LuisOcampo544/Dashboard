const {
    getOverview,
    getCategoryAnalytics,
    getAlerts
} = require("../services/Analytics.service");

module.exports.getOverview = async (req, res) => {
    const overview = await getOverview(req.user.id, req.query);
    res.status(200).json(overview);
};

module.exports.getCategoryAnalytics = async (req, res) => {
    const categories = await getCategoryAnalytics(req.user.id, req.query);
    res.status(200).json(categories);
};

module.exports.getAlerts = async (req, res) => {
    const alerts = await getAlerts(req.user.id, req.query);
    res.status(200).json(alerts);
};
