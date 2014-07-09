comdata-osrm
============

This is a routing server for ComData, it builds on [Project-OSRM](https://github.com/DennisOSRM/Project-OSRM) and
[node-osrm](https://github.com/DennisOSRM/node-osrm).

The server can either be run with shared memory (preferred) or by selecting a OSRM prepared OpenStreetMap file in config/default.yml.

## Lua files

Cars, trucks, pedestrians and trains are configured using a Lua file when the OSRM data is prepared.

## Tests

The current ComData use case is to find nearest (travel time) locations for a truck driver and then to find
a route (and alternatives) to that location which include the limitations of turn restrictions etc.

In production the locations will be provided as the result of a query to Cloudant Geo.

`npm test`

Is a set of tests that exercise the use case above.

## Running

`npm start`

