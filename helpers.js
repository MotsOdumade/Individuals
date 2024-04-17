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
      'num-projects': 'stat'
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



function authorised(client_token, data_about, target_id){

  // Connect to the database
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to the database:', err);
            return false; // handle error appropriately
        }
        console.log('Connected to the database');
        // Execute a query
        let sql_query = "SELECT * FROM TokenTable;";
        connection.query(sql_query, (err, results) => {
          if (err) {
              console.error('Error executing query:', err);
              return false; // handle error appropriately
          }
          console.log('Query results:', results); 
          // Check if the query returned any rows
          if (results.length > 0) {
              // Access specific data within the response
              results.forEach(row => {
                  console.log('Token ID:', row.tokenID);
                  console.log('Employee ID:', row.employeeID);
                  console.log('Time Generated:', row.timeGenerated);
                  // Access other fields as needed
              });
          } else {
              console.log('No rows returned from the query.');
          }

          // Close the connection when done
          connection.end();
          return true; // return inside the query callback
        });      
    });
}



function data_to_chart(data_requested){
  
  // -- matches dataRequest to a chart type
  // -- dataToChart = [weekly-task-completion: 'line', deadlines-met: 'progressBar', task-status-proportions: 'pie', performance-report: 'stat', num-projects: 'stat'];
  const chart = dataChartDict[data_requested];
  return chart;
}








module.exports = {valid_request, authorised, data_to_chart};
