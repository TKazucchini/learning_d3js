drawLine([Dataset1, Dataset1, Dataset3]);

function drawLine(datasets) {
    // コンテナ
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 600 - (margin.left + margin.right),
        height = 400 - (margin.top + margin.bottom);
    var svg = d3.select("#line")
            .attr({
                width : width + (margin.left + margin.right),
                height : height + (margin.top + margin.bottom)
            })
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // スケール
    var xScale = d3.scaleLinear()
            .domain([20, 80])
            .range([0, width]);
    var yScale = d3.scaleLinear()
            .domain([0, 0.45])
            .range([height, 0]);
    // 軸
    var xAxis = d3.axisBottom()
            .scale(xScale);
    var yAxis = d3.axisLeft()
            .scale(yScale);
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")") // ←x軸を下側に移動
        .call(xAxis);
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
    // 描画
    var line = d3.line()
            .x(function(d){ return xScale(d.age); })
            .y(function(d){ return yScale(d.rate); });
    var colorArr = ['#E74C3C',
                    '#3498DB',
                    '#2ECC71',
                    '#9B59B6',
                    '#34495e',
                    '#449248',
                    '#652681'];
    for(var i = 0; i < datasets.length; i++) {
        svg.append("path")
            .datum(datasets[i])
            .attr("class", "line")
            .attr("d", line)
            .attr("stroke", colorArr[i])
            .attr("stroke-width", "2px")
            .attr("fill", "none");
    }
}

// データ
var Dataset1 = [
    {age: 25, rate: 0.06633412364}
    ,{age: 30, rate: 0.1620942}
    ,{age: 40, rate: 0.1859880326}
    ,{age: 50, rate: 0.1567057713}
    ,{age: 60, rate: 0.1850232472}
    ,{age: 70, rate: 0.1450872925}
    ,{age: 80, rate: 0.09876733278}
];
var Dataset2 = [
    {age: 25, rate: 0}
    ,{age: 30, rate: 0.07122905028}
    ,{age: 40, rate: 0.2346368715}
    ,{age: 50, rate: 0.3575418994}
    ,{age: 60, rate: 0.2402234637}
    ,{age: 70, rate: 0.09497206704}
    ,{age: 80, rate: 0.001396648045}
];
var Dataset3 = [
    {age: 25, rate: 0.007227671657}
    ,{age: 30, rate: 0.0586990191}
    ,{age: 40, rate: 0.1338151781}
    ,{age: 50, rate: 0.2699019102}
    ,{age: 60, rate: 0.4212183789}
    ,{age: 70, rate: 0.1064532783}
    ,{age: 80, rate: 0.002684563758}
];

