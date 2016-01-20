var cheerio = Meteor.npmRequire('cheerio');

Meteor.myCrawlFunctions = {
    crawlStarCars:function(){
        var pageContent = loadPageContent('http://www.starcar.de/kostenlos_mieten.php');
        var rawCarsList = pageContent(".kostenlos_uebersicht_item_container");
        var linkList = extractStarCarLinks(rawCarsList);
        loadStarCars(linkList, starCarDict);
    },
    crawlStarCarStations:function(){
        var pageContent = loadPageContent('http://www.starcar.de/stationen.php');
        var rawStationsList = pageContent(".stationen_uebersicht_station_container");
        var linkList = extractStarCarLinks(rawStationsList);
        loadStarCarStations(linkList, starCarStationsDict);
    }
};

var starCarDict = {
    _id : "input[name='kostenlosId']",
    car : "input[name='fahrzeugtyp']",
    stationIdStart : "input[name='stationIdStart']",
    stationIdEnd : "input[name='stationIdEnd']",
    plate : "input[name='kennzeichen']",
    abholungVon : "input[name='abholungVon']",
    abholungBis : "input[name='abholungBis']",
    group : "input[name='gruppe']"
}

var starCarStationsDict = {
    completeAddress : ".stationen_detail_kontakt_anschrift",
    title : ".stationen_detail_headline",
}

var getAttributesByDictionary = function(pageContent, attribsDictionary){
    console.log("loadedPage");
    newCar = {};
    for (var attribute in attribsDictionary){
        newCar[attribute] = pageContent(attribsDictionary[attribute]).val() || pageContent(attribsDictionary[attribute]).text();
    }
    return newCar;
}

var loadStarCarStations = function(linkList, attribsDictionary){
    Object.keys(linkList).forEach(function(index) {
        var link = linkList[index]
        var pageContent = loadPageContent(link);
        var tmpStationData = getAttributesByDictionary(pageContent, attribsDictionary);
        var stationData = {}
        stationData.address = sanitizeStarCarAddress(tmpStationData.completeAddress);
        stationData.tel = sanitizeStarCarTel(tmpStationData.completeAddress);
        stationData.fax = sanitizeStarCarFax(tmpStationData.completeAddress);
        stationData.title = sanitizeStarCarStationTitle(tmpStationData.title);
        stationData.link = link;
        stationData._id = link.substring(39);
        Stations.upsert({_id : stationData._id},{$set: stationData});
        console.log(stationData);
    });
}

var loadStarCars = function(linkList, attribsDictionary){
    Object.keys(linkList).forEach(function(index) {
        var link = linkList[index]
        var pageContent = loadPageContent(link);
        var carData = getAttributesByDictionary(pageContent, attribsDictionary);
        carData.link = link;
        carData.active = true;
        Cars.upsert({_id : carData._id},{$set: carData});
        console.log(carData);
    });
}

var loadPageContent = function(address){
    return cheerio.load(Meteor.http.get(address).content);
}

var extractStarCarLinks = function(rawCarsList){
    var linkList = [];
    carsArray = rawCarsList.children().toArray();
    for (var car of carsArray){
        var link = sanitizeStarCarLink(car.attribs.onclick)
        linkList.push(link);
    }
    console.log(linkList);
    return linkList;
}

var sanitizeStarCarLink = function(rawLink){
    var sanitizedLink = rawLink.substring(6,rawLink.length-3);
    return "http://www.starcar.de/" + sanitizedLink
}

var sanitizeStarCarAddress = function(rawAddress){
    return rawAddress.split("\n\t\t\t\t\t\n\t\t\t\t\t\tAnschrift\n\t\t\t\t\t\t\n\t\t\t\t\t\t").pop().split("\tTel:").shift().replace(/(\n)/gm,",").replace(/(\t)/gm,"");
}

var sanitizeStarCarTel = function(rawTel){
    return rawTel.split("Tel: ").pop().split("\n").shift();
}

var sanitizeStarCarFax = function(rawTel){
    return rawTel.split("Fax: ").pop().split("\n").shift();
}

var sanitizeStarCarStationTitle = function(rawTitle){
    return rawTitle.replace(/(\n)/gm,"").replace(/(\t)/gm,"");
}
