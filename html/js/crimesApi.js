// var _crimeDataCaches = {};

function _sum(a, b) { return a + b; }
function _notSetOrEqual(a, b) { return a === undefined || a == b; }
function _minmax(a, b) {
	console.log(a, b)
	a.min = Math.min(a.min, b);
	a.max = Math.max(a.max, b);
	return a;
}

// see getCrimesValue
function selectCrimes(selectors) {
	var result = [];
	for (var i = 0; i < kCrimesData.length; ++i) {
		var datum = kCrimesData[i];
		if (datum.value !== undefined &&
			_notSetOrEqual(selectors.district, datum.district) &&
			_notSetOrEqual(selectors.upperdistrict, datum.upperdistrict) &&
			_notSetOrEqual(selectors.year, datum.year) &&
			_notSetOrEqual(selectors.indicator, datum.indicator)) {

			result.push(datum);
		}
	}

	return result;
}

/* params = {
	// selectors: could be undefined
	[district: "...",]
	[upperdistrict: "...",]
	[year: ...,]
	[indicator: "...",]

	// if no value presented for this request.
	[default: undefined,]

	// function which be used for folding values on multi-requests
	// 		default is "sum"
	[aggregator: "max"|"min"|"sum"|function|"minmax,]

	// initial value.
	// default is 0 for sum and unknown functions,
	//            Number.POSITIVE_INFINITY for min,
	//            Number.NEGATIVE_INFINITY for max
	[initial: 0,]
}
*/
function getCrimesValue(params) {
	// var selectorsKeys = ["district", "upperdistrict", "year", "indicator",];

	var foldingFunc = params.aggregator;
	var result = params.initial;
	if (!foldingFunc) {
		foldingFunc = "sum";
	}

	if (foldingFunc == "sum") {
		foldingFunc = _sum;
		if (result === undefined) {
			result = 0;
		}
	} else if (foldingFunc == "max") {
		foldingFunc = Math.max;
		if (result === undefined) {
			result = Number.NEGATIVE_INFINITY;
		}
	} else if (foldingFunc == "min") {
		foldingFunc = Math.min;
		if (result === undefined) {
			result = Number.POSITIVE_INFINITY;
		}
	} else if (foldingFunc == "minmax") {
		foldingFunc = _minmax;
		if (result === undefined) {
			result = {
				min: Number.POSITIVE_INFINITY,
				max: Number.NEGATIVE_INFINITY
			};
		}
	}

	var crimes = selectCrimes(params);
	if (crimes.length == 0) {
		return params.default;
	}

	for (var i = 0; i < crimes.length; ++i) {
		result = foldingFunc(result, crimes[i].value);
	}

	return result;
}

var _cachedPopulations;
// params: district or upperdistrict
function getPopulation(params) {
	if (!_cachedPopulations) {
		_cachedPopulations = {
			districts: {},
			upperdistricts: {},
		};

		for (var i = 0; i < kCrimesData.length; ++i) {
			var datum = kCrimesData[i];
			if (datum.indicator == "population") {
				_cachedPopulations.districts[datum.district] = datum.value;
				_cachedPopulations.upperdistricts[datum.upperdistrict] = datum.value;
			}
		}
	}

	if (params.district) {
		return _cachedPopulations.districts[params.district];
	} else {
		return _cachedPopulations.upperdistricts[params.upperdistrict];
	}
}
