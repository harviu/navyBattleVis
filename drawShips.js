
var projection = d3.geoMercator()
.center([0, 25 ])
.scale(250)
.rotate([-180,0]);

var path = d3.geoPath()
.projection(projection);



d3.json("ships.json", function(error, data) {
    latestTime = new Date(1800,0,1);
    earliestTime = new Date(2018,0,1);
    for (ship of data){
        for (event of ship.events){

        }
    }

});