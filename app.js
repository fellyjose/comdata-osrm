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

app.get('/', function(req, res) {
    res.send(400);
});

app.get('/table', function (req, res) {
  if ((req.query.loc instanceof Array) && (req.query.loc.length > 1)){
    var locs = req.query.loc;

    // osrm distance table
    var query = {
      coordinates: []
    }

    for (var i = 0; i < locs.length; i++) {
      var ll = locs[i].split(',');
      query.coordinates.push([+ll[1],+ll[0]]);
    }

    osrm.table(query, function(err, table) {
      if (err)
        res.send(500, err);
      else {
        res.json(200, table);
      }
    });
  } else {
    res.send(400, 'a list of locations is required.');
  }
});

app.get('/viaroute', function (req, res) {
  if ((req.query.loc instanceof Array) && (req.query.loc.length > 1)){
    var locs = req.query.loc;

    // osrm route
    var query = {
        coordinates: [],
        alternateRoute: req.query.alternatives !== 'false'
    };

    for (var i = 0; i < locs.length; i++) {
      var ll = locs[i].split(',');
      query.coordinates.push([+ll[1],+ll[0]]);
    }

    osrm.route(query, function(err, result) {
      if (err)
        res.send(500, err);
      else {
        res.json(200, result);
      }
    });
  } else {
    res.send(400, 'a list of locations is required.');
  }
});

console.log('Listening on port: ' + config.server.port);
app.listen(config.server.port);
