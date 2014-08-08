var express = require('express'),
  OSRM = require('osrm'),
  config = require("config");

global['config'] = config;

var app = exports.app = express();

var osrm;
if (config.osrm_file)
  osrm = new OSRM(config.osrm_file);
else
  orsm = new OSRM(); // shared memory

app.use('/demo', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.send(400);
});

app.get('/table', function (req, res) {
  app.set('jsonp callback name', 'jsonp');

  if ((req.query.loc instanceof Array) && (req.query.loc.length > 1)){
    var locs = req.query.loc;

    // osrm distance table
    var query = {
      coordinates: []
    }

    for (var i = 0; i < locs.length; i++) {
      var ll = locs[i].split(',');
      query.coordinates.push([+ll[0],+ll[1]]);
    }

    osrm.table(query, function(err, table) {
      if (err)
        res.status(500).jsonp(err);
      else {
        res.status(200).jsonp(table);
      }
    });
  } else {
    res.status(400).jsonp('a list of locations is required.');
  }
});

app.get('/viaroute', function (req, res) {
  app.set('jsonp callback name', 'jsonp');

  if ((req.query.loc instanceof Array) && (req.query.loc.length > 1)){
    var locs = req.query.loc;

    // osrm route
    var query = {
        coordinates: [],
        printInstructions: req.query.instructions !== 'false',
        alternateRoute: req.query.alternatives !== 'false'
    };

    for (var i = 0; i < locs.length; i++) {
      var ll = locs[i].split(',');
      query.coordinates.push([+ll[0],+ll[1]]);
    }

    osrm.route(query, function(err, result) {
      if (err)
        res.status(500).jsonp(err);
      else {
        res.status(200).jsonp(result);
      }
    });
  } else {
    res.status(400).jsonp('a list of locations is required.');
  }
});

console.log('Listening on port: ' + config.server.port);
app.listen(config.server.port);
