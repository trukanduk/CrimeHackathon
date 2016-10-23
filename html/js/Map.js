var kMultipleDistrictCheckingEnabled = false;
var kNormalizeColorWithAllYears = false;

var map;

var kDistrictStyles = {
    "unchecked_hover": {
        fillOpacity: 0.9,
        weight: 2,
        color: 'white',
    },
    "unchecked_normal": {
        fillOpacity: 0.5,
        weight: 0.5,
        color: 'white',
    },
    "checked_normal": {
        fillOpacity: 0.5,
        weight: 2,
        color: 'red',
    },
    "checked_hover": {
        fillOpacity: 0.9,
        weight: 2,
        color: 'red',
    },
};

function _getDistrictStyleId(checked, hover) {
    return (checked ? "checked" : "unchecked") + "_" + (hover ? "hover" : "normal");
}

function _getDistrictStyle(checked, hover) {
    return kDistrictStyles[_getDistrictStyleId(checked, hover)];
}

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
        zoom: 11,
        scrollWheelZoom: false,
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
    $.extend(initialStyles, _getDistrictStyle(false, false));
    for (var dname in kDistrictCoords) {
        var district = new_District(this, dname, initialStyles).addTo(this.map);

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
    // FIXME:
    if (kNormalizeColorWithAllYears) {
        var result = selectCrimes({indicator: this.indicator});
        for (var i = 0; i < result.length; ++i) {
            var record = result[i];
            var value = record.value;
            if (value === undefined) {
                continue;
            }

            if (normalize) {
                var population = getPopulation({district: record.district});
                if (population === undefined) {
                    continue;
                }
                value /= population;
            }
            maxValue = Math.max(maxValue, value);
        }
    }

    var colorRatio = 255 / maxValue;

    for (var dname in this.districts) {
        var district = this.districts[dname];
        var value = values[dname];

        if (value !== undefined) {
            var colorValue = Math.floor(value.counting*colorRatio);
            district.setColor("rgb(" + colorValue + ", 20, 20)")
                    .setTooltipExt(value.abs, value.rel);
        } else {
            district.setColor("#888")
                    .setUndefinedTooltip();
        }
    }
};

onDistrictCickCallback = function() {
    makeChart(this.indicator, this.year, new Set());
}

Map.prototype._districtClick = function(clickedDname) {
    if (kMultipleDistrictCheckingEnabled) {
        var district = this.districts[clickedDname];
        if (district) {
            district.toggleCheck();
        }
    } else {
        for (var dname in this.districts) {
            var district = this.districts[dname];
            district.check(dname == clickedDname);
        }
    }

    console.log('callCallback');
    if (this.onDistrictCickCallback) {
        this.onDistrictCickCallback();
    }
};

$(document).ready(function() {
    map = new Map();
});
