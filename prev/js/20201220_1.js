var svgWidth = 320;
var svgHeight = 240;
//var dataSet1 = [10, 47, 65, 9, 68, 99, 75, 82, 63, 30];
//var dataSet2 = [40, 57, 55, 29, 18, 29, 25, 22, 73, 20];
//var dataSet3 = [30, 47, 45, 69, 58, 29, 25, 22, 23, 30];
//var dataSet4 = [20, 17, 45, 29, 8, 59, 35, 12, 43, 70];
var offsetX = 30;
var offsetY = 20;
var scale = 2.0 // 2倍のサイズでグラフを表示

// 冗長な json の場合
/*
var dataSet = [
	[
		{ year : 2004, value : 10 },
		{ year : 2005, value : 47 },
		{ year : 2006, value : 65 },
		{ year : 2007, value : 8 },
		{ year : 2008, value : 64 },
		{ year : 2009, value : 99 },
		{ year : 2010, value : 75 },
		{ year : 2011, value : 22 },
		{ year : 2012, value : 63 },
		{ year : 2013, value : 80 }
	],
	[
		{ year : 2004, value : 90 },
		{ year : 2005, value : 77 },
		{ year : 2006, value : 55 },
		{ year : 2007, value : 48 },
		{ year : 2008, value : 64 },
		{ year : 2009, value : 90 },
		{ year : 2010, value : 85 },
		{ year : 2011, value : 42 },
		{ year : 2012, value : 13 },
		{ year : 2013, value : 40 }
	],
	[
		{ year : 2004, value : 50 },
		{ year : 2005, value : 27 },
		{ year : 2006, value : 45 },
		{ year : 2007, value : 58 },
		{ year : 2008, value : 84 },
		{ year : 2009, value : 70 },
		{ year : 2010, value : 45 },
		{ year : 2011, value : 22 },
		{ year : 2012, value : 30 },
		{ year : 2013, value : 90 }
	]
];
*/

// 簡潔な json の場合
var dataSet = [
	{ year : 2004, item1 : 10, item2 : 90, item3 : 50 },
	{ year : 2005, item1 : 47, item2 : 77, item3 : 27 },
	{ year : 2006, item1 : 65, item2 : 55, item3 : 45 },
	{ year : 2007, item1 : 8, item2 : 48, item3 : 58 },
	{ year : 2008, item1 : 64, item2 : 64, item3 : 84 },
	{ year : 2009, item1 : 99, item2 : 90, item3 : 70 },
	{ year : 2010, item1 : 75, item2 : 85, item3 : 45 },
	{ year : 2011, item1 : 22, item2 : 42, item3 : 22 },
	{ year : 2012, item1 : 63, item2 : 13, item3 : 30 },
	{ year : 2013, item1 : 80, item2 : 40, item3 : 90 }
];

// 冗長 json
//var margin = svgWidth / (dataSet[0].length - 1) // 折れ線グラフの間隔を計算

// 簡潔 json
var margin = svgWidth / (dataSet.length - 1) // 折れ線グラフの間隔を計算

// 冗長 json
//drawGraph(dataSet[0], "itemA");
//drawGraph(dataSet[1], "itemB");
//drawGraph(dataSet[2], "itemC");

// 簡潔 json
drawGraph(dataSet, "item1", "itemA");
drawGraph(dataSet, "item2", "itemB");
drawGraph(dataSet, "item3", "itemC");

drawScale();

function drawGraph(dataSet, itemName, cssClassName) {
    // 折れ線グラフの座標値を計算するメソッド
    var line = d3.line()
    .x(function(d, i){
        return offsetX + i * margin;
    })
    .y(function(d, i){
        // 冗長 json
        //return svgHeight - (d.value * scale) - offsetY;
        // 簡潔 json
        return svgHeight - (d[itemName] * scale) - offsetY;
    })

    // 折れ線グラフを描画
    var lineElements = d3.select("#myGraph")
    .append("path")
    //.attr("class", "line "+ cssClassName)
    .attr("class", cssClassName)
    .attr("d", line(dataSet));
    console.log("class", "line " + cssClassName);
}

function drawScale(){
    // 目盛を表示するためにスケールを設定
    var yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([scale * 100, 0])

    // 目盛を表示
    d3.select("#myGraph")
    .append("g")
    .attr("class", "axis_x")
    .attr("transform", "translate(" + offsetX + ", " + offsetY + ")")
    .call(d3.axisLeft(yScale).ticks(20))

    // 横方向の線を表示する
    /*
    d3.select("#myGraph")
    .append("rect")
    .attr("class", "axis_x")
    .attr("width", svgWidth)
    .attr("height", 1)
    .attr("transform", "translate(" + offsetX + ", " + (svgHeight - offsetY - 0.5) + ")")
    */

	// 横の目盛りを表示するためにD3スケールを設定
	//var xScale = d3.scaleLinear()  // スケールを設定
	//.domain([2004, 2013])	// 2004年から2013年まで
	//.range([0, svgWidth]) // 出力サイズ
		
	// x軸を時間表示に変更
	var xScale = d3.scaleTime()
	.domain([new Date("2004/1/1"), new Date("2013/1/1")])
	.range([10, svgWidth])
        
	// 横の目盛りを表示
	d3.select("#myGraph")	// SVG要素を指定
			.append("g")	// g要素を追加。これが目盛りを表示する要素になる
			.attr("class", "axis")	// CSSクラスを指定
			.attr("transform", "translate("+offsetX+", "+(svgHeight - offsetY)+")")
			.call(d3.axisBottom(xScale)
				.ticks(5)
				.tickFormat(function(d, i){
					var fmtFunc =  d3.timeFormat("%Y年%m月"); // 変換関数の定義
					return fmtFunc(d);
				}))
            
}