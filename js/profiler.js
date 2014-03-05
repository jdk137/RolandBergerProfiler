var Profiler = function (config) {
  this.config = config;
  //  4 params must need
  var width = config.width || 552,
      height = config.height || 552;
  var container = typeof config.container === "string" ? document.getElementById(config.container) : config.container; // id or dom node
  var data = config.data || [
    {"id":0,"name":"安逸","x":0.22,"y":0.25,"value":0.75},
    {"id":1,"name":"刺激乐趣","x":0.81,"y":0.07,"value":0.07},
    {"id":2,"name":"定制化","x":0.78,"y":0.91,"value":0.31},
    {"id":3,"name":"服务","x":0.61,"y":0.53,"value":0.20},
    {"id":4,"name":"高尚","x":0.2,"y":0.05,"value":0.86},
    {"id":5,"name":"个人效率","x":0.8,"y":0.75,"value":0.05},
    {"id":6,"name":"古典","x":0.49,"y":0.22,"value":0.17},
    {"id":7,"name":"活力","x":0.6,"y":0.48,"value":0.96},
    {"id":8,"name":"激情","x":0.48,"y":0.09,"value":0.40},
    {"id":9,"name":"简约","x":0.23,"y":0.47,"value":0.85},
    {"id":10,"name":"科技","x":0.9,"y":0.55,"value":0.11},
    {"id":11,"name":"美誉","x":0.57,"y":0.77,"value":0.25},
    {"id":12,"name":"明智购物","x":0.28,"y":0.7,"value":0.09},
    {"id":13,"name":"亲和力","x":0.4,"y":0.43,"value":0.27},
    {"id":14,"name":"全面成本","x":0.24,"y":0.83,"value":0.95},
    {"id":15,"name":"新潮","x":0.85,"y":0.42,"value":0.31},
    {"id":16,"name":"质量","x":0.55,"y":0.63,"value":0.17},
    {"id":17,"name":"追求","x":0.77,"y":0.22,"value":0.14},
    {"id":18,"name":"自然","x":0.26,"y":0.21,"value":0.55},
    {"id":19,"name":"自由自在","x":0.61,"y":0.30,"value":0.69}
  ];
  var threshold = config.threshold || 0; // below threshold is negative, above threshold is positive, default is 0
  var rangeRatio = config.rangeRatio || 0.2; // range a point may affect, range = rangeRatio * Math.min(w, h);

  //  other optional params
  var margin = config.margin || {top: 20, right: 20, bottom: 20, left: 20};
  var color = config.color || {"positive": "red", "negative": "blue"};

  var w = width - margin.left - margin.right;
  var h = height - margin.top - margin.bottom;

  // dataProcess
  data.forEach(function (d, i) {
      d.x = d.x * w;
      d.y = d.y * h;
      d.value = d.value - threshold;
  });
  console.log(JSON.stringify(data));

  $(container).css({
    width: width,
    height: height,
    position: 'relative'
  }).html('<canvas></canvas>');
  $(container).find('canvas').css({
    'position': 'absolute',
    'top': 20,
    'left': 20,
    'z-index': -10
  });

  var drawHeatmap = function (data) {
      var canvas = $(container).find("canvas")[0],
          ctx = canvas.getContext("2d"),
          tempCanvas = document.createElement("canvas"),
          tempCtx = tempCanvas.getContext("2d"),
          width = w,
          height = h,
          points = data;

      canvas.width = tempCanvas.width = width;
      canvas.height= tempCanvas.height= height;

      function draw(){
          var data = []; // width * height
          var getWeight = function (x1, y1, x2, y2, range) {
            return Math.pow(Math.E, -0.5 * (Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)) / range / range);
          };
          var max = 0;
          (function () {
              var rangeSize = rangeRatio * Math.min(width, height);
              for (var i = 0, l = width * height; i < l; i++) {
                  var w = i % width;
                  var h = Math.floor(i / width);
                  var sum = 0;
                  points.forEach(function (p, j) {
                      var range = rangeSize * p.value;
                      var weight = getWeight(w, h, p.x, p.y, range);
                      sum += weight * p.value;
                  });
                  data[i] = sum;
                  if (Math.abs(sum) > max) {
                      max = Math.abs(sum);
                  }
              };
          }());


          tempCtx.clearRect(0,0,width,height);
          var imageData = tempCtx.getImageData(0,0,width,height),
              pix = imageData.data;
          for (var i = 0, n = pix.length; i <n; i += 4) {
              var value = data[Math.floor(i / 4)];
              if (value < 0) {
                  pix[i] = 0;
                  pix[i + 1] = 0;
                  pix[i + 2] = 255;
                  pix[i + 3] = Math.round(Math.floor(Math.abs(value) / max / 0.1) * 0.1 * 255);
              } else {
                  pix[i] = 255;
                  pix[i + 1] = 0;
                  pix[i + 2] = 0;
                  pix[i + 3] = Math.round(Math.floor(Math.abs(value) / max / 0.1) * 0.1 * 255);
              }

          }

          ctx.putImageData(imageData, 0, 0);
      }
      draw();
  };

  var drawWord = function (data) {
    var width = w;
    var height = h;
    var svg = d3.select(container).append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // words
    svg.selectAll(".tag-name")
        .data(data)
      .enter().append("text")
        .attr("class", "tag-name")
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle")
        .text(function (d) { return d.name; });

    svg.append("rect")
        .attr("fill", 'none')
        .attr("stroke", 'black')
        .attr("width", width)
        .attr("height", height);

    var orient = [{
      x: 0,
      y: height / 2,
      text: '-'
    }, {
      x: width,
      y: height / 2,
      text: '+'
    }, {
      x: width / 2,
      y: 0,
      text: 'E'
    }, {
      x: width / 2,
      y: height,
      text: 'R'
    }];
    svg.selectAll('circle')
        .data(orient)
      .enter().append("circle")
        .attr("fill", '#fff')
        .attr("stroke", 'black')
        .attr("r", 10)
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });

    svg.selectAll('.orient')
        .data(orient)
      .enter().append("text")
        .attr("class", 'orient')
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y - 1; })
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("font-family", "monospace")
        .text(function (d) { return d.text; });
  };

  drawHeatmap(data);
  drawWord(data);

};
