// TODO

$(document).ready(function() {
	makeChart(this.indicator, this.year, new Set());
});

var randomColorGenerator = function () { 
    return '#' + (Math.random().toString(16) + '0000000').slice(2, 8); 
};

var crimeColor = {'murders' : '#ce2b00'};

var _chart;

function makeChart(indicator, year, hightlightDistricts) {
	console.log('makeChart ' + indicator + ' ' + year);

	if (_chart != undefined) {
		_chart.destroy();
		_chart = undefined;
	}
	var canvas = $("#barchart").get(0);
	ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	crimes = selectCrimes({indicator: indicator, year: year});

	districtCounts = {};

    for (var dname of getDistricts()) {
        var request = {
            year: year,
            indicator: indicator
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
        // value.counting = normalize ? value["rel"] : value.abs;

        districtCounts[dname] = value;
        // maxValue = Math.max(maxValue, value.counting);
    }

	// Create items array
	var items = Object.keys(districtCounts)
		.filter(function(key) { return districtCounts[key] != 0; })
		.map(function(key) {
			return [key, districtCounts[key].abs];
	});
	// console.log(items);
	// Sort the array based on the second element
	items.sort(function(first, second) {
		return second[1] - first[1];
	});
	items = items.slice(0, Math.min(items.length, 10));
	// console.log(items);
    // TODO sort by count
	_chart = new Chart(ctx, {
	    type: 'bar',
	    data: {
	        labels: items.map(function(x) { return x[0]; }),
	        datasets: [{
	            label: indicator + ' по районам',
	            data: items.map(function(x) { return x[1]; }),
	            // backgroundColor: randomColorGenerator(),
	            backgroundColor: kIndicatorsInfo[indicator] != undefined ? kIndicatorsInfo[indicator]['color'] : randomColorGenerator(),
	            borderColor: randomColorGenerator(),
	            
	            // borderColor: [
	            //     'rgba(255,99,132,1)',
	            //     'rgba(54, 162, 235, 1)',
	            //     'rgba(255, 206, 86, 1)',
	            //     'rgba(75, 192, 192, 1)',
	            //     'rgba(153, 102, 255, 1)',
	            //     'rgba(255, 159, 64, 1)'
	            // ],
	            borderWidth: 1
	        }]
	    },
	    options: {
	        scales: {
	            yAxes: [{
	                ticks: {
	                    beginAtZero:true
	                }
	            }]
	        }
	    }
	});
}