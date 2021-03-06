//表示するデータ
d3.csv("./data/timeSeriesData.csv").then(d => drawTimeSeries(d))
    
function drawTimeSeries(data) {
    
    var parseTime = d3.timeParse("%Y-%m"),
    formatDate = d3.timeFormat("%Y-%m-%d"),
    bisectDate = d3.bisector(d => d.date).left,
    formatValue = d3.format(",.0f");

    data.forEach(function(d) {
        d.date = parseTime(d.date);
        return d;
    })

    var margin = {top: 5, right: -5, bottom: 5, left: 60},
        width = +document.getElementsByClassName('time-series')[0].clientWidth - margin.left - margin.right,
        height = +document.getElementsByClassName('time-series')[0].clientHeight - margin.top - margin.bottom,
        height2 = 40;

    const svg = d3.select('#timeSeries')

    const spotlight = svg.append('g')
        .attr('class', 'spotlight')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)

    const context = svg.append('g')
                    .attr('class', 'context')
                    .attr('transform', `translate(${margin.left}, ${margin.top + 550})`)

    // the date range of available data:
    var dataXrange = d3.extent(data, d => d.date);
    var dataYrange = [0, d3.max(data, d => d.people)]; // d.people? マッピングさせてから

    // maximum date range allowed to display
    var mindate = dataXrange[0],  // use the range of the data
        maxdate = dataXrange[1];
            
    console.log("mindate: " + mindate);
    console.log("maxdate: " + maxdate);

    let x = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain(dataXrange)

    let x2 = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain([mindate, maxdate])

    let y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top])
        .domain(dataYrange);

    let y2 = d3.scaleLinear()
        .rangeRound([height2 - margin.bottom, margin.top])
        .domain(dataYrange);

    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        //.curve(d3.curveCardinal)
        .x(d => x(d.date))
        .y(d => y(d.people));


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

    let xAxis = d3.axisBottom(x).tickFormat(dynamicDateFormat);
    let xAxis2 = d3.axisBottom(x2).tickFormat(dynamicDateFormat);
    let yAxis = d3.axisLeft(y).tickSize(-width + margin.right + margin.left);
    let yAxis2 = d3.axisLeft(y2);

    let brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on('brush', brushed)

    function brushed(event) {
        var s = event.selection || x2.range()
        x.domain(s.map(x2.invert, x2))
        spotlight.select('.axis').call(xAxis)
        spotlight.selectAll('.bar')
            .attr('x', (d, i) => {
                return x(i) - xBand.bandwidth()*0.9/2
            })
        }

    x.domain([-1, data.length])
    y.domain([0, d3.max(data, d => d.people)])
    x2.domain(x.domain())
    y2.domain([0, d3.max(data, d => d.people)])


    /****************************
    focus (メインで描画される領域について)
    ****************************/

    var focus = spotlight.append("g")
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

        spotlight.selectAll(".y-axis").transition()
            .duration(speed)
            .call(yAxis)

        var category_sl = spotlight.append('g')
            .attr('clip-path','url(#my-clip-path)')
            .selectAll(".categories")
            .data(categories);

        category_sl.exit().remove();

        category_sl.enter().insert("g", ".spotlight")
            .append("path")
            .attr("class", "line categories")
            .style("stroke", d => z(d.id))
            .merge(category_sl)
        .transition().duration(speed)
            .attr("d", d => line(d.values))

        spotlight.append("g")
            .attr("class","x-axis")
            .attr("transform", "translate(0," + (height - margin.bottom) + ")")
            .call(xAxis);

        spotlight.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + margin.left + ",0)");

        tooltip(keys);



        let defs = spotlight.append('defs')

        // use clipPath
        defs.append('clipPath')
            .attr('id', 'my-clip-path')
            .append('path')
            .attr('width', width)
            .attr('height', height)

        var category_cx = context.selectAll(".categories")
            .data(categories);

        category_cx.exit().remove();

        category_cx.enter().insert("g", ".context")
            .append("path")
            .attr("class", "line categories")
            .style("stroke", d => z(d.id))
            .merge(category_cx)
        .transition().duration(speed)
            .attr("d", d => line(d.values))
            // このあたりでheight2の高さコントロール必要かも。後でチェック。
            // ファイル切り出して、CSV 既読にした方がデバックしやすい。次回。

        context.append('g')
            .attr('class', 'axis2')
            .attr('transform', `translate(0,${height2})`)
            .call(xAxis)

        context.append('g')
            .attr('class', 'brush')
            .call(brush)
            .call(brush.move, x.range())

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
