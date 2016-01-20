Meteor.methods({
    geoCodeAllStations: function(){
        Meteor.myGeoFunctions.geoCode();
    },
    getDistance: function(from, to){
        Meteor.myGeoFunctions.geoDistance(from, to);
    },
    crawlStarCars:function(){
        Meteor.myCrawlFunctions.crawlStarCars();
    },
    crawlStarCarStations:function(){
        Meteor.myCrawlFunctions.crawlStarCarStations();
    },
});
