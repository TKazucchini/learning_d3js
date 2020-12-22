// json データを読み込む
d3.json("./data/mydata.json").then(function(data){
    var dataSet = [];

    var svgEle = document.getElementById("myGraph")
    var svgWidth = window.getComputedStyle(svgEle, null).getPropertyValue("width");
    var svgHeight = window.getComputedStyle(svgEle, null).getPropertyValue("height");

    // float に変換
    svgWidth = parseFloat(svgWidth) - 60;
    svgHeight = parseFloat(svgHeight) - 60;

    var offsetX = 30;
    var offsetY = 20;
    var scale = 2.0;
    
    var rangeYear = 10;
    var year = d3.extent(data, function(d){
        return d.year;
    });

    var startYear = year[0] // 配列に格納された最初の年
    var currentYear = 2000; // 最初の表示基準年

    var margin = svgWidth / (rangeYear - 1); // 折れ線グラフの間隔を表示

    // 最初にグラフを表示する
    pickupData(data, currentYear - startYear);
    
    drawGraph(dataSet, "item1", "itemA", "linear")
    drawGraph(dataSet, "item2", "itemB", "linear")
    drawGraph(dataSet, "item3", "itemC", "linear")

    drawScale();

    // 折れ線グラフを表示するための関数
    function drawGraph(dataSet, itemName, cssClassName, type){
        var line = d3.line()
        .x(function(d, i){
            return offsetX + i * margin;
        })
        .y(function(d, i){
            return svgHeight - (d[itemName] * scale) - offsetY;
        })
        //.interpolate(type) // D3 Ver 3 まで
        
        var lineElements = d3.select("#myGraph")
        .append("path")
        .attr("class", "line " + cssClassName)
        //.attr("class", cssClassName)
        .attr("d", line(dataSet))
    }

    // グラフの目盛を表示するための関数
    function drawScale(){
        
        // 目盛を表示するためのD3スケールを設定
        var yScale = d3.scaleLinear()
        .domain([0, 100])
        //.range([scale * 100, 0])
        .range([svgHeight - offsetY, 0])
        
        
        // 目盛を表示
        d3.select("#myGraph")
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + offsetX + ", " + ((svgHeight - (scale - 1) * 100) + offsetY) + ")")
        .call(d3.axisLeft(yScale))

        var xScale = d3.scaleTime()
        .domain([new Date(currentYear + "/1/1"), new Date((currentYear + rangeYear - 1) + "/1/1")]) //表示範囲の年数を指定
        .range([0, svgWidth])
         
        // 横の目盛を表示
        d3.select("#myGraph")
        .append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + offsetX + ", " + (svgHeight - offsetY) + ")")
        .call(d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(function(d, i){
            var fmtFunc = d3.timeFormat("%Y年%m月");
            return fmtFunc(d);
        }))
        .selectAll("text")
        .attr("transform", "rotate(90)")
        .attr("dx", "0.7em")
        .attr("dy", "-0.4em")
        .style("text-anchor", "start")
    }

    // json  データから表示する範囲のデータセットを抽出して svg 要素ないを消去
    function pickupData(data, start){
        dataSet = [];
        for (var i = 0; i < rangeYear; i++){
            dataSet[i] = data[start + i];
        }
        d3.select("#myGraph").selectAll("*").remove(); // svg 要素内を消去
    }

    // 「次へ」ボタンにイベントを割り当てる
   d3.select("#prev").on("click", function(){
       if (currentYear > year[0]){              // 最小年よりも大きい場合には年数を一つ減らす
           currentYear = currentYear - 1;
       }

       // グラフを表示
       pickupData(data, currentYear - startYear); // 表示範囲のデータをセット
       drawGraph(dataSet, "item1", "itemA", "linear");
       drawGraph(dataSet, "item2", "itemB", "linear");
       drawGraph(dataSet, "item3", "itemC", "linear");
       drawScale();
   })

    // 「前へ」ボタンにイベントを割り当てる
    d3.select("#next").on("click", function(){
        if (currentYear <= year[1] - rangeYear){     // 最大年 + 範囲よりも小さい場合には年数を一つ増やす
            currentYear = currentYear + 1;
        }
 
        // グラフを表示
        pickupData(data, currentYear - startYear); // 表示範囲のデータをセット
        drawGraph(dataSet, "item1", "itemA", "linear");
        drawGraph(dataSet, "item2", "itemB", "linear");
        drawGraph(dataSet, "item3", "itemC", "linear");
        drawScale();
    })
 
});
