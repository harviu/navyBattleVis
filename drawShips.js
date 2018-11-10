latestTime = new Date(1945,7,15);
earliestTime = new Date(1941,11,7);
timeRange = Math.round((latestTime-earliestTime)/60/60/1000/24);
timeSlider = document.getElementById("timeSlider");
timeSlider.max = timeRange;
timeSlider.value = 0;
currentTime = earliestTime;

let timeScaler = d3.scaleTime()
    .domain([earliestTime,latestTime])
    .range([0, 1200]);
let timeSliderAxis= d3.axisBottom(timeScaler);
axis = d3.select("#Axis");
axis.append("svg")
    .call(timeSliderAxis.tickFormat(d3.timeFormat("%Y-%m")))
    .style('width',1200)
    .style('height',20)


mapSvg = d3.select("#Map").select('svg');

d3.json("ships.json", function(error, data) {
    let geo=[];
    for (ship of data){
        coordinates =[];
        
        for (event of ship.events){
            let coord = event.geometry.split(',');
            co =[];
            co[0] = parseFloat(coord[1]);
            co[1] = parseFloat(coord[0]);
            coordinates.push(co);
        }
        geo.push(coordinates);
    }
    console.log(geo);
    
    let shipsGroup = mapSvg.append('g');

    for (let i in geo){
        let ship = shipsGroup.append("g");
        ship.selectAll("*")
            .data(geo[i]).enter().append("circle")
            .attr("cx", function (d) {
                // if (projection(d)[0]==NaN){
                    console.log(d);
                    
                // }
                return projection(d)[0]; 
            })
            .attr("cy", function (d) { return projection(d)[1]; })
            .attr("r", "2px")
            .attr("fill", "red")
    }
    
});

function setTime(time){
    currentTime = new Date(earliestTime.getTime() + time * 60*60*1000*24);
}