var svgWidth = 320;
var svgHeight = 240;
var dataSet = [20, 30, 12, 5, 3];
var color = d3.scaleOrdinal(d3.schemeCategory10); // ver 6

// 円グラフの座標値を計算するメソッド
var pie = d3.pie().sort(null) // sort を入れることでアニメーションの順番が保たれる

// 円グラフの外径、内径を設定
var arc = d3.arc()
.innerRadius(40)
.outerRadius(100);

// 円グラフを描画
var pieElements = d3.select("#myGraph")
//.selectAll("path") //"rect" ではなく "path" を指定
.selectAll("g")
.data(pie(dataSet))
.enter()
.append("g")
.attr("transform", "translate(" + svgWidth / 2 + ", " + svgHeight / 2 + ")")

// データの追加
pieElements
.append("path")
.attr("class", "pie")
//.attr("d", arc) // アニメーションで初期値を0にしたいから非表示
//.attr("transform", "translate(" + svgWidth / 2 + ", " + svgHeight / 2 + ")")
.style("fill", function(d, i){
    return color(i);
})
.transition()
//.ease(d3.easeBounce) // アニメーション効果
.ease(d3.easeLinear) // アニメーション効果
.duration(300)
.delay(function(d, i){
    return i * 300;
})
.attrTween("d", function(d, i){
    var interpolate = d3.interpolate(
        {startAngle: d.startAngle, endAngle: d.startAngle}, // 各部開始確度
        {startAngle: d.startAngle, endAngle: d.endAngle}    // 各部終了確度
    );
    return function(t){
        return arc(interpolate(t));  // 時間tに応じて処理
    }
})

// 中央にテキストを表示
var textElement = d3.select("#myGraph")
.append("text")
.attr("class", "total")
.attr("transform", "translate(" + svgWidth / 2 + ", " + (svgHeight / 2 + 5)+ ")")
.text("Total: " + d3.sum(dataSet))

// データの値をチャート内に表示
pieElements
.append("text")
.attr("class", "pieNum")
.attr("transform", function(d, i){
    return "translate("+arc.centroid(d)+")";
})
.text(function(d, i){
    return d.value;
})
