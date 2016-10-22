$(document).ready(function() {
    var mapElement = $("#map-wrap");
    var map = L.map('map', {
        center: [55.755, 37.6],
        zoom: 11
    });

    L.tileLayer(
        "http://c.tile.osm.kosmosnimki.ru/night/{z}/{x}/{y}.png", {
        maxZoom: 14,
        attribution: "Map data &copy <a href='http://openstreetmap.org' alt='OpenStreetMap'>OpenStreetMap</a> , tiles &copy <a href='http://osm.kosmosnimki.ru' alt='kosmosnimri'>Kosmosnimki</a>",
    }).addTo(map);

    for (var aoname in kAoCoords) {
        var polygon = L.polygon(kAoCoords[aoname], {
            fillColor: 'white',
            fillOpacity: 0.0,
            color: 'white',
            weight: 1,
        }).on('mouseover', function() {
            this.setStyle({fillOpacity: 0.1, weight: 2});
        }).on('mouseout', function() {
            this.setStyle({fillOpacity: 0.0, weight: 1});
        }).addTo(map);
    }
});
