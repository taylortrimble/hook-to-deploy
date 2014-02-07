var fs = require('fs');
var path = require('path');
var random = require('./random.js');

module.exports = {
  execSaveResults: function(toExec, resultsFolder, callback) {
    var resultsFile = random.generateUUID() + '.json';
    var resultsPath = path.join(resultsFolder, resultsFile);
    
    var procData = {};
    procData.toExec = toExec;
    procData.resultsFile = resultsFile;
    procData.startedAt = new Date().toISOString();
    procData.inProgress = true;

    // write in-progress procData to file
    fs.writeFile(resultsPath, JSON.stringify(procData), function(err) {
      // handle errors
      if (err) callback(err);
      
      // start the child process once the in-progress file has been written
      require('child_process').exec(toExec, function(err, stdout, stderr) {
        // copy procData into finalData
        var finalData = JSON.parse(JSON.stringify(procData));
        
        // on finish, update finalData
        finalData.inProgress = false;
        finalData.finishedAt = new Date().toISOString();
        finalData.stdout = stdout.split('\n');
        finalData.stderr = stderr.split('\n');
        
        // write success/error into finalData
        if (err === null) {
          finalData.success = true;
        } else {
          finalData.error = err;
        }

        // write finished finalData to file
        fs.writeFile(resultsPath, JSON.stringify(finalData), function(err) {
          if (err) callback(err);
        });
      });

      // return the in-progress data
      callback(null, procData);
    });
  }
};
