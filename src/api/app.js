require('dotenv').config();

const app = require("./lib/setup/all.js").initApp();
require("./lib/routes.js").routeServices(app);


app.get("/", (req, res)=>{res.json("Welcome to my backend! Now git out.")})