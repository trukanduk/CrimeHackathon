var map;

var kDistrictActiveStyle = {
    fillOpacity: 0.9,
    weight: 2
};

var kDistrictInactiveStyle = {
    fillOpacity: 0.5,
    weight: 0.5
};

function Map() {
    this.map = L.map('map', {
        center: [55.755, 37.6],
        zoom: 11
    });

    L.tileLayer(
        "http://c.tile.osm.kosmosnimki.ru/night/{z}/{x}/{y}.png", {
        maxZoom: 14,
        attribution: "Map data &copy <a href='http://openstreetmap.org' alt='OpenStreetMap'>OpenStreetMap</a> , tiles &copy <a href='http://osm.kosmosnimki.ru' alt='kosmosnimri'>Kosmosnimki</a>",
    }).addTo(this.map);

    this.districts = {};
    var initialStyles = {
        fillColor: 'rgba(255, 20, 20, 1)',
        color: 'white',
    };
    $.extend(initialStyles, kDistrictInactiveStyle);
    for (var dname in kDistrictCoords) {
        var district = L.polygon(kDistrictCoords[dname], initialStyles)
        .on('mouseover', function() {
            this.setStyle(kDistrictActiveStyle)
                .openTooltip();
        }).on('mouseout', function() {
            this.setStyle(kDistrictInactiveStyle)
                .closeTooltip();
            // this.setStyle({fillOpacity: 0.5, weight: 0.5});
        }).addTo(this.map);

        this.districts[dname] = district;
    }
}

Map.prototype.setSlice = function(year, indicator, normalize) {
    this.year = year;
    this.indicator = indicator;

    var values = {};
    var maxValue = Number.NEGATIVE_INFINITY;
    for (var dname in this.districts) {
        var request = {
            year: this.year,
            indicator: this.indicator
        };
        request.district = dname;
        var value = getCrimesValue(request);
        if (value === undefined) {
            continue;
        }

        value = {
            abs: value,
            rel: value / getPopulation({district: dname}),
        };
        value.counting = normalize ? value["rel"] : value.abs;

        values[dname] = value;
        maxValue = Math.max(maxValue, value.counting);
    }

    var colorRatio = 255 / maxValue;

    for (var dname in this.districts) {
        var district = this.districts[dname];
        var value = values[dname];

        if (value !== undefined) {
            var colorValue = Math.floor(value.counting*colorRatio);
            district.setStyle({fillColor: "rgb(" + colorValue + ", 20, 20)"})
                    .bindTooltip(dname + ": " + value.abs + " случаев<br/>" +
                                Math.floor(value["rel"]*100000) + " случаев на 100000 жителей");
        } else {
            district.setStyle({fillColor: "#888"})
                    .bindTooltip(dname + ": нет данных");
        }
    }
};

$(document).ready(function() {
    map = new Map();
});
