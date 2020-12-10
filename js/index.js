var tokyo =
[
	[ "2014/05/21", "20", "16" ],
	[ "2014/05/22", "24", "16" ],
	[ "2014/05/23", "25", "16" ],
	[ "2014/05/24", "25", "16" ],
	[ "2014/05/25", "28", "19" ],
	[ "2014/05/16", "25", "19" ],
	[ "2014/05/27", "23", "18" ]
];

var osaka =
[
	[ "2014/05/21", "22", "16" ],
	[ "2014/05/22", "25", "16" ],
	[ "2014/05/23", "24", "15" ],
	[ "2014/05/24", "28", "15" ],
	[ "2014/05/25", "26", "18" ],
	[ "2014/05/16", "24", "18" ],
	[ "2014/05/27", "27", "19" ]
];

var sapporo =
[
	[ "2014/05/21", "20", "12" ],
	[ "2014/05/22", "19", "12" ],
	[ "2014/05/23", "18", "6" ],
	[ "2014/05/24", "19", "8" ],
	[ "2014/05/25", "21", "11" ],
	[ "2014/05/16", "19", "12" ],
	[ "2014/05/27", "19", "12" ]
];

var naha =
[
	[ "2014/05/21", "25", "22" ],
	[ "2014/05/22", "26", "20" ],
	[ "2014/05/23", "28", "21" ],
	[ "2014/05/24", "29", "22" ],
	[ "2014/05/25", "29", "23" ],
	[ "2014/05/16", "30", "24" ],
	[ "2014/05/27", "29", "24" ]
];

var w = 420;
var h = 300;

var padding = 10; // グラフの余白
var xAxisPadding = 40; // x軸表示余白
var yAxisPadding = 50; // x軸表示余白

var displayNum = tokyo.length - 1; // 表示日数
var dayWidth = (w - xAxisPadding - padding * 2) / displayNum; // 1日分の横幅


// SVG作成
var svg = d3.select("#result")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

// 軸
var xScale = d3.time.scale()
	.domain([
		new Date(2014, 4, 21),
		new Date(2014, 4, 27)
	])
	.range([padding, w - xAxisPadding - padding]);

var yScale = d3.scale.linear()
	.domain([30, 0])
	.range([padding, h - yAxisPadding - padding]);

var xAxis = d3.svg.axis()
	.scale(xScale)
	.tickFormat(d3.time.format("%m/%d"))
	.ticks(7);

var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left");

svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + xAxisPadding + ", " + (h - yAxisPadding) + ")")
	.call(xAxis)
	.selectAll("text")
	.attr("x", 10)
	.attr("y", -5)
	.attr("transform", "rotate(90)")
	.style("text-anchor", "start");

svg.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + xAxisPadding + ", 0)")
	.call(yAxis);


// 折れ線グラフ
var line = d3.svg.line()
	.x(function(d, i){
		return (i * dayWidth) + xAxisPadding + padding;
	})
	.y(function(d){
		return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[1] );
	});
var line2 = d3.svg.line()
	.x(function(d, i){
		return (i * dayWidth) + xAxisPadding + padding;
	})
	.y(function(d){
		return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[2] );
	});

svg.append("path")
	.attr("class", "high")
	.attr("d", line(tokyo))
	.attr("stroke", "#ed5454")
	.attr("fill", "none");

svg.append("path")
	.attr("class", "low")
	.attr("d", line2(tokyo))
	.attr("stroke", "#3874e3")
	.attr("fill", "none");


// 散布図
svg.selectAll(".high_circle")
    .data(tokyo)
    .enter()
    .append("circle")
	.attr("class", "high_circle")
    .attr("cx", function(d,i){
        return (i * dayWidth) + xAxisPadding + padding;
    })
    .attr("cy", function(d){
        return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[1] );
    })
    .attr("r", 0)
    .attr("stroke", "#ed5454")
    .attr("stroke-width", "1px")
    .attr("fill", "#f8d7d7")
	.transition()
    .duration(1000)
    .attr("r", 4);

svg.selectAll(".low_circle")
    .data(tokyo)
    .enter()
    .append("circle")
	.attr("class", "low_circle")
    .attr("cx", function(d,i){
        return (i * dayWidth) + xAxisPadding + padding;
    })
    .attr("cy", function(d){
        return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[2] );
    })
    .attr("r", 0)
    .attr("stroke", "#3874e3")
    .attr("stroke-width", "1px")
    .attr("fill", "#bdd0f4")
	.transition()
    .duration(1000)
    .attr("r", 4);


// テキスト
svg.selectAll(".high_text")
	.data(tokyo)
	.enter()
	.append("text")
	.attr("class", "high_text")
	.text(function (d) {
		return d[1];
	})
	.attr("font-size", "12px")
	.attr("fill", "#ed5454")
	.attr("x", function(d, i){
		return (i * dayWidth) + xAxisPadding + padding - 6;
	})
	.attr("y", function(d){
		return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[1] ) + 16;
	});

svg.selectAll(".low_text")
	.data(tokyo)
	.enter()
	.append("text")
	.attr("class", "low_text")
	.text(function (d) {
		return d[2];
	})
	.attr("font-size", "12px")
	.attr("fill", "#3874e3")
	.attr("x", function(d, i){
		return (i * dayWidth) + xAxisPadding + padding - 6;
	})
	.attr("y", function(d){
		return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[2] ) + 16;
	});



function draw(data) {

	// 折れ線グラフの再描画
	var line = d3.svg.line()
		.x(function(d, i){
			return (i * dayWidth) + xAxisPadding + padding;
		})
		.y(function(d){
			return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[1] );
		});

	var line2 = d3.svg.line()
		.x(function(d, i){
			return (i * dayWidth) + xAxisPadding + padding;
		})
		.y(function(d){
			return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[2] );
		});

	svg.selectAll(".high")
		.transition()
		.duration(1000)
		.attr("d", line(data));

	svg.selectAll(".low")
		.transition()
		.duration(1000)
		.attr("d", line2(data));

	// 散布図の再描画
	svg.selectAll(".high_circle")
	    .data(data)
		.transition()
		.duration(1000)
	    .attr("cx", function(d,i){
	        return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .attr("cy", function(d){
	        return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[1] );
	    });
	svg.selectAll(".low_circle")
	    .data(data)
		.transition()
		.duration(1000)
	    .attr("cx", function(d,i){
	        return (i * dayWidth) + xAxisPadding + padding;
	    })
	    .attr("cy", function(d){
	        return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[2] );
	    });

	//　テキストの再描画
	svg.selectAll(".high_text")
		.data(data)
		.transition()
		.duration(1000)
		.text(function (d) {
			return d[1];
		})
		.attr("x", function(d, i){
			return (i * dayWidth) + xAxisPadding + padding - 6;
		})
		.attr("y", function(d){
			return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[1] ) + 16;
		});
	svg.selectAll(".low_text")
		.data(data)
		.transition()
		.duration(1000)
		.text(function (d) {
			return d[2];
		})
		.attr("x", function(d, i){
			return (i * dayWidth) + xAxisPadding + padding - 6;
		})
		.attr("y", function(d){
			return h - padding - yAxisPadding - ((h - yAxisPadding - padding * 2) / 30 * d[2] ) + 16;
		});
}

// イベント設定
d3.selectAll("a.osaka")
	.on("click", function(){
		draw(osaka);
	});
d3.selectAll("a.tokyo")
	.on("click", function(){
		draw(tokyo);
	});
d3.selectAll("a.sapporo")
	.on("click", function(){
		draw(sapporo);
	});
d3.selectAll("a.naha")
	.on("click", function(){
		draw(naha);
	});