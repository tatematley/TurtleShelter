let express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 5003;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) =>{
    res.render('index');
});

/* const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "turtles",
        database: process.env.RDS_DB_NAME || "turtle_shelter",
        port: process.env.DB_SSL || 5003
    }
}); */


app.listen(port, () => console.log("Express is listening"));