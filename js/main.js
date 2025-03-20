//insert code here!
(function () {
var attrArray = ["% Fair or Poor Health", "% Food Insecure", "Air Pollution", "Latitude", "Life Expectancy", "Longitude", 
                     "Median Household Income", "Name", "Obesity Rate", "Poverty Rate", "Unemployment Rate"];
var expressed = attrArray[0]; // Initial attribute 

	window.onload = setMap;

    // Main map setup function
    function setMap() {

        // Map frame dimensions
        var width = 960,
            height = 460;

        // New SVG container for the map
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        // Create projection centered on California
        var projection = d3.geoAlbers()
            .center([-.4179, 36.7783])
            .rotate([120, 0, 0])
            .parallels([30, 45])
            .scale(2300)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath().projection(projection);

        // Using Promise.all() to parallelize asynchronous data loading
        var promises = [
            d3.csv("data/calihealth.csv"),
            d3.json("data/calicounty.topojson"),
            d3.json("data/northamerica.topojson")
        ];
        Promise.all(promises).then(callback);

        function callback(data) {
            var csvData = data[0],
                california = data[1],
                northAmerica = data[2];

            console.log(csvData);
            console.log(california);
            console.log(northAmerica);

            // Convert TopoJSON into GeoJSON
            var northAmericaStates = topojson.feature(northAmerica, northAmerica.objects["North America"]),
                californiaCounties = topojson.feature(california, california.objects.calicounty).features;

            // Join CSV data to GeoJSON counties
            californiaCounties = joinData(californiaCounties, csvData);

            // Set graticule and map elements
            setGraticule(map, path);
            
            // Add states around California to the map
            setStates(map, path, northAmericaStates);

            //Create the color scale
            var colorScale = makeColorScale(csvData);
            
            // Add counties to the map
            setEnumerationUnits(californiaCounties, map, path, colorScale);
        }
    };

    // Set graticule (grid lines) on the map
    function setGraticule(map, path) {
        var graticule = d3.geoGraticule().step([5, 5]); // Place graticule lines every 5 degrees of longitude and latitude

        var gratBackground = map.append("path")
            .datum(graticule.outline()) // Bind graticule background
            .attr("class", "gratBackground") // Assign class for styling
            .attr("d", path); // Project graticule

        // Create graticule lines
        var gratLines = map.selectAll(".gratLines")
            .data(graticule.lines()) // Bind graticule lines to each element to be created
            .enter()
            .append("path")
            .attr("class", "gratLines")
            .attr("d", path);
    }

    // Add North America states around California
    function setStates(map, path, northAmericaStates) {
        map.append("path")
            .datum(northAmericaStates)
            .attr("class", "states")
            .attr("d", path);
    }

    // Join CSV data to GeoJSON counties
    function joinData(californiaCounties, csvData) {
        // Loop through the CSV to assign each set of CSV attribute values to GeoJSON region
        for (var i = 0; i < csvData.length; i++) {
            var csvRegion = csvData[i]; // The current region
            var csvKey = csvRegion.Name; // The CSV primary key

            // Loop through the GeoJSON region to find the correct region (county)
            for (var a = 0; a < californiaCounties.length; a++) {
                var geojsonProps = californiaCounties[a].properties; // The current county geoJSON properties
                var geojsonKey = geojsonProps.NAME; // GeoJSON primary key

                // Where primary keys match, transfer CSV data to GeoJSON properties object
                if (geojsonKey == csvKey) {
                    // Assign all attributes and values
                    attrArray.forEach(function (attr) {
                        var val = parseFloat(csvRegion[attr]);
                        if (!isNaN(val)) {
                            geojsonProps[attr] = val; // Assign attribute and value to GeoJSON properties
                        }
                    });
                }
            }
        }

        return californiaCounties; // Return modified counties with joined data
    }

    function makeColorScale(data){
    	var colorClasses = [
        	"#D4B9DA",
        	"#C994C7",
        	"#DF65B0",
        	"#DD1C77",
        	"#980043"];

    	//create color scale generator
   		 var colorScale = d3.scaleQuantile()
        .range(colorClasses);

    	//build array of all values of the expressed attribute
    	var domainArray = [];
    	for (var i=0; i<data.length; i++){
        	var val = parseFloat(data[i][expressed]);
        	domainArray.push(val);
    	};

    	//assign array of expressed values as scale domain
    	colorScale.domain(domainArray);

    	return colorScale;
	};

    // Set enumeration units (counties) on the map
    function setEnumerationUnits(californiaCounties, map, path, colorScale) {
        // Add California counties to the map
        var counties = map.selectAll(".county")
            .data(californiaCounties)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "county " + d.properties.NAME;
            })
            .attr("d", path)
            	.style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(d.properties[expressed]);            
                } else {                
                    return "#ccc";            
                }    
            });
    }
})();