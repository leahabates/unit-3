//insert code here!
var w = 900, h = 500;

//execute script when window is loaded
window.onload = function(){

    var container = d3.select("body") //get the <body> element from the DOM
    	.append("svg") //put a new svg in the body
    	.attr("width", w) // assigning the width
    	.attr("height", h) // assigning the height
    	.attr("class", "container") //always assign a class (as the block name) for styling and future selection
    	.style("background-color", "rgba(0,0,0,0.2)"); // only add a semicolon at the end of a block 

    //innerRect block
    var innerRect = container.append("rect") //put a new rect in the svg
    	.datum(400)
    	.attr("width", function(d){ // rectangle width
    		return d * 2; //400*2
    	}) 
    	.attr("height", function(d){ // rectangle height
    		return d; //400
    	}) 
    	.attr("class", "innerRect") // class name
    	.attr("x", 50) // position from left on the x (horizontal) axis
    	.attr("y", 50) // position from top on the y (vertical) axis
    	.style("fill", "#FFFFFF") // the fill color

     var cityPop = [
        { 
            city: 'Madison',
            population: 233209
        },
        {
            city: 'Milwaukee',
            population: 594833
        },
        {
            city: 'Green Bay',
            population: 104057
        },
        {
            city: 'Superior',
            population: 27244
        }
    ];

    //Example 2.6 line 3
    var circles = container.selectAll(".circles") //create an empty selection
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe
        .append("circle") //inspect the HTML--holy crap, there's some circles there
        .attr("class", "circles")
        .attr("id", function(d){
            return d.city;
        })
        .attr("r", function(d){
            //calculate the radius based on population value as circle area
            var area = d.population * 0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx", function(d, i){
            //use the index to place each circle horizontally
            return 90 + (i * 180);
        })
        .attr("cy", function(d){
            //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
            return 450 - (d.population * 0.0005);
        });

};