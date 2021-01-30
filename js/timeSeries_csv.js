//表示するデータ
d3.csv("./data/timeSeriesData.csv").then(d => drawTimeSeries(d))
    
function drawTimeSeries(data) {
    
    var parseTime = d3.timeParse("%Y-%m-%d"),
        formatDate = d3.timeFormat("%Y-%m-%d"),
        bisectDate = d3.bisector(d => d.date).left,
        formatValue = d3.format(",.0f");

    data.forEach(function(d) {
        d.date = parseTime(d.date);
        return d;
    })

    var svg = d3.select("#timeSeries"),
        margin = {top: 5, right: -30, bottom: 5, left: 60},
        width = +document.getElementsByClassName('time-series')[0].clientWidth - margin.left - margin.right,
        height = +document.getElementsByClassName('time-series')[0].clientHeight - margin.top - margin.bottom - 80,
        height2 = 40,
        radius = (Math.min(width, height) / 2) - 10,
        node


    // focus だとクラス名が被るので、Spotlight として設計 
    var spotlight = svg.append('g')
        .attr('class', 'spotlight')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    var context = svg.append('g')
            .attr('class', 'context')
            .attr('transform', `translate(${margin.left}, ${margin.top + 550})`)


    // the date range of available data:
    var dataXrange = d3.extent(data, d => d.date);

    // maximum date range allowed to display
    var mindate = dataXrange[0],  // use the range of the data
        maxdate = dataXrange[1];
    
    var x = d3.scaleTime()
            .rangeRound([margin.left, width - margin.right])
            .domain(dataXrange)
    var x2 = d3.scaleTime()
            .rangeRound([margin.left, width - margin.right])
            .domain([mindate, maxdate])
    var y = d3.scaleLinear()
            .rangeRound([height - margin.bottom, margin.top]);
    var y2 = d3.scaleLinear()
            .rangeRound([height2 - margin.bottom, margin.top]);
    var z = d3.scaleOrdinal(d3.schemeCategory10);

    let xBand = d3.scaleBand().domain(d3.range(-1, data.length)).range([0, width])


    // === tick/date formatting functions ===
    // from: https://stackoverflow.com/questions/20010864/d3-axis-labels-become-too-fine-grained-when-zoomed-in

    function timeFormat(formats) {
        return function(date) {
          var i = formats.length - 1, f = formats[i];
          while (!f[1](date)) f = formats[--i];
          return f[0](date);
        };
      };
      
      
      // 20210124作業メモ  何で xTicks でない？なぜかすべて 1970 になっているよ。
      
      var dynamicDateFormat = timeFormat([
          [d3.timeFormat("%Y"), function() { return true; }],// <-- how to display when Jan 1 YYYY
          [d3.timeFormat("%b %Y"), function(d) { return d.getMonth(); }],
          [function(){return "";}, function(d) { return d.getDate() != 1; }]
      ]);


    var line = d3.line()
        //.curve(d3.curveCardinal)
        .x(d => x(d.date))
        .y(d => y(d.people));



    svg.append("g")
        .attr("class","x-axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickFormat(dynamicDateFormat));

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin.left + ",0)");

    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("line").attr("class", "lineHover")
        .style("stroke", "#999")
        .attr("stroke-width", 1)
        .style("shape-rendering", "crispEdges")
        .style("opacity", 0.5)
        .attr("y1", -height)
        .attr("y2",0);

    focus.append("text").attr("class", "lineHoverDate")
        .attr("text-anchor", "middle")
        .attr("font-size", 12);

    var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", margin.left)
        .attr("width", width - margin.right - margin.left)
        .attr("height", height)


    var keys = data.columns.slice(1);
    update(keys, 10);

    function update(input, speed) {

    var categories = input.map(function(id) {
        return {
            id: id,
            values: data.map(d => {return {date: d.date, people: +d[id]}})
        };
    });

    y.domain([
        d3.min(categories, d => d3.min(d.values, c => c.people)),
        d3.max(categories, d => d3.max(d.values, c => c.people))
    ]).nice();

    svg.selectAll(".y-axis").transition()
        .duration(speed)
        .call(d3.axisLeft(y).tickSize(-width + margin.right + margin.left))

    var category = svg.selectAll(".categories")
        .data(categories);

    category.exit().remove();

    category.enter().insert("g", ".focus").append("path")
        .attr("class", "line categories")
        .style("stroke", d => z(d.id))
        .merge(category)
    .transition().duration(speed)
        .attr("d", d => line(d.values))

    tooltip(keys);
    }

    function tooltip(keys) {

        var labels = focus.selectAll(".lineHoverText")
            .data(keys)

        labels.enter().append("text")
            .attr("class", "lineHoverText")
            .style("fill", d => z(d))
            .attr("text-anchor", "start")
            .attr("font-size",12)
            .attr("dy", (_, i) => 1 + i * 2 + "em")
            .merge(labels);

        var circles = focus.selectAll(".hoverCircle")
            .data(keys)

        circles.enter().append("circle")
            .attr("class", "hoverCircle")
            .style("fill", d => z(d))
            .attr("r", 2.5)
            .merge(circles);

        svg.selectAll(".overlay")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        function mousemove(event) {  // changed v6 event

            var x0 = x.invert(d3.pointer(event)[0]),  // changed v6 pointer
                i = bisectDate(data, x0, 1),
                d0 = data[i - 1],
                d1 = data[i],
                d = x0 - d0.date > d1.date - x0 ? d1 : d0;

            focus.select(".lineHover")
                .attr("transform", "translate(" + x(d.date) + "," + height + ")");

            focus.select(".lineHoverDate")
                .attr("transform", 
                    "translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
                .text(formatDate(d.date));

            focus.selectAll(".hoverCircle")
                .attr("cy", e => y(d[e]))
                .attr("cx", x(d.date));

            focus.selectAll(".lineHoverText")
                .attr("transform", 
                    "translate(" + (x(d.date)) + "," + height / 2.5 + ")")
                .text(e => e + " " + formatValue(d[e]) + " 人");

            x(d.date) > (width - width / 4) 
                ? focus.selectAll("text.lineHoverText")
                    .attr("text-anchor", "end")
                    .attr("dx", -10)
                : focus.selectAll("text.lineHoverText")
                    .attr("text-anchor", "start")
                    .attr("dx", 10)
        }
    }

}
