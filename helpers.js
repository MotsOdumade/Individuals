
function authorised(){
  return true;
}

function data_to_chart(dataRequest){
  
  // -- matches dataRequest to a chart type
  // -- dataToChart = [weekly-task-completion: 'line', deadlines-met: 'progressBar', task-status-proportions: 'pie', performance-report: 'stat', num-projects: 'stat'];
  
  dataToChart = ['weekly-task-completion': 'line', 'deadlines-met': 'progressBar', 'task-status-proportions': 'pie', 'performance-report': 'stat', 'num-projects': 'stat'];
  
 
  if (Object.keys(dataToChart).includes(dataRequest)){
    // match to the correct chart type
    const chart = dataToChart[dataRequest];
    return chart;
  } else {
    return false;
  }
}








module.exports = { authorised, data_to_chart};
