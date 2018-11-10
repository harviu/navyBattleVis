
latestTime = new Date(1945,7,15);
earliestTime = new Date(1941,11,7);
timeRange = Math.round((latestTime-earliestTime)/60/60/1000/24);
timeSlider = document.getElementById("timeSlider");
timeSlider.max = timeRange;
timeSlider.value = 0;
currentTime = earliestTime;

let timeScaler = d3.scaleTime()
    .domain([earliestTime,latestTime])
    .range([0, 800]);
let timeSliderAxis= d3.axisBottom(timeScaler);
axis = d3.select("#Axis");
axis.append("svg")
    .call(timeSliderAxis.tickFormat(d3.timeFormat("%Y-%m")))
    .style('width',820)
    .style('height',30)


var projection = d3.geoMercator()
.center([0, 25 ])
.scale(250)
.rotate([-180,0]);

var path = d3.geoPath()
.projection(projection);



d3.json("ships.json", function(error, data) {
    for (ship of data){
        for (event of ship.events){
            tempDate = new Date(event.date);
            if (tempDate>latestTime) latestTime = tempDate;
            if (tempDate<earliestTime) earliestTime = tempDate;
        }
    }
    console.log(latestTime);
    console.log(earliestTime);
    
});

function setTime(time){
    currentTime = new Date(earliestTime.getTime() + time * 60*60*1000*24);
}