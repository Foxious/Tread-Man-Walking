var directions_service = new google.maps.DirectionsService();
var directions_display;
var steps;
var map;
function calc_route(){
	var request = {
		origin : '1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102',
		destination : 'Times Square Manhattan, NY',
		travelMode : google.maps.TravelMode.WALKING,
		waypoints : [ {location:'Leisure Town Rd' , stopover:false}]
	};
	directions_service.route(request, function(result, status){
		if (status == google.maps.DirectionsStatus.OK){
			directions_display.setDirections(result);
			steps = result.routes[0].legs[0].steps;
			load_distance();
		}
	});
}
function initialize() {
	directions_display = new google.maps.DirectionsRenderer({
		preserveViewport: true,
		draggable: false,
		suppressMarkers: true
	});
	var map_options = {
		zoom: 12
	};
	map = new google.maps.Map(document.getElementById("map-canvas"), map_options);
	directions_display.setMap(map);
	calc_route();
}

function lerp (start, end, percent){
	var value = start * (1.0-percent) + end * percent;
	return value
}

function load_distance(){
	$.ajax({
		url: 'js/distance.json',
	   	method: 'GET',
	   	cache: false,
	   	accept: 'application/json',
   		error: function(xhr, ajaxOptions, thrownError){
   			console.log(thrownError);
   		}
	}).done(function(data){
		data_object = $.parseJSON(data)
		find_waypoint(data_object.distance);
	}).fail(function(){
		console.log("failed");
	});
}

function find_waypoint(raw_distance){
	var meters_distance = raw_distance * 1609.34;
	find_location_at_distance(meters_distance);
}

function find_location_at_distance(distance){
	for (var i = 0; i < steps.length; ++i){
		var it = steps[i];
		var this_distance = it.distance.value;
		if (distance > this_distance) {
			distance -= this_distance;
			continue;
		}
		console.log(it);
		return (find_location_in_step(it.path, distance))
	}
}

function find_location_in_step(path, distance){
	for (var i = 1; i < path.length; ++i){
		var coord_distance = google.maps.geometry.spherical.computeDistanceBetween(path[i-1], path[i])
		if (distance < coord_distance){
			distance -= coord_distance;
			continue;
		}
		marker_point(path[i-1]);
		marker_point(path[i]);
		map.panTo(path[i-1]);
		return
	}
}

function marker_point(point){
	var marker = new google.maps.Marker({
		position:point,
		map:map
	})
}
google.maps.event.addDomListener(window, 'load', initialize);