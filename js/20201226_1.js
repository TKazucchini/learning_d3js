// 表示サイズを設定
var margin = {
  top   : 40,
  right : 40,
  bottom: 40,
  left  : 40
};

var size = {
  width : 800,
  height: 400
};


// 表示するデータ
var data = [
  {date: "2015-01-01", value:20},
  {date: "2015-02-01", value:70},
  {date: "2015-03-01", value:100},
  {date: "2015-04-01", value:10},
  {date: "2015-05-01", value:69},
  {date: "2015-06-01", value:5},
  {date: "2015-07-01", value:75},
  {date: "2015-08-01", value:80},
  {date: "2015-09-01", value:55},
  {date: "2015-10-01", value:50},
  {date: "2015-11-01", value:32},
  {date: "2015-12-01", value:90}
];


// 時間のフォーマット
var parseDate = d3.timeParse("%Y-%m-%d");


// SVG、縦横軸などの設定
var svg = d3.select("#chart")
  .attr("width", size.width)
  .attr("height", size.height)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleTime()
  .range([0, size.width - margin.left - margin.right]);

var y = d3.scaleLinear()
  .range([size.height - margin.top - margin.bottom, 0]);

var xAxis = d3.axisBottom()
  .scale(x)
  .tickFormat(d3.timeFormat("%m"));

var yAxis = d3.axisLeft()
  .scale(y);

  var line = d3.line()
  .x(function(d){ return x(parseDate(new Date(d.date))); })
  .y(function(d){ return y(d.value); });


// 描画
data.forEach(function(d){
  d.date = parseDate(new Date(d.date));
  d.value = +d.value;
});

x.domain(d3.extent(data, function(d){ return d.date; }));
y.domain(d3.extent(data, function(d){ return d.value; }));


svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0, " + ( size.height - margin.top - margin.bottom ) + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .call(yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".7em")
    .style("text-anchor", "end")
    .text("値の単位");

svg.append("path")
  .datum(data)
  .attr("class", "line")
  .attr("d", line);   //// エラー d3.v6.min.js:2 Error: <path> attribute d: Expected number, "MNaN,269.47368421…".