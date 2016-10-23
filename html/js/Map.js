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

function _parseColor(s) {
    // NOTE: stolen from http://stackoverflow.com/questions/11068240/what-is-the-most-efficient-way-to-parse-a-css-color-in-javascript

    console.error(s, s, s, s.match(/^#([0-9a-f]{3})$/i));
    m = s.match(/^#([0-9a-f]{3})$/i);
    if (m) {
        m = m[1];
        return [
            parseInt(m.charAt(0), 16)*0x11,
            parseInt(m.charAt(1), 16)*0x11,
            parseInt(m.charAt(2), 16)*0x11
        ];
    }

    m = s.match(/^#([0-9a-f]{6})$/i);
    if (m) {
        m = m[1];
        return [
            parseInt(m.substr(0, 2), 16),
            parseInt(m.substr(2, 2), 16),
            parseInt(m.substr(4, 2), 16)
        ];
    }

    return ({
        "red": [255, 0, 0],
        "yellow": [255, 255, 0],
        "green": [0, 255, 0],
        "blue": [0, 0, 255],
        "black": [0, 0, 0],
        "white": [255, 255, 255]
    })[s];
}

function _mixColors(from, to, rate) {
    from = _parseColor(from);
    to = _parseColor(to);

    // console.log(from, to, rate);

    return [
        Math.floor((to[0] - from[0])*rate + from[0]),
        Math.floor((to[1] - from[1])*rate + from[1]),
        Math.floor((to[2] - from[2])*rate + from[2])
    ];
}

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

    var colorRatio = 1.0 / maxValue;

    for (var dname in this.districts) {
        var district = this.districts[dname];
        var value = values[dname];

        if (value !== undefined) {
            // var colorValue = Math.floor(value.counting*colorRatio);

            console.warn(_parseColor(kIndicatorsInfo[this.indicator].color),
                        _parseColor("#000"));
            var color = _mixColors("#000", kIndicatorsInfo[this.indicator].color, value.counting*colorRatio);
            console.error(color, colorRatio, maxValue);
            console.error("rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")");
            district.setColor("rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")")
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
