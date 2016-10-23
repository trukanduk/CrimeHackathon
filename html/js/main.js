var activeYear = undefined;
var activeIndicator = "drugs";
var activeNormalize = true;

var kValidIndicators = [
	"gravecrimes",
	"healthdamage",
	"robbing",
	"banditry",
	"thefts",
	"burglary",
	"carthefts",
	"fraud",
	"hijacking",
	"murders",
	"drugs",
]

function selectSlice(year, indicator, normalize) {
	if (year === undefined) {
		year = activeYear;
	}
	if (indicator === undefined) {
		indicator = activeIndicator;
	}
	if (normalize === undefined) {
		normalize = activeNormalize;
	}

	if (!kValidIndicators.find(function(v) { return v == indicator; })) {
		indicator = kValidIndicators[0];
	}

	activeYear = year*1;
	activeIndicator = indicator;
	activeNormalize = normalize;

	$("#year-dropdown-header-label").html(year + "");
	$("#indicators-wrap .indicator-button").removeClass("active");
	$("#indicators-wrap #indicator-button-" + indicator).addClass("active");

	if (map) {
		map.setSlice(activeYear, activeIndicator, activeNormalize);
	}

	// TODO: charts
}

function selectYear(year) {
	selectSlice(year);
}

function _initYears() {
	var yearsSet = {};
	for (var i = 0; i < kCrimesData.length; ++i) {
		yearsSet[kCrimesData[i].year] = true;
	}

	var years = [];
	for (var key in yearsSet) {
		years.push(key);
	}

	years.sort();

	var parent = $("#dropdown-year-values");
	for (var i = years.length - 1; i >= 0; --i) {
		var li = $("<li/>", {});
		$("<a role='button' class='year-selection-button' year='" + years[i] + "'>" +
			years[i] +
		  "</a>").appendTo(li)
		.on("click", function() { console.log(this); selectYear($(this).attr("year")); });

		li.appendTo(parent);
	}

	selectYear(years[years.length - 1]);
	return years
}

function selectIndicator(indicator) {
	selectSlice(undefined, indicator);
}

function _initIndicators() {
	var parent = $("#indicators-wrap");
	for (var i = 0; i < kValidIndicators.length; ++i) {
		var indicator = kValidIndicators[i];

		$("<button class='indicator-button'" +
			"id='indicator-button-" + indicator + "'" +
			" name='" + indicator + "'>" +
				indicator +
			"</button>")
		.on("click", function() { selectIndicator($(this).attr("name")); })
		.appendTo(parent);
	}

	selectIndicator("banditry");
}

$(document).ready(function() {
	_initYears();
	_initIndicators();

	$("#normalize-checkbox").on("change", function(e) {
		console.log(this, $(this).is(":checked"));
		selectSlice(undefined, undefined, $(this).is(":checked"));
	});
});
