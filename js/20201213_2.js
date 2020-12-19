// データ
var svgWidth = 320;
var svgHeight = 240;
var barElements;
var dataSet = [120, 70, 175, 80, 220, 210, 140, 200, 110];
var offsetX = 30; // グラフが目盛と重ならないように位置調整
var offsetY = 10; // グラフが目盛と重ならないように位置調整
var dataMax = 300;
var barWidth = 20;
var barMargin = 5;

// グラフを描画
barElements = d3.select("#myGraph")
.selectAll("rect")
.data(dataSet)

// データ追加
barElements.enter()
.append("rect")
.attr("class", "bar") // css クラスを指定
//.attr("height", function(d, i){
//    return d;
//})
.attr("height", 0) // アニメーションの初期値
.attr("width", barWidth)
.attr("x", function(d, i){
    return i * (barWidth + barMargin) + offsetX;
})
//.attr("y", function(d, i){    // Y座標を指定する
//    return svgHeight - d - offsetY;      // Y座標を計算（値の分だけ座標から”引く”）
//})
.attr("y", svgHeight - offsetY) // アニメーションのために初期化
.on("mouseover", function(){
    d3.select(this)
    .style("fill", "red")
})
.on("mouseout", function(){
    d3.select(this)
    .style("fill", "orange")
})
.transition()
.duration(300)
.delay(function(d, i){
    return i * 100;  // 0.1秒待ち
})
.attr("y", function(d, i){
    return svgHeight - d - offsetY;
})
.attr("height", function(d, i){
    return d;
})


// 値を表示
barElements.enter()
.append("text")
.attr("class", "barNum")
.attr("x", function(d,i){
    return i * (barWidth + barMargin) + 10 + offsetX;
})
.attr("y", svgHeight -5 - offsetY)
.text(function(d, i){
    return d;
})

// 目盛を表示するためにスケールを設定
var yScale = d3.scaleLinear()
.domain([0, dataMax])
.range([dataMax, 0])

// 目盛を設定し表示する
d3.select("#myGraph")
.append("g") // これがないと目盛が出ない g: PowerPoint のグループ化みたいなもの 
.attr("class", "axis")
.attr("transform", "translate(" + offsetX + ", " + ((svgHeight - 300) - offsetY) + ")")
.call(d3.axisLeft(yScale).ticks(20))

// 横方向の線を表示する
d3.select("#myGraph")
.append("rect")
.attr("class", "axis_x")
.attr("width", 320)
.attr("heiht", 1)
.attr("transform", "translate(" + offsetX + ", " + (svgHeight - offsetY) + ")")

// 棒のラベルを表示する
barElements.enter()
.append("text")
.attr("class", "barName")
.attr("x", function(d, i){
    return i * 25 + 10 + offsetX;
})
.attr("y", svgHeight - offsetY + 15)
.text(function(d, i){
    return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"][i];
})
