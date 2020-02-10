const nextRoutes = require("next-routes");
const routes = (module.exports = nextRoutes());

routes.add("estates", "/estates/:id");
routes.add("index", "*");
