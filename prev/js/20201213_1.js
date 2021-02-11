// データセット
var dataSet = [200, 120, 300, 60, 480]

// データセットから1つだけ描画
//d3.select("#myGraph")
//.append("rect")
//.attr("x", 0)
//.attr("y", 0)
//.attr("width", dataSet[0])
//.attr("height", "20px")

//データセットをcsvから読み込む
// ↓ d3js.v3
//d3.csv("./data/mydata.csv", function(error, data){
// ↓ d3js.v6
//d3.csv("./data/mydata.csv").then(function(data){
//
//    var dataSet = [];
//    for(var i = 0; i < data.length; i++){
//        dataSet.push(data[i].item1);
//        console.log('This should be displayd third.');
//        console.log(data);
//    };

// データセットを反復して描画
d3.select("#myGraph")
.selectAll("rect")
.data(dataSet)
.enter()
.append("rect")
.datum(function(d, i){
    console.log(i + " = " + d);
    return d;
    //return Math.random() * 100;
})
.attr("x", 0)
.attr("y", function(d, i){
    return i * 25;
})
.attr("width", function(d, i){
    return d + "px";
})
.attr("height", "20px")
.on("click", function(){
    d3.select(this)
    .style("fill", "cyan")
})

// ボタンクリック時の処理
d3.select("#updateButton")
.on("click", function(){
    // データをランダムに生成
    for (var i = 0; i < dataSet.length; i++){
        dataSet[i] = Math.floor(Math.random() * 320) // 0～320未満の数値を生成
    }
    d3.select("#myGraph")
    .selectAll("rect")
    .data(dataSet)
    .transition()
    .duration(500)
    .attr("width", function(d, i){
        return d + "px";
    })
});

//}); データをCSVから読み込んだ場合