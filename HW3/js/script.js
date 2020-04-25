const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928']

// Part 1: Создать шкалы для цвета, радиуса и позиции 
const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);

const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);
const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append("g")
        .attr("transform", "translate(" + d_width / 2 + "," + d_height / 2 + ")");

const donut_lable = d3.select('.donut-chart').append('text')
        .attr('class', 'donut-lable')
        .attr("text-anchor", "middle")
        .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);
const tooltip = d3.select('.tooltip');

//  Part 1 - Создать симуляцию с использованием forceCenter(), forceX() и forceCollide()
const simulation = d3.forceSimulation();

d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    console.log(data);
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    
    // Part 1 - задать domain  для шкал цвета, радиуса и положения по x
    let xRange = data.map(d => +d['release year']);
    x.domain([d3.min(xRange), d3.max(xRange)]);
    let colorRange = data.map(d => d['rating']);
    color.domain(colorRange);
    let radiusRange = data.map(d => +d['user rating score']);
    radius.domain([d3.min(radiusRange), d3.max(radiusRange)]);



    // Part 1 - создать circles на основе data
    var nodes = bubble
        .selectAll("circle").data(data)
            .enter()
            .append('circle')
            .on('mouseover', overBubble)
            .on('mouseout', outOfBubble);

    console.log('i am here');
    // Part 1 - передать данные в симуляцию и добавить обработчик события tick
    simulation.nodes(data)
        .force("x", d3.forceX().x(function(d) { return x(+d['release year']); }))
        .force("collide", d3.forceCollide().radius(function(d) { return radius(+d['user rating score']); }))
        .force("center", d3.forceCenter(b_width / 2, b_height / 2))
        .on("tick", ticked);

    function ticked() {
        nodes.enter()
            .append('circle')
            .merge(nodes)
            .attr('r', function(d) {
              return radius(+d['user rating score']);
            })
            .attr('fill', function(d) {
              return color(d['rating']);
            })
            .attr('cx', function(d) {
              return d.x;
            })
            .attr('cy', function(d) {
              return d.y;
            })
            .attr('id', function(d) {
                return d['rating']
            });

        nodes.exit().remove();
    }

    console.log(ratings);

    var pie = d3.pie()
        .value(function(d) { return d.value; });

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    donut.selectAll('path')
        .data(pie(ratings))
        .enter().append('path')
        .attr('d', d3.arc()
            .innerRadius(150)         // This is the size of the donut hole
            .outerRadius(250)
        )
        .attr('fill', function(d){ console.log(d); return color(d.data.key); })
        .attr("stroke", "white")
        .style("stroke-width", "4px")
        .style("opacity", 0.7)
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    function overBubble(d){
        console.log(d);
        // Part 2 - задать stroke и stroke-width для выделяемого элемента

        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "2px");
        // Part 3 - обновить содержимое tooltip с использованием классов title и year

        tooltip.html(d['title'] + '</br>' + d['release year']);

        // Part 3 - изменить display и позицию tooltip
        tooltip
            .style("left", (d3.mouse(this)[0] + 40) + "px")
            .style("top", (d3.mouse(this)[1]) + "px")
            .style('display', 'block')
    }
    function outOfBubble(){

        d3.select(this)
            .style("stroke", "black")
            .style("stroke-width", "0");
            
        // Part 3 - изменить display у tooltip
        tooltip
            .style('display', 'none')
    }

    function overArc(d){
        console.log(d);
        // Part 2 - изменить содержимое donut_lable

        donut_lable.text(d.data.key);
        // Part 2 - изменить opacity арки

        d3.select(this)
            .style("opacity", 0.3);

        // Part 3 - изменить opacity, stroke и stroke-width для circles в зависимости от rating
        d3.selectAll('circle')
            .style('opacity', 0.3);

        d3.selectAll('#' + d.data.key)
            .style('opacity', 1)
            .style('stroke', 'black')
            .style('stroke-width', '2px')
    }
    function outOfArc(){
        // Part 2 - изменить содержимое donut_lable
        donut_lable.text('');
        // Part 2 - изменить opacity арки

        d3.select(this)
            .style("opacity", 0.7);

        // Part 3 - вернуть opacity, stroke и stroke-width для circles

        d3.selectAll('circle')
            .style('opacity', 1)
            .style('stroke-width', '0');

    }
});