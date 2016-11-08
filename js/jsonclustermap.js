// set up the options for our initial map
var southWest = L.latLng(26.487043, 78.739439);
var northEast = L.latLng(30.688485, 89.847341);
var mapOptions = {
	center: [28.478348, 86.542285],
	zoom: 7,
    minZoom:7,
	maxZoom:19,
	maxBounds: L.latLngBounds(southWest, northEast)
};

// find the div and put the map there
var map = L.map("mapid", mapOptions);

// find our nepal border geometry so we can mask anything outside nepal
var latLngGeom = nepal_border;

// get the map tiles and initialize the tiles and boundary mask on the leflet map
var osm = L.TileLayer.boundaryCanvas('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    boundary: nepal_border, 
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, <a href="http://kathmandulivinglabs.org/">Kathmandu Living Labs</a>'
}).addTo(map);

// initialize the prune cluster object
var leafletView = new PruneClusterForLeaflet(160);
var size = 10000;
var markers = [];

// we will use this function to populate the map with data from GEOJSON
function fillmap() {
	// this is an asynchronous request.  It is exactly the same as JQUERY/AJAX, this is what
	// happens "under the hood" when you use those tools anyway.  This may even be a tiny bit
	// faster.  But we get more granular control.
	var request = new XMLHttpRequest();
	request.open("GET", "data/dirtydate.json", true);
	request.onload = function (e) {
		// on asynchronous load of the file, we check if it is ready to be read
		if (request.readyState === 4) {
		    if (request.status === 200) 
		    	parseresponse(request);	// if so, we send it to our parsing function
		    else xmlhttperr();	// if not, we had an error, so we log it to the console
		}
	};
	request.onerror = function (e) {
		xmlhttperr();	// if we make it here there was an error, so we log it
	};
	request.send(null); // this sends the request which leads to the asynchronous events listed above
}

// this function parses our response once we get it (see code above in fillmap() )
function parseresponse(request) {
	// we successfully, asynchronously recieved the json
	var json = JSON.parse(request.responseText);
	// loop over the json features
	for (var a = 0; a < json.features.length; a++) {
		// for each feature, get the longitude and latitude
		var lon = json.features[a].geometry.coordinates[0];
		var lat = json.features[a].geometry.coordinates[1];
		// for now we are only mapping features which have a lon and lat, so not relations or ways unfortunately
		// would be a good feature to add in the future!
		// but we do consider relations and ways in all of our printed statistics on the website in cards and charts
		if (lon != 0.0 && lat != 0.0) {
			// initialize a marker in our prune cluster object for this feature from the json
			var marker = new PruneCluster.Marker(lat, lon);
			marker.data.datestamp = new Date(json.features[a].properties.timestamp);
			marker.data.popup = "user: " + json.features[a].properties.user + " timestamp: " + marker.data.datestamp + " version: " + json.features[a].properties.version + " feature_id: " + json.features[a].properties.feature_id;
			markers.push(marker);
			leafletView.RegisterMarker(marker);
		}
	}
}

// if we have an error with our asynchronous file loading, this will get called
function xmlhttperr() {
	console.error("there was an error with the async xmlhttprequest for the geojson file used to populate the cluster map.");
}

// fillmap() starts the entire series of events outlined above
fillmap();

// this handles updates to what should be visible on the map
var lastUpdate = 0;
window.setInterval(function () {
	var now = +new Date();
	if ((now - lastUpdate) < 400) {
    		return;
    	}

    	for (i = 0; i < size / 2; ++i) {
        	var coef = i < size / 8 ? 10 : 1;
		var ll = markers[i].position;
		ll.lat += (Math.random() - 0.5) * 0.00001 * coef;
		ll.lng += (Math.random() - 0.5) * 0.00002 * coef;
    	}

    	leafletView.ProcessView();
    	lastUpdate = now;
    	
}, 500);

// we add the leaflet view to the map, thus showing the clusters from the prune cluster object
map.addLayer(leafletView); 

// this is the callback for when the google chart date range changes, to filter out what we show in the map
function showRange(start, end) {
	markers.forEach(function(marker) {
		// return true if it is not in the date range, false if it is in the daterange
		marker.filtered = (start > marker.data.datestamp || marker.data.datestamp > end);
	});
	leafletView.ProcessView();
}

//Fire this when map is panned/zoomed/reset
map.on('moveend', function(ev){
	//get new southWest and northEast values
	_bounds=map.getBounds();
	north=_bounds.getNorth();
	south=_bounds.getSouth();
	east=_bounds.getEast();
	west=_bounds.getWest();
	
	// modify page title
	
	/*$('#pageTitle').html(
		'north='+north+
		'<br/>east='+east+
		'<br/>south='+south+
		'<br/>west='+west
	);*/
	
	// modify statistics cards
	
	// modify data in google chart below
});