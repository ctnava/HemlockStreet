require('dotenv').config();

const app = require("./lib/setup/all.js").initApp();
require("./lib/routes.js").routeServices(app);


// app.post("/env", (req, res) => { res.json(process.env) }); // COMMENT ME BEFORE PROD