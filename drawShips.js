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

d3.queue()
    .defer(d3.json,'ships.json')
    .defer(d3.xml,"BB.svg")
    .defer(d3.xml,"CV.svg")
    .defer(d3.xml,"CA.svg")
    .await(draw);



function draw(error, data,bbsvg,cvsvg,casvg) {
    
    
    var link = d3.line()
     .x(function(d) {return d[0]; })
     .y(function(d) { return d[1]; })

    let geo=[];

    for (const ship of data){
        coordinates =[];
        
        for (const event of ship.events){
            
            let coord = event.geometry.split(',');
            co =[];
            co[0] = parseFloat(coord[1]);
            co[1] = parseFloat(coord[0]);

            co =projection(co);
            if (co[0]>800 || co[0]<0) continue;

            co.date = new Date(event.date);
            if (co.date<earliestTime || co.date>latestTime) continue;

            co.description = event.description;

            let pushed =false;
            for (let i in coordinates){
                if(co.date<=coordinates[i].date){
                    coordinates.splice(i,0,co);
                    pushed =true;
                    break;
                }
            }
            if (! pushed)
                coordinates.push(co);
        }
        geo.push(coordinates);
    }
    console.log(geo);

    let shipsGroup = g.append('g');
    shipsGroup.selectAll("*")
        .data(geo).enter()
        .append("path")
        .attr("class", "line")
        .attr("d", link);
    
    // bbNode = document.importNode(bbsvg.documentElement,true).lastElementChild;
    // cvNode = document.importNode(cvsvg.documentElement,true).lastElementChild;
    // caNode = document.importNode(casvg.documentElement,true).lastElementChild.astElementChild;

    // bbNode.id = 'bbsvg';
    // caNode.id ='casvg';
    // cvNode.id = 'cvsvg';
    // caNode.lastElementChild.classList.add('svgFile');
    // bbNode.classList.add('svgFile');
    // cvNode.classList.add('svgFile');

    let shipsIcon = g.append('g');
    shipsIcon.selectAll("*")
        .data(geo).enter()
        .each(function(d,i){
            let x,y;
            if(d.length!=0){
                
                if(currentTime<=d[0].date){
                    x = d[0][0];
                    y = d[0][1];
                }
                else if (currentTime>=d[d.length-1].date){
                    x = d[d.length-1][0];
                    y = d[d.length-1][1];
                }else{
                    for(let j in d){
                        if( currentTime>d[j].date && currentTime<d[j+1].date){
                            x = d[j][0];
                            y = d[j][1];
                            break;
                        }
                    }
                }
                // if(isNaN(x)) console.log(d)
                bbNode = document.importNode(bbsvg.documentElement,true).lastElementChild;
                bbNode.id='path'+i;
                bbNode.classList.add('svgFile');
                this.appendChild(bbNode);
                bbox = bbNode.getBBox();
                let xxx = -bbox.x-bbox.width/2;
                let yyy = -bbox.y-bbox.height/2;

                    
                d3.select('#path'+i)
                    .style('fill','bisque')
                    .attr("transform", "translate("+x+","+y+"),scale(0.05),translate("+xxx+","+yyy+")");
            }
        })
}

function setTime(time){
    currentTime = new Date(earliestTime.getTime() + time * 60*60*1000*24);
}