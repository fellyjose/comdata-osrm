var express = require('express'),
  OSRM = require('osrm'),
  config = require('config');

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
    var coords = [];

    for (var i = 0; i < locs.length; i++) {
      var ll = locs[i].split(',');
      coords.push([+ll[0],+ll[1]]);
    }

    // either network distance (time) or kilometres
    if ((req.query.format) && (req.query.format.toLowerCase() === 'meters')) {
      // create a matrix of results - max is 100 configured in OSRM
      // call viaroute and retrieve total_distance
      var perms = node_permutations(coords);

      var queries = [];
      for (var i = 0; i < perms.length; i++){
        for (var j = 0; j < perms[i].length; j++) {
          var query =
          {
            coordinates: perms[i][j],
            printInstructions: false,
            alternateRoute: false
          };
          queries.push(query);
        }
      }

      var tmp = [];
      for (var i = 0; i < queries.length; i++) {
        route(i, queries[i], function(err, result) {
          if (err)
            res.status(500).jsonp(err);
          else {
            tmp.push(result);

            if (tmp.length === queries.length) {
              var table = {
                "distance_table": []
              };

              tmp = tmp.sort(function(x, y) {
                if (x.index < y.index)
                  return -1;
                if (x.index > y.index)
                  return 1;

                return 0;
              });

              var cntr = perms.length;

              for (var i = 0; i < tmp.length; i += cntr) {
                table.distance_table.push(tmp.slice(i, i + cntr).map(
                  function(x) {
                    return x.dist;
                  }
                ));
              }

              res.status(200).jsonp(table);
            }
          }
        });

      }

    } else {
      // osrm distance table
      var query = {
        coordinates: coords
      }

      osrm.table(query, function(err, table) {
        if (err)
          res.status(500).jsonp(err);
        else
          res.status(200).jsonp(table);
      });
    }

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
      else
        res.status(200).jsonp(result);
    });
  } else {
    res.status(400).jsonp('a list of locations is required.');
  }
});

app.get('/nearest', function (req, res) {
  app.set('jsonp callback name', 'jsonp');
  if (typeof req.query.loc === 'string'){
    var locs = req.query.loc.split(',');
    if (locs.length == 2) {
      osrm.nearest([+locs[0], +locs[1]], function(err, result) {
          if (err)
            res.status(500).jsonp(err);
          else
            res.status(200).jsonp(result);
      });
    } else {
      res.status(400).jsonp('only one location supported');
    }
  } else {
    res.status(400).jsonp('only one location supported');
  }
});

app.get('/locate', function (req, res) {
  app.set('jsonp callback name', 'jsonp');
  if (typeof req.query.loc === 'string'){
    var locs = req.query.loc.split(',');
    if (locs.length == 2) {
      osrm.locate([+locs[0], +locs[1]], function(err, result) {
          if (err)
            res.status(500).jsonp(err);
          else
            res.status(200).jsonp(result);
      });
    } else {
      res.status(400).jsonp('only one location supported');
    }
  } else {
    res.status(400).jsonp('only one location supported');
  }
});

function route(i, query, callback) {
  osrm.route(query, function(err, res) {
    if ((err) || (!res.route_summary))
      callback(err);
    else
      callback(null, {
        "index" : i,
        "dist" : res.route_summary.total_distance
      });
  });
}

function node_permutations(list)
{
  // Empty list has one permutation
  if (list.length == 0)
    return [[]];

  var cntr = 0;
  var result = [];

  do {
    var tmp = [];
    var val = list[cntr];
    for (var i = 0; i < list.length; i++) {
      tmp.push([val, list[i]]);
    }
    result.push(tmp);
  } while (++cntr < list.length);
  return result;
}

console.log('Listening on port: ' + config.server.port);
app.listen(config.server.port);
