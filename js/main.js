//insert code here!
window.onload = setMap;

//set up choropleth map
function setMap(){
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

		var californiaCounties = topojson.feature(california, california.objects.calicounty);

	//examine results
		console.log(californiaCounties);

	}
};
