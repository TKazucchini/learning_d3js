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
    margin = {top: 5, right: -5, bottom: 5, left: 60},
    width = +document.getElementsByClassName('time-series')[0].clientWidth - margin.left - margin.right,
    height = +document.getElementsByClassName('time-series')[0].clientHeight - margin.top - margin.bottom;

    var x = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain(d3.extent(data, d => d.date))

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top]);

    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        //.curve(d3.curveCardinal)
        .x(d => x(d.date))
        .y(d => y(d.people));


    let xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%Y"))
    let yAxis = d3.axisLeft(y).tickSize(-width + margin.right + margin.left)


    svg.append("g")
        .attr("class","x-axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", "translate(" + margin.left + ",0)");


    /****************************
    focus (メインで描画される領域について)
    ****************************/

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

    // overlay クラスの svg タグを作成する
    var overlay = svg.append("rect")
        .attr("class", "overlay")
        .attr("x", margin.left)
        .attr("width", width - margin.right - margin.left)
        .attr("height", height)


    // CSV で読み込んでいるデータから最初の列を除く
    var keys = data.columns.slice(1);
    update(keys, 10);

    // update 関数で categories クラス（未だ実在しない）に描画していく
    function update(input, speed) {

        // input に入っているデータを SVG の line で定義した値にマッピングさせる
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
            .call(yAxis)

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

        // 先に作成した overlay クラスに以下を描画する
        svg.selectAll(".overlay")
            .on("mouseover", function() { focus.style("display", null); })
            .on("mouseout", function() { focus.style("display", "none"); })
            .on("mousemove", mousemove);

        // overlay クラスで利用する mouseover 時に実行される関数
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
