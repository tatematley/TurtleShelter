let express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 5003;

let security = false;

app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(__dirname, 'images')));



// get route for the index page
app.get('/', (req, res) =>{
    res.render('index');
});

// get route for the volunteer page
app.get('/volunteer', (req, res) =>{
    res.render('volunteer');
});

// get route for the login page
app.get('/login', (req, res) =>{
    res.render('login');
});

// get route for the events page
app.get('/events', (req, res) =>{
    res.render('events');
});

// get route for the index page
app.get('/jen', (req, res) =>{
    res.render('jen');
});

const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "turtles",
        database: process.env.RDS_DB_NAME || "turtle_shelter",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
}); 

// get route for home page
app.get('/', (req, res) =>{
    res.render('index');
});

// get route for Jen's story
app.get('/jen', (req, res) =>{
    res.render('jen');
});

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

app.get('/userManagement', (req, res) => {
    knex.select().from('users').then(myusers => {
        res.render('userManagement', {users: myusers})
    });
});

app.get('/editUser/:id', (req, res) => {
    knex.select('user_id',
                'user_first_name',
                'user_last_name',
                'user_email',
                'user_position',
                'user_start_year',
                'zip',
                'user_phone').from('users').where('user_id', req.params.id).then(myusers => {
                    res.render('editUser', {user: myusers})
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({err});
                });
});

app.post('/editUser', (req, res) => {
    knex('users').where('user_id', parseInt(req.body.user_id).update({
        user_first_name: req.body.user_first_name.toUpperCase(),
        user_last_name: req.body.user_last_name.toUpperCase(),
        user_email: req.body.user_email,
        user_phone: req.body.user_phone,
        user_position: req.body.user_position,
        user_start_year: req.body.user_start_year,
        zip: parseInt(req.body.zip)
    })).then(myusers => {
        res.redirect('/userManagement');
    });
});

app.post('/deleteUser/:id', (req, res) => {
    knex('users').where('user_id', req.body.user_id).del().then(myusers => {
        res.redirect('/userManagement')
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

app.get('/addUser', (req, res) => {
    res.render('addUser');
});

app.post('/addUser', (req, res) => {
    knex('users').insert({
        user_first_name: req.body.user_first_name.toUpperCase(),
        user_last_name: req.body.user_last_name.toUpperCase(),
        user_email: req.body.user_email,
        user_phone: req.body.user_phone,
        user_position: req.body.user_position,
        user_start_year: req.body.user_start_year,
        zip: parseInt(req.body.zip)
    })
})

app.listen(port, () => console.log("Express is listening"));