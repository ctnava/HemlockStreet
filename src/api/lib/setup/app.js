require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const port = process.env.PORT;
const url = process.env.CLIENT_URL;
function configureApp() {
    const app = express();
    app.use(bodyParser.raw({type: 'application/octet-stream', limit:'10gb'}));
    app.use(bodyParser.json());
    app.use(cors({origin: url}));
    app.use('/uploads', express.static('uploads'));
    app.use('/downloads', express.static('downloads'));
    app.get('/', (req, res) => { res.json("Hello, welcome to my back end! Now git out.") });
    app.listen(port, () => { console.log("Server Started on Port:" + port) });
    return app;
}


module.exports = { configureApp }