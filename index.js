// set up the app and install libraries
let express = require("express");
let app = express();
let path = require("path");
const port = process.env.PORT || 5004;
let security = false;
let hiddenSubmit = "";
let hiddenView = "hidden"
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'images')));

// connection to RDS || Local DB
const knex = require("knex")({
    client: "pg",
    connection: {
        host: process.env.RDS_HOSTNAME || "localhost",
        user: process.env.RDS_USERNAME || "postgres",
        password: process.env.RDS_PASSWORD || "SuperUser",
        database: process.env.RDS_DB_NAME || "turtle_shelter",
        port: process.env.RDS_PORT || 5432,
        ssl: process.env.DB_SSL ? {rejectUnauthorized: false} : false
    },
    pool: {
        min:2,
        max:62,
    },
});

(async () => {
    try {
        const result = await knex.raw('SELECT 1+1 AS result'); // Simple query to test connection
        console.log("Database connected successfully:", result.rows);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
})();

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

// get route for the submission page
app.get('/submission', (req, res) =>{
    res.render('submission', {security});
});

// get route for the index page
app.get('/jen', (req, res) =>{
    res.render('jen', {security});
});

// get route for the dashboard page
app.get('/dashboard', (req, res) =>{
    res.render('dashboard', {security});
});

// route to get event management page and data
app.get('/eventManagement', (req, res) =>{
    let hiddenSubmit = "hidden";
    let hiddenView = ""
    knex('events')
    .leftJoin('users', 'events.event_lead', '=', 'users.user_id')
    .select()
    .orderBy('event_date', 'asc')
    .then(events => {
        res.render('eventManagement', { events, security, hiddenSubmit, hiddenView });
    })
    .catch(error => {
        console.error('Error fetching event for editing:', error);
        res.status(500).send('Internal Server Error');
      });
    });

// route to delete event
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

// get route for the requested event
app.get('/addRequestedEvent', (req, res) => {
res.render('addRequestedEvent', {security});
});

// post route to send event request to the DB
app.post('/event', (req, res) => {
// Extract form values from req.body
const event_name = req.body.event_name.toUpperCase() || '';
const host_first_name = req.body.host_first_name.toUpperCase() || ''; 
const host_last_name = req.body.host_last_name.toUpperCase() || '';
const host_phone = req.body.host_phone || '';
const host_email = req.body.host_email.toUpperCase() || '';// Default to empty string if not provided
const event_date = req.body.event_date ;
const start_time = req.body.start_time;
const end_time = req.body.end_time
const share_story = req.body.jen_story ? 'Y' : 'N'; // Checkbox returns true or undefine
const activity_type = req.body.activity_type.toUpperCase() || ''; 
const volunteer_num = parseInt(req.body.volunteer_num); // Convert to integer
const event_status = 'REQUESTED'
const host_county = req.body.host_county.toUpperCase() || '';
const host_state = req.body.host_state || '';
const host_address = req.body.host_address.toUpperCase() || '';
const host_city = req.body.host_city.toUpperCase() || '';
const date_created = new Date().toISOString().split('T')[0];
const num_sewers = parseInt(req.body.num_sewers);
const num_host_machines = parseInt(req.body.num_host_machines);
const num_tsp_machine = 0;
const notes = req.body.notes.toUpperCase() || '';
const event_source = req.body.event_source.toUpperCase() || '';
// Insert the new Pokémon into the database
knex('events')
    .insert({
        event_name: event_name,
        host_first_name: host_first_name,
        host_last_name: host_last_name,
        host_phone: host_phone,
        host_email: host_email,
        activity_type: activity_type,
        event_date: event_date,
        start_time: start_time,
        end_time: end_time,
        attendance_estimate: volunteer_num,
        share_story: share_story,
        event_status: event_status,
        date_created: date_created,
        host_county : host_county,
        host_state: host_state,
        host_address : host_address,
        host_city : host_city,
        num_sewers: num_sewers,
        num_host_machines: num_host_machines,
        num_tsp_machine: num_tsp_machine,
        notes: notes,
        event_source: event_source
    })
    .then(() => {
        res.redirect('/submission'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
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
const event_date = req.body.event_date ;
const start_time = req.body.start_time;
const end_time = req.body.end_time
const share_story = req.body.jen_story ? 'Y' : 'N'; // Checkbox returns true or undefined
const activity_type = req.body.activity_type; // Default to 'U' for Unknown
const volunteer_num = parseInt(req.body.volunteer_num); // Convert to integer
const event_status = 'REQUESTED'
const host_county = req.body.host_county.toUpperCase() || '';
const host_state = req.body.host_state || '';
const host_address = req.body.host_address.toUpperCase() || '';
const host_city = req.body.host_city.toUpperCase() || '';
const date_created = new Date().toISOString().split('T')[0];
const num_sewers = parseInt(req.body.num_sewers);
const num_host_machines = parseInt(req.body.num_host_machines);
const num_tsp_machine = 0;
const notes = req.body.notes.toUpperCase() || '';
const event_source = req.body.event_source.toUpperCase() || '';
// Insert the new Pokémon into the database
knex('events')
    .insert({
        event_name: event_name,
        host_first_name: host_first_name,
        host_last_name: host_last_name,
        host_phone: host_phone,
        host_email: host_email,
        activity_type: activity_type,
        event_date: event_date,
        start_time: start_time,
        end_time: end_time,
        attendance_estimate: volunteer_num,
        share_story: share_story,
        event_status: event_status,
        date_created: date_created,
        host_county : host_county,
        host_state: host_state,
        host_address : host_address,
        host_city : host_city,
        num_sewers: num_sewers,
        num_host_machines: num_host_machines,
        num_tsp_machine: num_tsp_machine,
        notes: notes,
        event_source: event_source
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
        activity_type: req.body.activity_type,
        event_date: req.body.event_date ,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        attendance_estimate: parseInt(req.body.volunteer_num) || 0,
        share_story: req.body.jen_story ? 'Y' : 'N',
        event_status: 'COMPLETED',
        event_lead: parseInt(req.body.event_lead),
        actual_attendance: parseInt(req.body.actual_attendance) || 0,
        duration_hours: parseInt(req.body.duration_hours) || 0,
        num_pockets: parseInt(req.body.num_pockets) || 0,
        num_collars: parseInt(req.body.num_collars) ||0,
        num_envelopes: parseInt(req.body.num_envelopes) || 0,
        num_vests: parseInt(req.body.num_vests) || 0,
        num_finished_products: parseInt(req.body.num_finished_products) ||0,
        host_county : req.body.host_county.toUpperCase() || '',
        host_state : req.body.host_state || '',
        host_address : req.body.host_address.toUpperCase() || '',
        host_city : req.body.host_city.toUpperCase() || '',
        date_created : new Date().toISOString().split('T')[0],
        notes : req.body.notes.toUpperCase() || '',
        event_source : req.body.event_source.toUpperCase() || ''
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
        activity_type: req.body.activity_type,
        event_date: req.body.event_date ,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        attendance_estimate: parseInt(req.body.volunteer_num) || 0,
        share_story: req.body.jen_story ? 'Y' : 'N',
        event_status: 'PLANNED',
        event_lead: parseInt(req.body.event_lead),
        host_county : req.body.host_county.toUpperCase() || '',
        host_state : req.body.host_state || '',
        host_address : req.body.host_address.toUpperCase() || '',
        host_city : req.body.host_city.toUpperCase() || '',
        date_created : new Date().toISOString().split('T')[0],
        num_sewers : parseInt(req.body.num_sewers) || 0,
        num_host_machines : parseInt(req.body.num_host_machines) || 0,
        num_tsp_machine : parseInt(req.body.num_tsp_machine) || 0,
        notes : req.body.notes.toUpperCase() || '',
        event_source : req.body.event_source.toUpperCase() || 0
    })
    .then(() => {
        res.redirect('/eventManagement'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
    })
    .catch(error => {
        console.error('Error adding :', error);
        res.status(500).send('Internal Server Error');
    });
});

//get route to view completed events
app.get('/viewCompletedEvent/:id', (req, res) => { // /:id means parameter that was passed into a value called id (id could be anything)
    let id = req.params.id; //extracts parameter data out of the route
    // Query the Pokémon by ID first
    knex('events') 
      .join('users', 'events.event_lead', '=', 'users.user_id')
      .where('event_id', id) // where id is equal to the parameter
      .first() //returns the first element, aka no longer an array, a single object
      .then(events => { // send to pokemon, the following knex is embedded 
            // Render the edit form and pass both pokemon and poke_types
            res.render('viewCompletedEvent', { events, security }); // returns the first record pokemon, and all poke_types
          })
          .catch(error => {
            console.error('Error fetching Events:', error);
            res.status(500).send('Internal Server Error');
          });
      });
app.get('/viewPlannedEvent/:id', (req, res) => { // /:id means parameter that was passed into a value called id (id could be anything)
    let id = req.params.id; //extracts parameter data out of the route
    // Query the Pokémon by ID first
    knex('events') 
    .join('users', 'events.event_lead', '=', 'users.user_id')
    .where('event_id', id) // where id is equal to the parameter
    .first() //returns the first element, aka no longer an array, a single object
    .then(events => { // send to pokemon, the following knex is embedded 
        // Render the edit form and pass both pokemon and poke_types
        res.render('viewPlannedEvent', { events, security }); // returns the first record pokemon, and all poke_types
        })
        .catch(error => {
        console.error('Error fetching Events:', error);
        res.status(500).send('Internal Server Error');
        });
    });
app.get('/viewRequestedEvent/:id', (req, res) => { // /:id means parameter that was passed into a value called id (id could be anything)
    let id = req.params.id; //extracts parameter data out of the route
    // Query the Pokémon by ID first
    knex('events') 
        .where('event_id', id) // where id is equal to the parameter
        .first() //returns the first element, aka no longer an array, a single object
        .then(events => { // send to pokemon, the following knex is embedded 
            // Render the edit form and pass both pokemon and poke_types
            res.render('viewRequestedEvent', { events, security }); // returns the first record pokemon, and all poke_types
            })
            .catch(error => {
            console.error('Error fetching Events:', error);
            res.status(500).send('Internal Server Error');
            });
        });

// confirm event
app.get('/confirmEvent/:id', (req, res) => {
    let id = req.params.id;
    knex('events')
    .select()
        .where('event_id', id)
        .first()
        .then(eventName => {if (!eventName) {
        return res.status(404).send('event not found');
        } 
        knex('users')
        .select('user_id',
            knex.raw(`CONCAT(user_first_name, ' ', user_last_name) as "event_lead"`)
        )
        .then(eventLead => {
    res.render('confirmEvent', {security, eventName, eventLead});
        })
        .catch(error => {
            console.error('Error fetching event:', error);
            res.status(500).send('Internal Server Error');
        });
  });
});
// add confirmed event info
app.post('/confirmEvent/:id', (req,res) => {
    let id = req.params.id
    knex('events')
    .where('event_id', id)
    .update({
        event_status: 'PLANNED',
        event_lead: parseInt(req.body.event_lead)
    })
    .then(() => {
        res.redirect('/eventManagement'); // Redirect to the Pokémon list page after adding, aka it goes back to the app.get route that you created
    })
    .catch(error => {
        console.error('Error adding :', error);
        res.status(500).send('Internal Server Error');
    });
});

//get route for completeEvent
app.get('/completeEvent/:id', (req, res) => {
    let id = req.params.id;
    knex('events')
    .select()
      .where('event_id', id)
      .first()
      .then(eventName => {
    res.render('completeEvent', {security, eventName});
        })
        .catch(error => {
            console.error('Error fetching event:', error);
            res.status(500).send('Internal Server Error');
        });
  });
//post route to update to completed event
app.post('/completeEvent/:id', (req,res) => {
    let id = req.params.id
    knex('events')
    .where('event_id', id)
    .update({
        event_status: 'COMPLETED',
        actual_attendance: parseInt(req.body.actual_attendance) || 0,
        duration_hours: parseInt(req.body.duration_hours) || 0,
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

// get route to edit completed event
app.get('/editCompletedEvent/:id', (req, res) => { // /:id means parameter that was passed into a value called id (id could be anything)
    let id = req.params.id; //extracts parameter data out of the route
    // Query the Pokémon by ID first
    knex('events') 
      .where('event_id', id) // where id is equal to the parameter
      .first() //returns the first element, aka no longer an array, a single object
      .then(eventName => { // send to pokemon, the following knex is embedded 
        if (!eventName) {
          return res.status(404).send('Event not found');
        }
        // Query all Pokémon types after fetching the Pokémon
        knex('users')
          .select(
            'user_id', 
            knex.raw(`CONCAT(user_first_name, ' ', user_last_name) as event_lead`))
          .then(eventLead => {
            // Render the edit form and pass both pokemon and poke_types
            res.render('editCompletedEvent', { eventName, eventLead, security }); // returns the first record pokemon, and all poke_types
          })
          .catch(error => {
            console.error('Error fetching user types:', error);
            res.status(500).send('Internal Server Error');
          });
        })
      .catch(error => {
        console.error('Error fetching event for editing:', error);
        res.status(500).send('Internal Server Error');
        });
    });
  
// get route to edit planned event
app.get('/editPlannedEvent/:id', (req, res) => { // /:id means parameter that was passed into a value called id (id could be anything)
    let id = req.params.id; //extracts parameter data out of the route
    // Query the Pokémon by ID first
    knex('events') 
      .where('event_id', id) // where id is equal to the parameter
      .first() //returns the first element, aka no longer an array, a single object
      .then(eventName => { // send to pokemon, the following knex is embedded 
        if (!eventName) {
          return res.status(404).send('Event not found');
        }
        // Query all Pokémon types after fetching the Pokémon
        knex('users')
          .select(
            'user_id', 
            knex.raw(`CONCAT(user_first_name, ' ', user_last_name) as event_lead`))
          .then(eventLead => {
            // Render the edit form and pass both pokemon and poke_types
            res.render('editPlannedEvent', { eventName, eventLead, security }); // returns the first record pokemon, and all poke_types
          })
          .catch(error => {
            console.error('Error fetching user types:', error);
            res.status(500).send('Internal Server Error');
          });
      })
      .catch(error => {
        console.error('Error fetching event for editing:', error);
        res.status(500).send('Internal Server Error');
      });
});

// get route to edit the database
app.get('/editRequestedEvent/:id', (req, res) => { // /:id means parameter that was passed into a value called id (id could be anything)
    let id = req.params.id; //extracts parameter data out of the route
    // Query the Pokémon by ID first
    knex('events') 
      .where('event_id', id) // where id is equal to the parameter
      .first() //returns the first element, aka no longer an array, a single object
      .then(eventName => { // send to pokemon, the following knex is embedded 
            // Render the edit form and pass both pokemon and poke_types
            res.render('editRequestedEvent', { eventName, security }); // returns the first record pokemon, and all poke_types
      })
      .catch(error => {
        console.error('Error fetching event for editing:', error);
        res.status(500).send('Internal Server Error');
      });
});

// post rout to edit the completed event
app.post('/editCompletedEvent/:id', (req, res) => {
    const id = req.params.id;
    // Access each value directly from req.body
    knex('events')
      .where('event_id', id)
      .update({
        event_name: req.body.event_name.toUpperCase() || '',
        host_first_name: req.body.host_first_name.toUpperCase() || '',
        host_last_name: req.body.host_last_name.toUpperCase() || '',
        host_phone: req.body.host_phone || '',
        host_email: req.body.host_email.toUpperCase() || '',
        activity_type: req.body.activity_type,
        event_date: req.body.event_date ,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        attendance_estimate: parseInt(req.body.volunteer_num) || 0,
        share_story: req.body.jen_story ? 'Y' : 'N',
        event_status: 'COMPLETED',
        event_lead: parseInt(req.body.event_lead),
        actual_attendance: parseInt(req.body.actual_attendance) || 0,
        duration_hours: parseInt(req.body.duration_hours) || 0,
        num_pockets: parseInt(req.body.num_pockets) || 0,
        num_collars: parseInt(req.body.num_collars) ||0,
        num_envelopes: parseInt(req.body.num_envelopes) || 0,
        num_vests: parseInt(req.body.num_vests) || 0,
        num_finished_products: parseInt(req.body.num_finished_products) ||0,
        host_county : req.body.host_county.toUpperCase() || '',
        host_state : req.body.host_state || '',
        host_address : req.body.host_address.toUpperCase() || '',
        host_city : req.body.host_city.toUpperCase() || '',
        date_created : new Date().toISOString().split('T')[0],
        notes : req.body.notes.toUpperCase() || '',
        event_source : req.body.event_source.toUpperCase() || ''
      })
      .then(() => {
        res.redirect('/eventManagement'); // Redirect to the list of Pokémon after saving
      })
      .catch(error => {
        console.error('Error updating event:', error);
        res.status(500).send('Internal Server Error');
      });
  });

// post route to edit the planned event
app.post('/editPlannedEvent/:id', (req, res) => {
    const id = req.params.id;
    // Access each value directly from req.body
    knex('events')
      .where('event_id', id)
      .update({
        event_name: req.body.event_name.toUpperCase() || '',
        host_first_name: req.body.host_first_name.toUpperCase() || '',
        host_last_name: req.body.host_last_name.toUpperCase() || '',
        host_phone: req.body.host_phone || '',
        host_email: req.body.host_email.toUpperCase() || '',
        activity_type: req.body.activity_type,
        event_date: req.body.event_date ,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        attendance_estimate: parseInt(req.body.volunteer_num) || 0,
        share_story: req.body.jen_story ? 'Y' : 'N',
        event_status: "PLANNED",
        event_lead: parseInt(req.body.event_lead),
        host_county : req.body.host_county.toUpperCase() || '',
        host_state : req.body.host_state || '',
        host_address : req.body.host_address.toUpperCase() || '',
        host_city : req.body.host_city.toUpperCase() || '',
        date_created : new Date().toISOString().split('T')[0],
        num_sewers : parseInt(req.body.num_sewers) || 0,
        num_host_machines : parseInt(req.body.num_host_machines) || 0,
        num_tsp_machine : parseInt(req.body.num_tsp_machine) || 0,
        notes : req.body.notes.toUpperCase() || '',
        event_source : req.body.event_source.toUpperCase() || 0
      })
      .then(() => {
        res.redirect('/eventManagement'); // Redirect to the list of Pokémon after saving
      })
      .catch(error => {
        console.error('Error updating event:', error);
        res.status(500).send('Internal Server Error');
      });
  });

// post route to edit requested events
app.post('/editRequestedEvent/:id', (req, res) => {
    const id = req.params.id;
    
    // Access each value directly from req.body
    knex('events')
      .where('event_id', id)
      .update({
        event_name: req.body.event_name.toUpperCase() || '',
        host_first_name: req.body.host_first_name.toUpperCase() || '',
        host_last_name: req.body.host_last_name.toUpperCase() || '',
        host_phone: req.body.host_phone || '',
        host_email: req.body.host_email.toUpperCase() || '',
        activity_type: req.body.activity_type,
        event_date: req.body.event_date ,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        attendance_estimate: parseInt(req.body.volunteer_num) || 0,
        share_story: req.body.jen_story ? 'Y' : 'N',
        event_status: "REQUESTED",
        host_county : req.body.host_county.toUpperCase() || '',
        host_state : req.body.host_state || '',
        host_address : req.body.host_address.toUpperCase() || '',
        host_city : req.body.host_city.toUpperCase() || '',
        date_created : new Date().toISOString().split('T')[0],
        num_sewers : parseInt(req.body.num_sewers) || 0,
        num_host_machines : parseInt(req.body.num_host_machines) || 0,
        num_tsp_machine : parseInt(req.body.num_tsp_machine) || 0,
        notes : req.body.notes.toUpperCase() || '',
        event_source : req.body.event_source.toUpperCase() || 0
      })
      .then(() => {
        res.redirect('/eventManagement', ); // Redirect to the event management
      })
      .catch(error => {
        console.error('Error updating event:', error);
        res.status(500).send('Internal Server Error');
      });
  });

// Route to login the user based off of the login_info db
app.post('/login', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    try {
        // Query the user table to find the record
        const user = await knex('login_info')
            .select('*')
            .where({ username, password }) // Replace with hashed password comparison in production
            .first(); // Returns the first matching record

        if (user) {
            security = true;
        } else {
            security = false;
        }

        res.redirect("/volunteerManagement");
    } catch (error) {
        res.status(500).send('Database query failed: ' + error.message);
    }
});

// get route for user management 
app.get('/userManagement', (req, res) => {
    let hiddenSubmit = "hidden";
    let hiddenView = ""
    knex.select().from('users').join('login_info', 'users.user_id', '=', 'login_info.user_id').then(myusers => {
        res.render('userManagement', {users: myusers, security, hiddenSubmit, hiddenView})
    });
});

// get method for logging out
app.get('/logout', (req, res) => {
    security = false;
    res.render("index", {security})
  });

// get route to edit user
app.get('/editUser/:id', (req, res) => {
    knex('users')
    .join('login_info', 'users.user_id', '=', 'login_info.user_id')
    .select('users.user_id',
                'users.user_first_name',
                'users.user_last_name',
                'users.user_email',
                'users.user_position',
                'users.user_start_year',
                'users.user_county',
                'users.user_state',
                'users.user_phone',
                'login_info.username',
                'login_info.password')
                
                .where('users.user_id', req.params.id)
                .first().then(myusers => {
                    res.render('editUser', {user: myusers, security})
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({err});
                });
});

// podt route for edit user
app.post('/editUser/:id', async (req, res) => {
    const trx = await knex.transaction(); // Start a transaction
    try {
        const userId = req.params.id; // Get the user_id from the URL parameters

        // Validate and format input
        const userState = (req.body.user_state || '').toUpperCase();
        if (userState.length > 2) {
            throw new Error('State abbreviation must be 2 characters');
        }

        const userData = {
            user_first_name: req.body.user_first_name.toUpperCase() || '', 
            user_last_name: req.body.user_last_name.toUpperCase() || '', 
            user_email: req.body.user_email.toUpperCase() || '', 
            user_phone: req.body.user_phone || '', 
            user_position: req.body.user_position, 
            user_start_year: req.body.user_start_year, 
            user_county: req.body.user_county.toUpperCase() || '',  
            user_state: req.body.user_state // Ensure it's a valid abbreviation
        };

        // Update the user data in the `users` table
        const updatedUser = await trx('users')
            .where('user_id', userId)
            .update(userData);

        if (!updatedUser) {
            throw new Error(`User with ID ${userId} not found`);
        }

        // Prepare login information data
        const loginData = {
            username: req.body.username || '',
            password: req.body.password || '' // Directly use the plain-text password
        };

        // Update login information in the `login_info` table
        const updatedLogin = await trx('login_info')
            .where('user_id', userId)
            .update(loginData);

        if (!updatedLogin) {
            // Optional: Handle cases where no login_info exists for this user
            console.warn(`No login_info found for user ID ${userId}.`);
        }

        // Commit the transaction if everything goes well
        await trx.commit();

        // Redirect after successful operation
        res.redirect('/userManagement');
    } catch (error) {
        // Rollback the transaction if an error occurs
        await trx.rollback();
        console.error('Error updating user:', error);
        res.status(400).send('Invalid input or internal server error');
    }
});



// post route to delete user
app.post('/deleteUser/:id', async (req, res) => {
    const userId = req.params.id; // Using the ID from the route parameter

    try {
        await knex.transaction(async trx => {
            // Delete related records in login_info first
            await trx('login_info').where('user_id', userId).del();

            // Then delete the user record
            await trx('users').where('user_id', userId).del();
        });

        // Redirect after successful deletion
        res.redirect('/userManagement');
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// get route to add user
app.get('/addUser', (req, res) => {
    res.render('addUser', {security});
});

// post route to add user
app.post('/addUser', async (req, res) => {
    const trx = await knex.transaction(); // Start a transaction
    try {
        // Validate and format input
        const userState = (req.body.user_state || '').toUpperCase();
        if (userState.length > 2) {
            throw new Error('State abbreviation must be 2 characters');
        }
        const userData = {
            user_first_name: req.body.user_first_name.toUpperCase() || '', 
            user_last_name: req.body.user_last_name.toUpperCase() || '', 
            user_email: req.body.user_email.toUpperCase() || '', 
            user_phone: req.body.user_phone || '', 
            user_position: req.body.user_position, 
            user_start_year: req.body.user_start_year, 
            user_county: req.body.user_county.toUpperCase() || '',  
            user_state: req.body.user_state // Ensure it's a valid abbreviation
        };
        
        // Insert the user data and retrieve the user_id inside the transaction
        const [insertedUser] = await trx('users').insert(userData).returning('user_id');
        const userId = insertedUser.user_id; // Extract the user_id integer

        if (!userId) {
            throw new Error('User ID not generated');
        }

        // Insert login information inside the same transaction
        const loginData = {
            user_id: userId, // Use the extracted integer user_id
            username: req.body.username || '',
            password: req.body.password || '' // Directly use the plain-text password
        };

        await trx('login_info').insert(loginData);

        // Commit the transaction if everything goes well
        await trx.commit();

        // Redirect after successful operation
        res.redirect('/userManagement');
    } catch (error) {
        // Rollback the transaction if an error occurs
        await trx.rollback();
        console.error('Error adding user:', error);
        res.status(400).send('Invalid input or internal server error');
    }
});


// get method for logging out
app.get('/logout', (req, res) => {
    security = false;
    res.render("index", {security})
  });

// get route to view all volunteers
app.get('/volunteerManagement', async (req, res) => {
    try {
       
        let hiddenSubmit = "hidden";
        let hiddenView = ""
        // Fetch the volunteers for the current page
        const volunteer = await knex("volunteers")
            .select(
                "volunteer_id",
                "volunteer_first_name",
                "volunteer_last_name",
                "volunteer_age",
                "volunteer_phone",
                "volunteer_email",
                "sewing_level",
                "num_monthly_hours",
                "date_created",
                "volunteer_source",
                "volunteer_county",
                "volunteer_state",
                "notes"
            )
          
        // Render the page
        res.render('volunteerManagement', { volunteer, page: 'Volunteer', security, hiddenView, hiddenSubmit });
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
        res.render('editVolunteer', { volunteerRec , security});
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
        volunteer_first_name: req.body.volunteer_first_name.toUpperCase(),
        volunteer_last_name: req.body.volunteer_last_name.toUpperCase(),
        volunteer_age: parseInt(req.body.volunteer_age),
        volunteer_phone: req.body.volunteer_phone,
        volunteer_email: req.body.volunteer_email,
        sewing_level: req.body.sewing_level,
        num_monthly_hours: parseInt(req.body.num_monthly_hours),
        volunteer_source: req.body.volunteer_source.toUpperCase(),
        volunteer_county: req.body.volunteer_county.toUpperCase(),
        notes: req.body.notes
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
    res.render("addVolunteer", {security: security});
});

// post route to add volunteer
app.post("/addVolunteer", (req,res) => {
    knex("volunteers").insert({
        volunteer_first_name: req.body.volunteer_first_name.toUpperCase(),
        volunteer_last_name: req.body.volunteer_last_name.toUpperCase(),
        volunteer_age: parseInt(req.body.volunteer_age),
        volunteer_phone: req.body.volunteer_phone,
        volunteer_email: req.body.volunteer_email,
        sewing_level: req.body.sewing_level,
        num_monthly_hours: parseInt(req.body.num_monthly_hours),
        volunteer_source: req.body.volunteer_source.toUpperCase(),
        volunteer_county: req.body.volunteer_county.toUpperCase(),
        notes: req.body.notes
    }).then(myvolunteer => {
        res.redirect("/volunteerManagement");
    });
});

// post route to add volunteer from the form 
app.post("/volunteer", (req,res) => {
    knex("volunteers").insert({
        volunteer_first_name: req.body.volunteer_first_name.toUpperCase(),
        volunteer_last_name: req.body.volunteer_last_name.toUpperCase(),
        volunteer_age: parseInt(req.body.volunteer_age),
        volunteer_phone: req.body.volunteer_phone,
        volunteer_email: req.body.volunteer_email,
        sewing_level: req.body.sewing_level,
        num_monthly_hours: parseInt(req.body.num_monthly_hours),
        volunteer_source: req.body.volunteer_source.toUpperCase(),
        volunteer_county: req.body.volunteer_county.toUpperCase(),
        volunteer_state: req.body.volunteer_state,
        notes: req.body.notes
        

    }).then(myvolunteer => {
        res.redirect("/submission");
    });
});

// post route to delete volunteer
app.post('/deleteVolunteer/:id', (req, res) => {
    const id = req.params.id;
    knex('volunteers')
      .where('volunteer_id', id)
      .del() // Deletes the record with the specified ID
      .then(() => {
        res.redirect('/volunteerManagement'); // Redirect to the Pokémon list after deletion
      })
      .catch(error => {
        console.error('Error deleting Volunteer:', error);
        res.status(500).send('Internal Server Error');
      });
  });

// get vest distribution route
app.get("/vestDistribution", (req, res) => {
    let hiddenSubmit = "hidden";
    let hiddenView = ""
    knex.select().from('vest_distribution').then(myvests => {
        res.render('vestDistribution', {vest: myvests, security, hiddenSubmit, hiddenView});
    });
});

// get distribute vests route
app.get("/distributeVest", (req, res) => {
    res.render('distributeVest', {security});
});

// post distribute vest route
app.post("/distributeVest", (req, res) => {
    knex("vest_distribution").insert({
        vest_first_name: req.body.vest_first_name.toUpperCase(),
        vest_last_name: req.body.vest_last_name.toUpperCase(),
        vest_county: req.body.vest_county.toUpperCase(),
        vest_state: req.body.vest_state.toUpperCase(),
        vest_size: req.body.vest_size.toUpperCase()
    }).then(myvests => {
        res.redirect("/vestDistribution");
    });
});

// edit recipient get route
app.get("/editRecipient/:id", (req, res) => {
    knex.select('vest_id',
                'vest_first_name',
                'vest_last_name',
                'vest_county',
                'vest_state',
                'vest_size').from("vest_distribution").where('vest_id', parseInt(req.params.id)).then(myvests => {
                    res.render('editRecipient', {vest: myvests, security})
                }).catch(err => {
                    console.log(err);
                    res.status(500).json({err});
                });
});

// edit recipient post route
app.post("/editRecipient", (req, res) => {
    knex('vest_distribution').where('vest_id', parseInt(req.body.vest_id)).update({
        vest_first_name: req.body.vest_first_name.toUpperCase(),
        vest_last_name: req.body.vest_county.toUpperCase(),
        vest_county: req.body.vest_county.toUpperCase(),
        vest_state: req.body.vest_state.toUpperCase(),
        vest_size: req.body.vest_size.toUpperCase()
    }).then(myvests => {
        res.redirect('/vestDistribution');
    });
});

// delete recipient post route
app.post("/deleteRecipient/:id", (req, res) => {
    knex('vest_distribution').where('vest_id', parseInt(req.params.id)).del().then(myvests => {
        res.redirect('/vestDistribution')
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

// Route for handling search queries
app.get('/searchVolunteers', async (req, res) => {
    const query = req.query.query.toUpperCase(); // Get the search query from the URL
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = 15; // Show 15 volunteers per page
    const offset = (page - 1) * limit; // Calculate offset for the database query
    // Fetch the total number of volunteer for pagination
    const totalVolunteer = await knex("volunteers").count('* as count').first();
    const totalPages = Math.ceil(totalVolunteer.count / limit);
    let hiddenSubmit = "";
    let hiddenView = "hidden";

    if (!query) {
        return res.render('search', { volunteer: [] }); // Render with no results if no query
    }

    try {
        const volunteer = await knex('volunteers')
            .select('*')
            .where('volunteer_first_name', 'like', `%${query}%`) // Add more conditions for other columns as needed
            .orWhere('volunteer_last_name', 'like', `%${query}%`)
            .limit(limit)
            .offset(offset);
            console.log({
                volunteer
            });
            
        res.render('volunteerManagement', { volunteer, currentPage: page, totalPages, page: 'Volunteer', security, hiddenView, hiddenSubmit });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('An error occurred while searching. Please try again later.');
    }
});

// Route for handling search queries
app.get('/searchVests', async (req, res) => {
    const query = req.query.query.toUpperCase(); // Get the search query from the URL
    let hiddenSubmit = "";
    let hiddenView = "hidden";

    if (!query) {
        return res.render('search', { vests: [] }); // Render with no results if no query
    }

    try {
        const vests = await knex('vest_distribution')
            .select('*')
            .where('vest_first_name', 'like', `%${query}%`) // Add more conditions for other columns as needed
            .orWhere('vest_last_name', 'like', `%${query}%`);
        res.render('vestDistribution', { vest: vests, security, hiddenView, hiddenSubmit });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('An error occurred while searching. Please try again later.');
    }
});

// Route for handling search queries
app.get('/searchUsers', async (req, res) => {
    const query = req.query.query.toUpperCase(); // Get the search query from the URL
    let hiddenSubmit = "";
    let hiddenView = "hidden";
    if (!query) {
        return res.render('search', { users: [] }); // Render with no results if no query
    }
    try {
        const users = await knex('users')
            .select('*')
            .where('user_first_name', 'like', `%${query}%`) // Add more conditions for other columns as needed
            .orWhere('user_last_name', 'like', `%${query}%`)
        res.render('userManagement', { users: users, security, hiddenView, hiddenSubmit });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('An error occurred while searching. Please try again later.');
    }
});

// Route for handling search queries
app.get('/searchEvents', async (req, res) => {
    const query = req.query.query.toUpperCase(); // Get the search query from the URL]
    let hiddenSubmit = "";
    let hiddenView = "hidden";
    if (!query) {
        return res.render('search', { events: [] }); // Render with no results if no query
    }

    try {
        const events = await knex('events')
            .select('*')
            .where('host_first_name', 'like', `%${query}%`) // Add more conditions for other columns as needed
            .orWhere('host_last_name', 'like', `%${query}%`)
            .orWhere('event_name', 'like', `%${query}%`)
        res.render('eventManagement', { events, security, hiddenView, hiddenSubmit });
    } catch (error) {
        console.error('Error performing search:', error);
        res.status(500).send('An error occurred while searching. Please try again later.');
    }
});

app.listen(port, () => console.log("Express is listening"));