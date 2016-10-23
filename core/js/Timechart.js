var timechart;

function Timechart(canvas) {
	this.canvas = $(canvas);
	this.ctx = this.canvas.get(0).getContext("2d");

	this.chart = new Chart(ctx, {
	    type: 'line',
	    data: {
	        labels: ["2012", "2013", "2014", "2015", "2016"],
	        datasets: [{
	            label: '# of Votes',
	            data: [12, 19, 3, 5, 2, 3],
	            backgroundColor: '#fff'
	        }]
	    },
	    options: {
            fontColor: 'white',
            strokeStyle: 'white',
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

Timechart.prototype.setSlice = function(crimeTypes, districts) {

};

$(document).ready(function() {
	var canvas = $("#timechart");
	timechart = new Timechart(canvas);
});
