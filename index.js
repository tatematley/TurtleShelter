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

// Route to render login.ejs for /login
app.get('/login', (req, res) => {
    res.render('login', {security}); // Ensure login.ejs is in the views folder
});

// Route to login the user based off of the login_info db
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        // Query the user table to find the record
        const user = knex('login_info')
            .select('*')
            .where({ username, password }) // Replace with hashed password comparison in production
            .first(); // Returns the first matching record
        if (user) {
            security = true;
        } else {
            security = false;
        }
    } catch (error) {
        res.status(500).send('Database query failed: ' + error.message);
    }
    res.redirect("/internalLanding")
  });

app.listen(port, () => console.log("Express is listening"));