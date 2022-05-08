require('dotenv').config();

const app = require("./lib/setup/all.js").initApp();
require("./lib/routes.js").routeServices(app);