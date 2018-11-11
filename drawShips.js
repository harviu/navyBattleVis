const TIME_WIDTH=1400;
let bbsvg,casvg,cvsvg,data;
let geo=[];
latestTime = new Date(1945,9,1);
earliestTime = new Date(1941,6,1);
timeRange = Math.round((latestTime-earliestTime)/60/60/1000/24);
timeSlider = document.getElementById("timeSlider");
timeSlider.max = timeRange;
timeSlider.value = 0;
timeSlider.style.width=TIME_WIDTH+'px';
currentTime = new Date(earliestTime.getTime() + timeSlider.value * 60*60*1000*24);

let timeScaler = d3.scaleTime()
    .domain([earliestTime,latestTime])
    .range([0, TIME_WIDTH]);
let timeSliderAxis= d3.axisBottom(timeScaler);
axis = d3.select("#Axis");
axis.append("svg")
    .call(timeSliderAxis.tickFormat(d3.timeFormat("%Y-%m")))
    .style('width',TIME_WIDTH)
    .style('height',20)

d3.queue()
    .defer(d3.json,'ships.json')
    .defer(d3.xml,"BB.svg")
    .defer(d3.xml,"CV.svg")
    .defer(d3.xml,"CA.svg")
    .await(load);




function draw(){
    var link = d3.line()
     .x(function(d) {return d[0]; })
     .y(function(d) { return d[1]; })

    let resGeo = [];

    for (const ship of data){
        coordinates =[];
        resCo = [];
        coordinates.country = ship.Country;
        resCo.country = ship.Country;
        for (const event of ship.events){
            
            let coord = event.geometry.split(',');
            co =[];
            co[0] = parseFloat(coord[1]);
            co[1] = parseFloat(coord[0]);

            co =projection(co);

            // do not push if the position of out of scope
            if (co[0]>800 || co[0]<0) continue;

            co.date = new Date(event.date);

            //sort the date
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

            if (co.date<earliestTime || co.date>latestTime) continue;

            pushed =false;
            for (let i in resCo){
                if(co.date<=resCo[i].date){
                    resCo.splice(i,0,co);
                    pushed =true;
                    break;
                }
            }
            if (! pushed)
                resCo.push(co);
        }
        resGeo.push(resCo);
        geo.push(coordinates);
    }
    console.log(resGeo);
    // console.log(geo);


    let shipsGroup = g.append('g');
    shipsGroup.selectAll("*")
        .data(resGeo).enter()
        .append("path")
        .attr("class", "line")
        .attr("d", link)
        .style("stroke", (d)=>{
            if(d.country =="Japan") return "red";
            else return "blue";
        })
        .style("stroke-width", "0.3px")
        .style("fill", "none")
        .style("opacity", "0.4")
    
    // bbNode = document.importNode(bbsvg.documentElement,true).lastElementChild;
    // cvNode = document.importNode(cvsvg.documentElement,true).lastElementChild;
    // caNode = document.importNode(casvg.documentElement,true).lastElementChild.astElementChild;

    // bbNode.id = 'bbsvg';
    // caNode.id ='casvg';
    // cvNode.id = 'cvsvg';
    // caNode.lastElementChild.classList.add('svgFile');
    // bbNode.classList.add('svgFile');
    // cvNode.classList.add('svgFile');

    drawIcon();
}

function drawIcon(){
    let shipsIcon = g.append('g');
    shipsIcon.selectAll("*")
        .data(geo).enter()
        .each(function(d,i){
            let x,y;
            if(d.length!=0){
                
                // calculate map projection
                if(currentTime<=d[0].date){
                    // x = d[0][0];
                    // y = d[0][1];
                    return false;
                }
                else if (currentTime>=d[d.length-1].date){
                    // x = d[d.length-1][0];
                    // y = d[d.length-1][1];\
                    return false;
                }else{
                    for(let j =0;j<d.length;j++){
                        if( currentTime>=d[j].date && currentTime<=d[j+1].date){
                            let per = (currentTime.getTime()-d[j].date.getTime())/(d[j+1].date.getTime()-d[j].date.getTime());
                            x = d[j][0]+per*(d[j+1][0]-d[j][0]);
                            y = d[j][1]+per*(d[j+1][1]-d[j][1]);
                            // console.log(per);
                            break;
                        }
                    }
                }

                
                if(isNaN(x)) console.log(d);
                let node;
                let scaleFactor;
                let iconColor;
                if(i<72) {
                    node = document.importNode(cvsvg.documentElement,true).lastElementChild;
                    scaleFactor = 0.035;
                    if (d.country == "Japan") iconColor = 'indianred'
                    else iconColor = 'dodgerblue'
                }else if(i<111){
                    node = document.importNode(bbsvg.documentElement,true).lastElementChild;
                    scaleFactor = 0.07;
                    if (d.country == "Japan") iconColor = 'firebrick'
                    else iconColor = 'darkblue'
                }else if(i<199){
                    node = document.importNode(casvg.documentElement,true).lastElementChild;
                    // console.log(node);
                    scaleFactor = 0.005;
                    if (d.country == "Japan") iconColor = 'salmon'
                    else iconColor = 'lightskyblue'
                }
                
                node.id='path'+i;
                node.classList.add('svgFile');
                this.appendChild(node);

                //coordinate to translate back to (0,0)
                bbox = node.getBBox();
                let xxx = -bbox.x-bbox.width/2;
                let yyy = -bbox.y-bbox.height/2;

                //Note: the transform center is originally at svg (0,0)
                if(i<111){
                    d3.select('#path'+i)
                        .style('fill',iconColor)
                        .attr("transform", "translate("+x+","+y+"),scale("+scaleFactor+"),translate("+xxx+","+yyy+")");
                }else{
                    d3.select('#path'+i)
                        .attr("transform", "translate("+x+","+y+"),scale(-"+scaleFactor+',-'+scaleFactor+"),translate("+xxx+","+yyy+")")
                        .selectAll("path")
                        .style('fill',iconColor)
                    
                }
            }
        });
}

function load(error, d,bbs,cvs,cas) {
    
    bbsvg = bbs;
    casvg = cas;
    cvsvg = cvs;
    data = d;
    draw();
    
}

function setTime(time){
    currentTime = new Date(earliestTime.getTime() + time * 60*60*1000*24);
    d3.selectAll(".svgFile").remove();
    drawIcon();
}