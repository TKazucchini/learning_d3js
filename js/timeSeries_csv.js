//var svgWidth = 320;
//var svgHeight = 240;

var margin = {
    top: 5,
    right: 40,
    bottom: 5,
    left: 60
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
//margin.original = clone(margin);
//size.original = clone(size);

// 縦横比率と現在の倍率を保持しておく
//size.scale = 1;
//size.aspect = size.width / size.height;

//表示するデータ
d3.csv("./data/timeSeriesData.csv").then(d => chart(d))

function chart(data){
    var keys = data.columns.slice(1);
    var parseTime = d3.timeParse("%Y-%m-%d"),
        formatDate = d3.timeFormat("%Y-%m-%d"),
        bisectDate = d3.bisector(d => d.date).left,
        formatValue = d3.format(",.0f");

    data.forEach(function(d){
        d.yr_m = parseTime(d.yr_m);
        return d;
    })

    var svg = d3.select("#timeSeries"),
        margin = { top: 5, right: 40, bottom: 5, left: 60 },
        width = document.getElementsByClassName('time-series')[0].clientWidth - margin.left - margin.right,
        height = document.getElementsByClassName('time-series')[0].clientHeight - margin.top - margin.bottom;

    var x = d3.scaleTime()
        .rangeRound([margin.left, width - margin.right])
        .domain(d3.extent(data, d => d.yr_m))

    var y = d3.scaleLinear()
        .rangeRound([height - margin.bottom, margin.top]);

    var z = d3.scaleOrdinal(d3.schemeCategory10);

    var line = d3.line()
        .curve(d3.curveCardinal)
        .x(d => x(d.yr_m))
        .y(d => y(d.population));

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

    update(d3.select('#selectbox').property('value'), 0);
    

	function update(input, speed) {

		var copy = keys.filter(f => f.includes(input))

		var categories = copy.map(function(id) {
			return {
				id: id,
				values: data.map(d => {return {yr_m: d.yr_m, population: +d[id]}})
			};
		});

		y.domain([
			d3.min(categories, d => d3.min(d.values, c => c.population)),
			d3.max(categories, d => d3.max(d.values, c => c.population))
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
			.merge(city)
		.transition().duration(speed)
			.attr("d", d => line(d.values))

		tooltip(copy);
    }
    
    function tooltip(copy) {
		
		var labels = focus.selectAll(".lineHoverText")
			.data(copy)

		labels.enter().append("text")
			.attr("class", "lineHoverText")
			.style("fill", d => z(d))
			.attr("text-anchor", "start")
			.attr("font-size",12)
			.attr("dy", (_, i) => 1 + i * 2 + "em")
			.merge(labels);

		var circles = focus.selectAll(".hoverCircle")
			.data(copy)

		circles.enter().append("circle")
			.attr("class", "hoverCircle")
			.style("fill", d => z(d))
			.attr("r", 2.5)
			.merge(circles);

		svg.selectAll(".overlay")
			.on("mouseover", function() { focus.style("display", null); })
			.on("mouseout", function() { focus.style("display", "none"); })
			.on("mousemove", mousemove);

		function mousemove() {

			var x0 = x.invert(d3.mouse(this)[0]),
				i = bisectDate(data, x0, 1),
				d0 = data[i - 1],
				d1 = data[i],
				d = x0 - d0.date > d1.date - x0 ? d1 : d0;

			focus.select(".lineHover")
				.attr("transform", "translate(" + x(d.date) + "," + height + ")");

			focus.select(".lineHoverDate")
				.attr("transform", 
					"translate(" + x(d.date) + "," + (height + margin.bottom) + ")")
				.text(formatDate(d.yr_m));

			focus.selectAll(".hoverCircle")
				.attr("cy", e => y(d[e]))
				.attr("cx", x(d.yr_m));

			focus.selectAll(".lineHoverText")
				.attr("transform", 
					"translate(" + (x(d.yr_m)) + "," + height / 2.5 + ")")
				.text(e => e + " " + "people" + formatValue(d[e]));

			x(d.date) > (width - width / 4) 
				? focus.selectAll("text.lineHoverText")
					.attr("text-anchor", "end")
					.attr("dx", -10)
				: focus.selectAll("text.lineHoverText")
					.attr("text-anchor", "start")
					.attr("dx", 10)
		}
    }
    
    var selectbox = d3.select("#selectbox")
    .on("change", function() {
        update(this.value, 750);
    })


}



/*


// グラフサイズの更新
function resize(){

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
//render();
resize();
win.on("resize", update);

*/



// オブジェクトのコピーを作成する簡易ヘルパー
function clone(obj){
var copy = {};
for( var attr in obj ){
    if( obj.hasOwnProperty(attr) ) copy[attr] = obj[attr];
}
return copy;
}
