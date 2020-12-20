var svgWidth = 320;
var svgHeight = 240;
var dataSet1 = [10, 47, 65, 9, 68, 99, 75, 82, 63, 30];
var dataSet2 = [40, 57, 55, 29, 18, 29, 25, 22, 73, 20];
var dataSet3 = [30, 47, 45, 69, 58, 29, 25, 22, 23, 30];
var dataSet4 = [20, 17, 45, 29, 8, 59, 35, 12, 43, 70];
var offsetX = 30;
var offsetY = 20;
var scale = 2.0 // 2倍のサイズでグラフを表示
var margin = svgWidth / (dataSet1.length - 1) // 折れ線グラフの間隔を計算
drawGraph(dataSet1, "itemA");
drawGraph(dataSet2, "itemB");
drawGraph(dataSet3, "itemC");
drawGraph(dataSet4, "itemD");
drawScale();

function drawGraph(dataSet, cssClassName) {
    // 折れ線グラフの座標値を計算するメソッド
    var line = d3.line()
    .x(function(d, i){
        return offsetX + i * margin;
    })
    .y(function(d, i){
        return svgHeight - (d * scale) - offsetY;
    })

    // 折れ線グラフを描画
    var lineElements = d3.select("#myGraph")
    .append("path")
    .attr("class", "line "+ cssClassName)
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
    d3.select("#myGraph")
    .append("rect")
    .attr("class", "axis_x")
    .attr("width", svgWidth)
    .attr("height", 1)
    .attr("transform", "translate(" + offsetX + ", " + (svgHeight - offsetY - 0.5) + ")")
}