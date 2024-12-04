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
    res.render('index', {security});
});

// get route for the volunteer page
app.get('/volunteer', (req, res) =>{
    res.render('volunteer', {security});
});

// get route for the login page
app.get('/login', (req, res) =>{
    res.render('login', {security});
});

// get route for the events page
app.get('/events', (req, res) =>{
    res.render('events', {security});
});

// get route for the index page
app.get('/jen', (req, res) =>{
    res.render('jen', {security});
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

// route to event management
app.get('/eventManagement', (req, res) =>{
    knex('events')
    .select()
    .orderBy('event_date', 'asc')
    .then(events => {
        res.render('eventManagement', { events, security });
    })
    .catch(error => {
        console.error('Error fetching event for editing:', error);
        res.status(500).send('Internal Server Error');
      });
    });

// delete event
app.post('/deleteEvent/:id', (req, res) => {
    const id = req.params.id;
    knex('events')
      .where('event_id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/eventManagement'); // Redirect to the Pokémon list after deletion
      })
      .catch(error => {
        console.error('Error deleting Event:', error);
        res.status(500).send('Internal Server Error');
      });
  });

  app.get('/addRequestedEvent', (req, res) => {
    res.render('addRequestedEvent', {security});
  });

  app.post('/events', (req, res) => {
    // Extract form values from req.body
    const event_name = req.body.event_name.toUpperCase() || '';
    const host_first_name = req.body.host_first_name.toUpperCase() || ''; 
    const host_last_name = req.body.host_last_name.toUpperCase() || '';
    const host_phone = req.body.host_phone || '';
    const host_email = req.body.host_email.toUpperCase() || '';// Default to empty string if not provided
    const host_zip = parseInt(req.body.host_zip); // Convert to integer
    const event_date = req.body.event_date ;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time
    const share_story = req.body.jen_story ? 'Y' : 'N'; // Checkbox returns true or undefined
    const activity_type = req.body.activity_type; // Default to 'U' for Unknown
    const volunteer_num = parseInt(req.body.volunteer_num); // Convert to integer
    const event_status = 'REQUESTED'
    // Insert the new Pokémon into the database
    knex('events')
        .insert({
            event_name: event_name,
            host_first_name: host_first_name,
            host_last_name: host_last_name,
            host_phone: host_phone,
            host_email: host_email,
            zip: host_zip,
            activity_type: activity_type,
            event_date: event_date,
            start_time: start_time,
            end_time: end_time,
            attendance_estimate: volunteer_num,
            share_story: share_story,
            event_status: event_status
        })
        .then(() => {
            res.redirect('/events'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
        })
        .catch(error => {
            console.error('Error adding :', error);
            res.status(500).send('Internal Server Error');
        });
  });

  //add requested event
  app.post('/addRequestedEvent', (req, res) => {
    // Extract form values from req.body
    const event_name = req.body.event_name.toUpperCase() || '';
    const host_first_name = req.body.host_first_name.toUpperCase() || ''; 
    const host_last_name = req.body.host_last_name.toUpperCase() || '';
    const host_phone = req.body.host_phone || '';
    const host_email = req.body.host_email.toUpperCase() || '';// Default to empty string if not provided
    const host_zip = parseInt(req.body.host_zip); // Convert to integer
    const event_date = req.body.event_date ;
    const start_time = req.body.start_time;
    const end_time = req.body.end_time
    const share_story = req.body.jen_story ? 'Y' : 'N'; // Checkbox returns true or undefined
    const activity_type = req.body.activity_type; // Default to 'U' for Unknown
    const volunteer_num = parseInt(req.body.volunteer_num); // Convert to integer
    const event_status = 'REQUESTED'
    // Insert the new Pokémon into the database
    knex('events')
        .insert({
            event_name: event_name,
            host_first_name: host_first_name,
            host_last_name: host_last_name,
            host_phone: host_phone,
            host_email: host_email,
            zip: host_zip,
            activity_type: activity_type,
            event_date: event_date,
            start_time: start_time,
            end_time: end_time,
            attendance_estimate: volunteer_num,
            share_story: share_story,
            event_status: event_status
        })
        .then(() => {
            res.redirect('/eventManagement'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
        })
        .catch(error => {
            console.error('Error adding :', error);
            res.status(500).send('Internal Server Error');
        });
  });

  //retrieve add completed event form
  app.get('/addCompletedEvent', (req, res) => {
    knex('users')
        .select('user_id',
            knex.raw(`CONCAT(user_first_name, ' ', user_last_name) as "event_lead"`)
        )
        .then(eventLead => {
    res.render('addCompletedEvent', {security, eventLead});
        })
        .catch(error => {
            console.error('Error fetching Pokémon types:', error);
            res.status(500).send('Internal Server Error');
        });
  });

  //add completed event
  app.post('/addCompletedEvent', (req, res) => {

    // Insert the new event into the database
    knex('events')
        .insert({
            event_name: req.body.event_name.toUpperCase() || '',
            host_first_name: req.body.host_first_name.toUpperCase() || '',
            host_last_name: req.body.host_last_name.toUpperCase() || '',
            host_phone: req.body.host_phone || '',
            host_email: req.body.host_email.toUpperCase() || '',
            zip: parseInt(req.body.host_zip) || 0,
            activity_type: req.body.activity_type,
            event_date: req.body.event_date ,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            attendance_estimate: parseInt(req.body.volunteer_num) || 0,
            share_story: req.body.jen_story ? 'Y' : 'N',
            event_status: 'COMPLETED',
            event_lead: parseInt(req.body.event_lead),
            actual_attendance: parseInt(req.body.actual_attendance) || 0,
            num_pockets: parseInt(req.body.num_pockets) || 0,
            num_collars: parseInt(req.body.num_collars) ||0,
            num_envelopes: parseInt(req.body.num_envelopes) || 0,
            num_vests: parseInt(req.body.num_vests) || 0,
            num_finished_products: parseInt(req.body.num_finished_products) ||0

        })
        .then(() => {
            res.redirect('/eventManagement'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
        })
        .catch(error => {
            console.error('Error adding :', error);
            res.status(500).send('Internal Server Error');
        });
  });


  // retrieve planned event form
  app.get('/addPlannedEvent', (req, res) => {
    knex('users')
        .select('user_id',
            knex.raw(`CONCAT(user_first_name, ' ', user_last_name) as "event_lead"`)
        )
        .then(eventLead => {
    res.render('addPlannedEvent', {security, eventLead});
        })
        .catch(error => {
            console.error('Error fetching event:', error);
            res.status(500).send('Internal Server Error');
        });
  });


  // add planned event
  app.post('/addPlannedEvent', (req, res) => {
    // Insert the new event into the database
    knex('events')
        .insert({
            event_name: req.body.event_name.toUpperCase() || '',
            host_first_name: req.body.host_first_name.toUpperCase() || '',
            host_last_name: req.body.host_last_name.toUpperCase() || '',
            host_phone: req.body.host_phone || '',
            host_email: req.body.host_email.toUpperCase() || '',
            zip: parseInt(req.body.host_zip) || 0,
            activity_type: req.body.activity_type,
            event_date: req.body.event_date ,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            attendance_estimate: parseInt(req.body.volunteer_num) || 0,
            share_story: req.body.jen_story ? 'Y' : 'N',
            event_status: 'PLANNED',
            event_lead: parseInt(req.body.event_lead),

        })
        .then(() => {
            res.redirect('/eventManagement'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
        })
        .catch(error => {
            console.error('Error adding :', error);
            res.status(500).send('Internal Server Error');
        });
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
        res.render('userManagement', {users: myusers, security})
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