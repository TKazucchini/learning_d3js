//var svgWidth = 320;
//var svgHeight = 240;

var margin = {
    top: 5,
    right: 50,
    bottom: 5,
    left: 50
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
d3.csv("./data/timeSeriesData.csv").then(function(data){
    
    var dataSet = [];
    for(var i = 0; i < data.length; i++){
        dataSet.push(data[i]);
    };


    // 時間のフォーマット
    var parseDate = d3.timeParse("%Y-%m-%d"); // 変換関数の定義

    // SVG 縦横軸などの設定
    var win = d3.select(window);
    var svg = d3.select("#timeSeries")
    var g = svg.append("g")
    var x = d3.scaleTime();
    var y = d3.scaleLinear();

    var xAxis = d3.axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat("%Y-%m"));

    var yAxis = d3.axisLeft()
        .scale(y);

    // 簡潔 json
    //drawGraph(dataSet, "jp", "css-jp");
    //drawGraph(dataSet, "fr", "css-fr");
    //drawGraph(dataSet, "tr", "css-tr");

    // 折れ線グラフの座標値を計算するメソッド
    var line = d3.line()
    .x(function(d){ return x(d.yr_m); })
    .y(function(d){ return y(d.in_jp); });


    // 折れ線グラフの描画
    function render(){
        dataSet.forEach(function(d){
            d.yr_m = parseDate(d.yr_m);
            d.in_jp = +d.in_jp;
        });

        // scale の初期化
        xExtent = d3.extent(dataSet, function(d){ return d.yr_m; })
        yExtent = d3.extent(dataSet, function(d){ return d.in_jp; })
        x.domain(xExtent);
        y.domain(yExtent);

        g.append("g")
            .attr("class", "x axis");

        g.append("g")
            .attr("class", "y axis")
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".7em")
            .style("text-anchor", "end")
            .text("値の単位");

        g.append("path")
            .attr("class", "line css-jp")

    }


    /// ここまでループ こんな感じ

    // グラフサイズの更新
    function update(){

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
        .attr("d", line);

    }

    // 初期化
    render();
    update();
    win.on("resize", update);

});


// オブジェクトのコピーを作成する簡易ヘルパー
function clone(obj){
var copy = {};
for( var attr in obj ){
    if( obj.hasOwnProperty(attr) ) copy[attr] = obj[attr];
}
return copy;
}
