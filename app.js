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

      // osrm.route doesn't like to be called asynchronously
      var dists = [];
      for (var i = 0; i < perms.length; i++){
        var query =
        {
          coordinates: perms[i],
          printInstructions: false,
          alternateRoute: false
        }
        osrm.route(query, function(err, row) {
          if (err)
            res.status(500).jsonp(err);
          else {
            dists.push(row.route_summary.total_distance);
            if (dists.length == perms.length) {
              // slice data to add diagonal of zeros
              var table = {
                "distance_table": []
              };


              var split = coords.length - 1;
              var cntr = 0;
              for (var i = 0; i < dists.length; i+= split) {
                var tmp = dists.slice(i, i + split);
                // add the diagonal zero
                tmp.splice(cntr, 0, 0);
                table.distance_table.push(tmp);
                ++cntr;
              }

              res.status(200).jsonp(table);
            }
          }
        })
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

function node_permutations(list)
{
	// Empty list has one permutation
	if (list.length == 0)
		return [[]];


	var result = [];

	for (var i=0; i < list.length; i++)
	{
		// Clone list (kind of)
		var copy = Object.create(list);

		// Cut one element from list
		var head = copy.splice(i, 1);

		// Permute rest of list
		var rest = node_permutations(copy);

    // Add head to each permutation of rest of list
		for (var j=0; j < rest.length; j++)
		{
			var next = head.concat(rest[j]);
			result.push([next[0], next[1]]);
		}
	}

	return result;
}

console.log('Listening on port: ' + config.server.port);
app.listen(config.server.port);
