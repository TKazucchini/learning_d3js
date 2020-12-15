// データ
var svgHeight = 240;
var barElements;
var dataSet = [120, 70, 175, 80, 220, 210, 300];
var offsetX = 30; // グラフが目盛と重ならないように位置調整
var offsetY = 10; // グラフが目盛と重ならないように位置調整

// グラフを描画
barElements = d3.select("#myGraph")
.selectAll("rect")
.data(dataSet)

// データ追加
barElements.enter()
.append("rect")
.attr("class", "bar") // css クラスを指定
.attr("height", function(d, i){
    return d;
})
.attr("width", 20)
.attr("x", function(d, i){
    return i * 25 + offsetX;
})
.attr("y", function(d, i){    // Y座標を指定する
    return svgHeight - d - offsetY;      // Y座標を計算（値の分だけ座標から”引く”）
})

// 値を表示
barElements.enter()
.append("text")
.attr("class", "barNum")
.attr("x", function(d,i){
    return i * 25 + 10 + offsetX;
})
.attr("y", svgHeight -5 - offsetY)
.text(function(d, i){
    return d;
})

// 目盛を表示するためにスケールを設定
var yScale = d3.scaleLinear()
.domain([0, 300])
.range([300, 0])

// 目盛を設定し表示する
d3.select("#myGraph")
.append("g")
.attr("class", "axis")
.attr("transform", "translate(" + offsetX + ", " + ((svgHeight - 300) - offsetY) + ")")
.call(d3.axisLeft(yScale))

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
    return ["A", "B", "C", "D", "E", "F", "G"][i];
})