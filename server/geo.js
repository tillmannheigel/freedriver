Meteor.myGeoFunctions = {
    geocodeStation : function(station, callback){
        myGeoCoder(theAddress, callback);
    },
    calcDistance : function(car, callback){
        var startStation = Stations.findOne(car.stationIdStart);
        var stopStation = Stations.findOne(car.stationIdEnd);
        myDistanceCalcer(startStation.address, stopStation.address, callback);
    }
};

var myGeoCoder = function(address, callback){
    console.log("startGeoCoder for address:", theAddress);
    var geo = new GeoCoder({
        geocoderProvider: "google",
        httpAdapter: "https",
        apiKey: google[apiKey]
    });
    var result = geo.geocode(theAddress);
    var retVal = {};
    if (result && result.length > 0) {
        retVal.coords = {latitude : result[0].latitude, longitude : result[0].longitude};
        retVal.result = result;
    }
    else {
        retVal.err = "Address not found";
    }
    callback(retVal);
};

var myDistanceCalcer = function(from, to, callback){
    var result = GoogleMaps.getDistance(
        from,
        to,
        'false',
        'driving'
    );
    callback(result);
};
