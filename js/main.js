//insert code here!
window.onload = setMap;

//set up choropleth map
function setMap(){

	// map frame dimenstions
	var width = 960,
		height = 460;

	// new svg container for the map
	var map = d3.select("body")
		.append("svg")
		.attr("class", "map")
		.attr("width", width)
		.attr("height", height);

	// create projection centered on California
	var projection = d3.geoAlbers()
		.center([-.4179, 36.7783])
		.rotate([120, 0, 0])
		.parallels([30, 45])
		.scale(2300)
		.translate([width / 2, height / 2]);

	var path = d3.geoPath()
		.projection(projection);

	//using promise.all() to parallelize asynchronous data loading
	var promises = [
		d3.csv ("data/calihealth.csv"),
		d3.json("data/calicounty.topojson")
	];
	Promise.all(promises).then(callback);

	function callback(data){
		var csvData = data[0];
		var	california = data[1];
		console.log(csvData);
		console.log(california);

		var californiaCounties = topojson.feature(california, california.objects.calicounty).features;

		//examine results
		console.log(californiaCounties);

		var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

         var gratBackground = map.append("path")
            .datum(graticule.outline()) //bind graticule background
            .attr("class", "gratBackground") //assign class for styling
            .attr("d", path) //project graticule

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines

         // add california counties to the map
		var counties = map.selectAll(".county")
			.data(californiaCounties)
			.enter()
			.append("path")
			.attr("class", function (d){
				return "county" + d.properties.NAME;
			})
			.attr("d", path);
			


	}
};
