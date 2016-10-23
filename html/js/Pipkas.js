var kPipkasInfo = [
	{
		request: "Вокзал",
		image: "img/pipkas/train_stations.png",
	},
	// {
	// 	request: "Униветситет",
	// 	image: "img/pipkas/university.png",
	// },
];
// var kImageSize = [0.008, 0.015];
var kImageSize = [0.003, 0.006];

function _processPipkas(info) {
	ymaps.geocode(info.request, {
        boundedBy: [[55.935111, 36.787707], [55.400643, 37.901995]],
        results: 30
    }).then(function (res) {
    	try {
    	for (var i = 0; i < 30; ++i) {
    		var obj = res.geoObjects.get(i);
    		if (!obj) {
    			break;
    		}
    		// if (!res.geoObjects.get(i)) {
		    // 	console.error("dfghjk: ", i);
    		// 	break;
    		// }

	        var coords = obj.geometry.getCoordinates();
	        if (!map) {
	        	console.warn("Map is not ready!");
	        	return;
	        }

	    	var imageBounds = [
	    		[coords[0] - kImageSize[0], coords[1] - kImageSize[1]],
	    		[coords[0] + kImageSize[0], coords[1] + kImageSize[1]],
	    	];
	    	L.imageOverlay(info.image, imageBounds).addTo(map.map);
	    }
	    console.info("Done: ", info.request, i);
		} catch (e) { console.error(e); }
    });
}

function _initPipkas() {
	for (var i = 0; i < kPipkasInfo.length; ++i) {
	    _processPipkas(kPipkasInfo[i]);
	}
}

$(document).ready(function() {
	ymaps.ready(_initPipkas);
});
