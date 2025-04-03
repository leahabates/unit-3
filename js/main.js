//insert code here!
(function () {
var attrArray = ["% Fair or Poor Health", "% Food Insecure", "Air Pollution", "Life Expectancy", 
                     "Median Household Income", "Obesity Rate", "Poverty Rate", "Unemployment Rate"];
var expressed = attrArray[0]; // Initial attribute 

// Chart frame dimensions
var chartWidth = window.innerWidth * 0.475,
    chartHeight = 473,
    leftPadding = 45,
    rightPadding = 2,
    topBottomPadding = 5,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

// Create a scale to size bars proportionally to frame
var yScale = d3.scaleLinear()
    .range([463,0])
    .domain([0,28]);

window.onload = setMap;

    // Main map setup function
    function setMap() {

        // Map frame dimensions
        var width = window.innerWidth * 0.5,
            height = window.innerHeight * 1;

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

        var descriptionContainer = d3.select("body").append("div")
            .attr("class", "description-container")
            .style("position", "absolute")
            .style("bottom", "20px")
            .style("right", "5px")
            .style("background", "#000")
            .style("color", "#FFF")
            .style("border-radius", "5px")
            .style("font-family", "Arial, sans-serif")
            .style("width", window.innerWidth * 0.45 + "px")
            .style("height", window.innerHeight * 0.46 +"px")
            .html(`
                 <h3>Socioeconomic Health Indicators in California</h1>
                <p>In California, the overall well-being of its population is shaped by several key socioeconomic and environmental factors. These indicators provide crucial insights into the health challenges faced by different communities. Below, we explore some of the most important factors impacting public health.</p>
                The <strong>percentage of individuals reporting fair or poor health</strong> is a critical measure of the population’s overall health. This indicator reflects the number of people who struggle with chronic illnesses or conditions that affect their quality of life. Poor health status can be linked to several other socioeconomic factors, such as income and access to healthcare.
                
                The <strong>percentage of food insecure individuals</strong> highlights the lack of access to sufficient nutritious food. This issue is closely tied to both <strong>physical health</strong> and <strong>mental well-being</strong>, as food insecurity can lead to malnutrition, stress, and a greater risk of chronic diseases. Areas with higher food insecurity often experience poorer health outcomes.
                
                <strong>Air pollution</strong> is a significant environmental factor affecting public health. Poor air quality can cause respiratory diseases and worsen conditions like asthma, particularly in <strong>vulnerable communities</strong>. High pollution levels often correlate with areas of higher poverty, exacerbating health disparities across California.
                
                <strong>Life expectancy</strong> is an important indicator of overall health outcomes in California. It reflects the average number of years a person can expect to live, which is strongly influenced by other factors such as access to healthcare, lifestyle, and environmental conditions. <strong>Life expectancy can vary significantly</strong> between regions, with those in more deprived areas often experiencing lower life expectancies due to higher rates of illness and limited healthcare access.
                
                <strong>Median household income</strong> plays a central role in shaping the health of Californians. Those in higher-income households generally have <strong>better access to healthcare</strong>, healthier living environments, and more opportunities for education. In contrast, those living in poverty are more likely to face <strong>health challenges</strong> related to housing instability, inadequate nutrition, and limited access to health resources.
                
                The <strong>obesity rate</strong> is another significant health concern. Obesity is a known risk factor for various chronic diseases, including <strong>diabetes</strong>, <strong>heart disease</strong>, and certain <strong>cancers</strong>. Socioeconomic factors such as income, food insecurity, and access to healthy lifestyles all contribute to the obesity epidemic, which disproportionately affects lower-income populations.
               
                The <strong>poverty rate</strong> directly impacts health outcomes. High poverty rates correlate with increased <strong>health disparities</strong>, as people living in poverty often experience poor living conditions, limited access to quality healthcare, and increased stress. Poverty is also linked to higher rates of <strong>chronic illness</strong> and <strong>mental health issues</strong>.
                
                The <strong>unemployment rate</strong> is a key socio-economic indicator of economic stability. High unemployment often leads to <strong>financial strain</strong>, which in turn can cause stress, worsen mental health, and limit access to healthcare and other resources. <strong>Joblessness</strong> is frequently associated with poorer health outcomes, especially in communities facing other socioeconomic challenges.
                
                Together, these attributes form a comprehensive picture of the <strong>socioeconomic health challenges</strong> faced by Californians. High levels of food insecurity, poverty, and unemployment—along with poor environmental factors such as air pollution—significantly impact public health outcomes. Addressing these issues requires <strong>targeted interventions</strong> in the most affected communities to improve overall health and well-being across the state.
                <h3>Sources: County Health Rankings & Roadmaps (https://www.countyhealthrankings.org/health-data/california?year=2024&mapView=state)</h3>
                `);

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

            // Add coordinated visualization to the map
            setChart(csvData, colorScale);

            // Create the dropdown for attribute selection
            createDropdown(csvData);

            // Add the intial legend
            setLegend(colorScale, csvData);
        }
    }; // End of setMap()

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
            var csvKey = csvRegion.NAME; // The CSV primary key

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
    	var colorClasses = ['#ffffd4','#fed98e','#fe9929','#d95f0e','#993404'];

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
                return "county " + d.properties.NAME.replace(/\s+/g, "_");
            })
            .attr("d", path)
            	.style("fill", function(d){            
                var value = d.properties[expressed];            
                if(value) {                
                    return colorScale(d.properties[expressed]);            
                } else {                
                    return "#ccc";            
                }    
            })
            .on("mouseover", function(event, d){
                highlight(d.properties);
                moveLabel(d.properties);
            })
            .on("mouseout", function(event, d){
                dehighlight(d.properties);
            })
            

        var desc = counties.append("desc")
            .text('{"stroke": "#FFF" , "stroke-width" : "1px"}');
    }
    //function to create a coordinated bar chart
    function setChart(csvData, colorScale){

        // Create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        // Create a rectangel for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", chartBackground)
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        // Set bars for each county
         var bars = chart.selectAll(".bar")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a, b){
                return b[expressed]-a[expressed]
            })
            .attr("class", function(d){
                return "bar " + d.NAME.replace(/\s+/g, "_");
            })
            .attr("width", chartInnerWidth / csvData.length - 1)
            .on("mouseover", function (event, d){
                highlight(d);
                moveLabel(d)
            })
            .on("mouseout", function(event, d){
                dehighlight (d)
            });
            
        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');

        // Create a text element for the Chart title
        var chartTitle = chart.append("text")
            .attr("x", chartWidth/2 )
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .attr("class", "chartTitle")
            .text("The " + expressed + " in each county in California");

        // Create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        // Place Axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //Create frame for chart border

        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        updateChart(bars, csvData.length, colorScale);
    };

    // Function to create a dropdown menu for attribute selection
    function createDropdown(csvData){
        // Add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .on("change", function(){
                changeAttribute(this.value, csvData)
            });

        // Add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Attribute");

        // Add attribute name options
        var attrOptions = dropdown.selectAll("attrOption")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };
    //Dropdown change event handler
    function changeAttribute(attribute, csvData){
        // change the expressed attribute 
        expressed = attribute;

        // Recreate the color scale 
        var colorScale = makeColorScale(csvData);

        var domainArray = [];
        for (var i = 0; i < csvData.length; i++) {
            var val = parseFloat(csvData[i][expressed]);
            if (!isNaN(val)) domainArray.push(val);
        }

        // dynamically update the domain for the yScale
        var minVal = d3.min(domainArray);
        var maxVal = d3.max(domainArray);

        var buffer = (maxVal - minVal) * 0.05;

        yScale.domain([Math.max(0, minVal - buffer), (maxVal+ buffer)]); 

        // Recolor enumerated untis
        var counties = d3.selectAll(".county")
            .transition()
            .duration(1000)
            .style("fill", function (d){
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(d.properties[expressed]);
                 } else {
                     return "#ccc"
            }
        });
        // Sort, Resize, and Recolor the bars
        var bars = d3.selectAll(".bar")
            // Sort
            .sort(function(a, b){
                return b[expressed]-a[expressed];
            })
            .transition() // Add animation
            .delay(function (d, i){
                return i *20
            })
            .duration(250)
        
        updateChart(bars, csvData.length, colorScale);

        //Update legend
        d3.select(".legend").remove()
        setLegend(colorScale, csvData);

        var yAxis = d3.axisLeft()
            .scale(yScale);

        d3.select(".axis")
            .transition()
            .duration(1000)
            .call(yAxis);

    };
    // Function to set position, size, and color of the bar in chart
    function updateChart(bars, n, colorScale) {
        // Position bars
        bars.attr("x", function(d, i) {
                return i * (chartInnerWidth/n) + leftPadding})
            // Size/Resize of bars
            .attr("height", function(d, i){
                return chartInnerHeight - yScale(parseFloat(d[expressed]))
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })            
            // Color/Recolor bars
             .style("fill", function(d){            
            var value = d[expressed];            
            if(value) {                
                return colorScale(value);            
            } else {                
                return "#ccc";            
            }    
        });
         // Update the chart title
        var chartTitle = d3.select(".chartTitle")
            .text("The " + expressed + " in each count in California");
    };
    // Function to highlight enumeration units and bars
    function highlight(props) {
        
        var countyName = props.NAME.replace(/\s+/g, "_");
    
        var selectedCounty = d3.selectAll("." + countyName)

    // Highlight map elements (counties)
        selectedCounty
            .style("stroke", "red")
            .style("stroke-width", "3")

        // Make the highlighted county on top
        selectedCounty.each(function(){
            this.parentNode.appendChild(this)
        });

    // Highlight chart elements (bars)
        var selectedBar = d3.selectAll("." + countyName)
            .style("stroke", "red")
            .style("stroke-width", "2");
            
        //dynamic lables
       setLabel(props)
};

    function getStyle(element, styleName) {
        var styleText = d3.select(element)
                .select("desc")
                .text();


        var styleObject = JSON.parse(styleText);
                return styleObject[styleName];

        };

    // Function to reset the element style on mouseout
    function dehighlight(props) {
        
        var countyName = props.NAME.replace(/\s+/g, "_");

        // Reset map elements (counties)
        var selectedMap = d3.selectAll("." + countyName)
            .style("stroke", function() {
                return getStyle(this, "stroke");
         })
            .style("stroke-width", function() {
                return getStyle(this, "stroke-width");
        });

    // Reset chart elements (bars)
        var selectedBar = d3.selectAll("." + countyName)
            .style("stroke", function() {
                return getStyle(this, "stroke");
            })
            .style("stroke-width", function() {
                return getStyle(this, "stroke-width");
            });


        d3.select(".infolabel").remove()
        
        };

    // Function to create dynamic lables
    function setLabel(props){
    //label content
        var labelAttribute = "<h1>" + props[expressed] +
        "</h1><b>" + expressed + "</b>";

    //create info label div
        var infolabel = d3.select("body")
            .append("div")
            .attr("class", "infolabel")
            .attr("id", props.NAME + "_label")
            .html(labelAttribute);

        var regionName = infolabel.append("div")
            .attr("class", "labelname")
            .html(props.NAME);
        };

    //function to move info label with mouse
    function moveLabel(){
    //get width of label
        var labelWidth = d3.select(".infolabel")
            .node()
            .getBoundingClientRect()
            .width;

    //use coordinates of mousemove event to set label coordinates
        var x1 = event.clientX + 10,
            y1 = event.clientY - 75,
            x2 = event.clientX - labelWidth - 10,
            y2 = event.clientY + 25;

    //horizontal label coordinate, testing for overflow
        var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
        //vertical label coordinate, testing for overflow
        var y = event.clientY < 75 ? y2 : y1; 

        d3.select(".infolabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };

    // Function to create a legen
    function setLegend(colorScale, csvData){
        // define the legen size and position
        var legendWidth = window.innerWidth * 0.25,
            legendHeight = window.innerHeight * 0.1;

        // get map height dynamically
        var mapHeight = d3.select(".map").node().getBoundingClientRect().height;

        // Calculate the position from the bottom
        var bottomMargin = mapHeight;

        //create the SVG for the legend
        var legend = d3.select("body")
            .append("svg")
            .attr("class", "legend")
            .attr("width", legendWidth)
            .attr("height", legendHeight + 30)
            .attr("transform", "translate(" + (leftPadding + chartWidth + 50) + "," + bottomMargin + ")");
            

        // define the color classes (range) and labels
        var colorClasses = colorScale.range();
        var classLabels = [];

        for (var i = 0; i < colorClasses.length; i++) {
            //Get the range for each color class 
            var minVal = colorScale.invertExtent(colorClasses[i])[0];
            var maxVal = colorScale.invertExtent(colorClasses[i])[1];
            classLabels.push(`${Math.round(minVal)} - ${Math.round(maxVal)}`);
        }

        legend.append("text")
            .attr("class", "legendTitle")
            .attr("x", 5)
            .attr("y", 14)  // Adjust Y positioning
            .style("font-size", "16px") // Make the title larger
            .style("font-weight", "bold")
            .style("fill", "#FFF") // Ensure it's white and visible
            .text("Legend: " + expressed);

        // Create a group for the legend items
        var legendItem = legend.selectAll(".legendItem")
            .data(colorClasses)
            .enter()
            .append("g")
            .attr("class", "legendItem")
            .attr("transform", function (d, i){
                return "translate(0," + (i * 20 ) + ")";
            });

        //create a rectange for each color class
        legendItem.append("rect")
            .attr("width", legendWidth / colorClasses.length)
            .attr("height", 15)
            .attr("y", 20)
            .style("fill", function (d){ return d; });

        //add labels
        legendItem.append("text")
            .attr("x", (legendWidth / colorClasses.length))
            .attr("y", 30)
            .attr("text-anchor","start")
            .text(function(d, i){ return classLabels[i]; });
    };
})();