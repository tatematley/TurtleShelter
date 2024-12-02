let express = require("express");

let app = express();

let path = require("path");

const port = 5002;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'images')));

const knex = require("knex")({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        password: "turtles",
        database: "turtle_shelter",
        port: 5003
    }
});


app.listen(port, () => console.log("Express is listening"));