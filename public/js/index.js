var map = L.map('map');

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

L.Routing.control({
	waypoints: [
		L.latLng(40.163669, -105.096778),
		L.latLng(40.184019, -105.111322)
	],
	serviceUrl: "/viaroute",
	geocoder: L.Control.Geocoder.nominatim()
}).addTo(map);
