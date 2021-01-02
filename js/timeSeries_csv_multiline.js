// このファイルで 複数列の表示を作成。別 js ファイル multiline を参照して統合したい


//var svgWidth = 320;
//var svgHeight = 240;

var margin = {
    top: 5,
    right: 10,
    bottom: 5,
    left: 70
}


var size = {
    width: document.getElementsByClassName('time-series')[0].clientWidth,
    height: document.getElementsByClassName('time-series')[0].clientHeight
}


/*
var size = {
    width: 800,
    height: 400
}
*/


// 元のサイズを保持しておく
margin.original = clone(margin);
size.original = clone(size);

// 縦横比率と現在の倍率を保持しておく
size.scale = 1;
//size.aspect = size.width / size.height;

//表示するデータ

d3.csv("./data/timeSeriesData_ex.csv").then(d => chart(d))

function chart(data) {

    var keys = data.columns.slice(1);

    var parseTime = d3.timeParse("%Y-%m-%d"),
        formatDate = d3.timeFormat("%Y-%m-%d"),
        bisectDate = d3.bisector(d => d.date).left,
        formatValue = d3.format(",.0f");

    data.forEach(function(d) {
        d.date = parseTime(d.date);
        return d;
    })

    var svg = d3.select("#chart"),
        margin = {top: 5, right: 10, bottom: 5, left: 70},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

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

    svg.append("g")
        .attr("class","x-axis")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

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


    update();
    /// ここまでループ こんな感じ

    // グラフサイズの更新
    function update(input, speed){

        // input は string を想定しているため、リストオブジェクトにそもそも対応していないような動き。
        //var copy = keys.filter(f => f.includes(input))  // １）ここの意味をもう少し理解して、２）input を動的に動かす取得方法を確認
        


        var categories = keys.map(function(id) {
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


        // SVGのサイズ（横幅）を取得
        size.width = parseInt(svg.style("width"));

        // 現在の倍率を元に余白の量も更新
        // 最小値がそれぞれ30pxになるように調整しておく
        size.scale = size.width / size.original.width;
        margin.top    = Math.max(20, margin.original.top * size.scale);
        margin.right  = Math.max(20, margin.original.right * size.scale);
        margin.bottom = Math.max(20, margin.original.bottom * size.scale);
        margin.left   = Math.max(20, margin.original.left * size.scale);

        // <svg>のサイズを更新
        svg
        .attr("width", size.width)
        .attr("height", size.height);

        // 縦横の最大幅を新しいサイズに合わせる
        x.range([0, size.width - margin.left - margin.right]);
        y.range([size.height - margin.top - margin.bottom, 0]);

        // 中心位置を揃える
        g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // 横軸の位置
        g.selectAll("g.x")
        .attr("transform", "translate(0, " + ( size.height - margin.top - margin.bottom ) + ")")
        .call(xAxis);

        // 縦軸の位置
        g.selectAll("g.y")
        .call(yAxis);

        // 折れ線の位置
        g.selectAll("path.line")
        .datum(dataSet)
        .attr("d", line);

    }

    // 初期化
    render();
    update();
    win.on("resize", update);

};


// オブジェクトのコピーを作成する簡易ヘルパー
function clone(obj){
var copy = {};
for( var attr in obj ){
    if( obj.hasOwnProperty(attr) ) copy[attr] = obj[attr];
}
return copy;
}
