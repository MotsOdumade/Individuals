// functions defined here will be used in index.js
// database credentials are specified in a .env file stored within the same package on the remote machine
// check authorised() for an example of how to query the database and process the results

const mysql = require('mysql');
require('dotenv').config();

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

function execute_sql_query(sql_query){
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
            return false; // handle error appropriately
        }
        // Execute a query
        console.log('Connected to the database');
        connection.query(sql_query, (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                connection.end(); // Close the connection if there's an error
                return false; 
            }
            // access result
              
            // Map each row to a plain JavaScript object
            const formattedResults = results.map(row => {
                  
                const formattedRow = {};
                for (const key in row) {
                  formattedRow[key] = row[key];
                }
                return formattedRow;
              });

            // Log the formatted results
              console.log(formattedResults);

              // Close the connection
              connection.end();
              return formattedResults;
            });
    });
}


function valid_request(data_requested, access_code, data_about, target_id){
      // check if the request is missing necessary information
  if (Object.keys(dataChartDict).includes(data_requested) === false){
        return false;
  }
  if (access_code == ''){
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



function authorised(access_code) {
    // verify the access code provided
    if (access_code == process.env.ACCESS_CODE){
      // correct access code for company-analytics code 
      execute_sql_query("SELECT * FROM EmployeeTable;");
      return true;
    } 
    // else incorrect access_code 
    return false;
    
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
