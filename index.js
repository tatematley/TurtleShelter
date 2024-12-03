let express = require("express");

let app = express();

let path = require("path");

const port = process.env.PORT || 5005;

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
        password: process.env.RDS_PASSWORD || "izzy1213",
        database: process.env.RDS_DB_NAME || "turtle_shelter",
        port: process.env.RDS_PORT || 5433,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    }
}); 
const requested = 'REQUESTED'
const planned = 'PLANNED'
const completed = 'COMPLETED'

// route to event management
app.get('/eventManagement', (req, res) =>{
    knex('events')
    .select(
        'event_id',
        'event_name',
        'host_first_name',
        'host_last_name',
        'host_phone',
        'host_email',
        'zip',
        'attendance_estimate',
        'event_status',
        'activity_type',
        'event_date',
        'start_time',
        'end_time',
        'share_story',
        'event_lead',
    )
    .where('event_status', requested)
    .orderBy('event_date', 'desc')
    .then(requestedEvents => {
        res.render('eventManagement', {requestedEvents})
    })
    .catch(error => {
        console.error('Error fetching Pokémon for editing:', error);
        res.status(500).send('Internal Server Error');
      });
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
    res.redirect("/volunteerManagement")
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

// get method for logging out
app.get('/logout', (req, res) => {
    security = false;
    res.render("index", {security})
  });



// get route to view all volunteers
app.get('/volunteerManagement', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = 15; // Show 15 volunteers per page
        const offset = (page - 1) * limit; // Calculate offset for the database query

        // Fetch the total number of volunteer for pagination
        const totalVolunteer = await knex("volunteers").count('* as count').first();
        const totalPages = Math.ceil(totalVolunteer.count / limit);

        // Fetch the volunteers for the current page
        const volunteer = await knex("volunteers")
            .select(
                "volunteer_id",
                "volunteer_first_name",
                "volunteer_last_name",
                "volunteer_age",
                "volunteer_phone",
                "volunteer_email",
                "zip",
                "sewing_level",
                "num_monthly_hours",
                "num_volunteers"
            )
            .limit(limit)
            .offset(offset);

        // Render the page
        res.render('volunteerManagement', { volunteer, currentPage: page, totalPages, page: 'Volunteer', security });
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data.");
    }
});


// get route for the /editVolunteer action
app.get('/editVolunteer/:id', (req, res) => {
    let id = req.params.id;
    // Query the Volunteer by ID first
    knex('volunteers')
      .where('volunteer_id', id)
      .first()
      .then(volunteerRec => {
        if (!volunteerRec) {
          return res.status(404).send('volunteer not found');
        }
        res.render('editVolunteer', { volunteerRec });
    })
        .catch(error => {
        console.error('Error fetching the individual volunteer for editing:', error);
        res.status(500).send('Internal Server Error, Error fetching the individual volunteer for editing');
      });
  });




// post route to edit volunteer
app.post("/editVolunteer/:id", (req,res) =>{
    const id = req.params.id;
    knex("volunteers").where("volunteer_id", id).update({
        volunteer_first_name: req.body.volunteer_first_name,
        volunteer_last_name: req.body.volunteer_last_name,
        volunteer_age: req.body.volunteer_age,
        volunteer_phone: req.body.volunteer_phone,
        volunteer_email: req.body.volunteer_email,
        zip: req.body.zip,
        sewing_level: req.body.sewing_level,
        num_monthly_hours: req.body.num_monthly_hours,
        num_volunteers: req.body.num_volunteers
    }).then(myvolunteer => {
        res.redirect("/volunteerManagement");
    }) .catch(error => {
        console.error('Error fetching the individual volunteer for editing:', error);
        res.status(500).send('Internal Server Error, Error fetching the individual volunteer for editing');
      });
  

});




// get route to return back to home page
app.get("/returnHome/", (req,res) =>{
    res.render("index");
});


// get route to add volunteer
app.get("/addVolunteer/", (req,res) =>{
    res.render("addVolunteer");
});


// post route to add volunteer
app.post("/addVolunteer", (req,res) => {
    knex("volunteer").insert({
        volunteer_first_name: req.body.volunteer_first_name,
        volunteer_last_name: req.body.volunteer_last_name,
        volunteer_age: req.body.volunteer_age,
        volunteer_phone: req.body.volunteer_phone,
        volunteer_email: req.body.volunteer_email,
        zip: req.body.zip,
        sewing_level: req.body.sewing_level,
        num_monthly_hours: req.body.num_monthly_hours,
        num_volunteers: req.body.num_volunteers
    }).then(myvolunteer => {
        res.redirect("/volunteerManagement");
    });
});


// post route to delete volunteer
app.post("/deleteVolunteer/:id", (req,res) => {
    knex("volunteer”).where(“volunteer_id", req.params.id).del().then(volunteer =>{
        res.redirect("/volunteerManagement");
    }).catch(err => {
        console.log(err)
        res.status(500).json({err});
    });
});


app.listen(port, () => console.log("Express is listening"));