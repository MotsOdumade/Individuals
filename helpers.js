// functions defined here will be used in index.js
// database credentials are specified in a .env file stored within the same package on the remote machine
// check authorised() for an example of how to query the database and process the results

const mysql = require('mysql');
require('dotenv').config();

// Create a connection to the database using environment variables
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

const dataChartDict = {
      'weekly-task-completion': 'line',
      'deadlines-met': 'progressBar',
      'task-status-proportions': 'pie',
      'performance-report': 'stat',
      'num-projects': 'stat',
      'member-projects': 'list'
      // performance-report ought to be broken down further
};

const listDataAbout = ['self', 'project', 'avg-employee'];


function valid_request(data_requested, client_token, data_about, target_id){
      // check if the request is missing necessary information
  if (Object.keys(dataChartDict).includes(data_requested) === false){
        return false;
  }
  if (client_token == ''){
        return false;
  }
  if (listDataAbout.includes(data_about) === false){
        return false;
  }
  if (data_about == 'avg-employee'){
        return true;
  } 
  if (target_id == ''){
        return false;
  }
  
  if (isNaN(target_id)){
        // it's not a number
        return false;
  }
  return true;
}



function authorised(client_token, data_about, target_id) {
    /* if the user is in the project or the user is requesting data about themself or the average employee 
    then authorise, else unauthorised */
    // at the moment, the function always returns true
    // Create a connection to the database using environment variables
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    // Connect to the database
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return false; 
        }
        console.log('Connected to the database');
        
        const sql_query = "SELECT * FROM TokenTable;";
        // Execute a query
        connection.query(sql_query, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                connection.end(); // Close the connection if there's an error
                return false; // handle error appropriately
            }
            // console.log('Query results:', results);
            // now can access any results returned
            // Check if the query returned any rows
            if (results.length > 0) {
                // Access specific data within the response, e.g.
                /*
                results.forEach(row => {
                    console.log('Token ID:', row.tokenID);
                    console.log('Employee ID:', row.employeeID);
                    console.log('Time Generated:', row.timeGenerated);
                    // Access other fields as needed
                });
                */
            } else {
                console.log('No rows returned from the query.');
            }
            

            // Close the connection when done - do inside the query callback 
            connection.end();
            return true; // return inside the query callback
            // end of query function
        });
      // end of connect function
    });
   
// end of authorised function
}



function data_to_chart(data_requested){
  
  // -- matches dataRequest to a chart type - probably unnecessary
  const chart = dataChartDict[data_requested];
  return chart;
}

// ---- functions to execute requests

function task_status_request(dataAbout, targetId, when){
  const title = 'Status of Current Tasks';
  let sampleData = [];
  // query the database
  
  sampleData = [
    ['Complete', 3],
    ['In Progress', 1],
    ['Not Started', 2]
  ];
  
  return {'title': title, 'sampleData': sampleData};
}


function num_projects_request(dataAbout, targetId, when){
  const title = 'Number of Current Projects';
  let sampleData = 0;
  // query the database
  
  sampleData = 4;
  return {'title': title, 'sampleData': sampleData};
}

function deadlines_met_request(dataAbout, targetId, when){
  const title = 'Number of Deadlines Met';
  let sampleData = [
    ['Deadlines Met', 5],
    ['Total Tasks', 6]
  ];
  // could instead use a json format depending on output required for frontend
  return {'title': title, 'sampleData': sampleData};
}

function weekly_completion_request(dataAbout, targetId, when){
  const title = 'Weighted Task Completion this Week';
  let sampleData = [
        [new Date(2014, 0, 1),  5.7], // represents jan 1st 2014
        [new Date(2014, 0, 2),  8.7],
        [new Date(2014, 0, 3),   12],
        [new Date(2014, 0, 4), 15.3],
        [new Date(2014, 0, 5), 15.6],
        [new Date(2014, 0, 6), 20.9],
        [new Date(2014, 0, 7), 19.8]
      ];
  return {'title': title, 'sampleData': sampleData};
}

function member_projects_request(targetId){
  // returns a list of objects representing the projects that the individual is currently in
  const title = 'Projects Involved In';
  let sampleData = [];
  // query the database
  
  sampleData = [
    {'project-id': '1201', 'project-name': 'Skill Swap Initiative'},
    {'project-id': '1205', 'project-name': 'Office Connect Project'},
    {'project-id': '1202', 'project-name': 'Corporate Social Responsibility Campaign'},
    {'project-id': '1204', 'project-name': 'Employee Training and Development Initiative'},
    {'project-id': '1209', 'project-name': 'Customer Experience Enhancement Project'},
    {'project-id': '1207', 'project-name': 'Performance Management System Upgrade'},
    {'project-id': '1200', 'project-name': 'Risk Management and Compliance Review'},
  ];
  
  return {'title': title, 'sampleData': sampleData};
}


module.exports = {valid_request, authorised, data_to_chart, task_status_request, num_projects_request, deadlines_met_request, weekly_completion_request, member_projects_request};
