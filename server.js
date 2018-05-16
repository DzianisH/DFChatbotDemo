'use strict';

const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const path = require("path");

require('console-stamp')(console, 'yyyy.mm.dd HH:MM:ss.l');

const REST_PORT = (process.env.PORT || 3000);

const app = express();


app.get(['/static/*', '/*'], express.static(path.join(__dirname, 'public')));
app.use(session({secret: "dummy8caT", cookie: {maxAge: 60000}, resave: true, saveUninitialized: false}));// ??
app.post('*', bodyParser.json());

require("./src/bot")(app);

app.use((err, req, res, next) => {
    console.error(err);
    res.send({error: true, desription: err.message});
});


app.listen(REST_PORT, function () {
    console.log('Bot demo is ready on port ' + REST_PORT);
});