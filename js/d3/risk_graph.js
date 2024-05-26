// Responsive dimensions
const svgWidth = window.innerWidth * 0.7 || 700;
const svgHeight = window.innerHeight * 0.9 || 500;
const margin = { top: 20, right: 20, bottom: 70, left: 70 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Append SVG element to the container
const svg = d3
  .select("#svg-container")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Generate simulated data
const meanTemp = 25;
const stdTemp = 3;
const samples = Array.from({ length: 1000 }, () => d3.randomNormal(meanTemp, stdTemp)());

// Create the x scale
const x = d3
  .scaleLinear()
  .domain([d3.min(samples) - 1, d3.max(samples) + 1])
  .range([0, width]);

// Create the y scale
const histogram = d3.histogram().domain(x.domain()).thresholds(x.ticks(30));

const bins = histogram(samples);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(bins, (d) => d.length)])
  .range([height, 0]);

// Add the x axis
const xAxis = svg
  .append("g")
  .attr("class", "axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add the y axis with reduced ticks
const yAxis = svg.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5));

// Add x axis label
svg
  .append("text")
  .attr("class", "axis-label")
  .attr("x", width / 2)
  .attr("y", height + margin.bottom - 20)
  .style("text-anchor", "middle")
  .text("Temperature (°C)");

// Add y axis label
svg
  .append("text")
  .attr("class", "axis-label")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", -margin.left + 20)
  .style("text-anchor", "middle")
  .text("Density");

// Add the bars
const bars = svg
  .selectAll(".bar")
  .data(bins)
  .enter()
  .append("rect")
  .attr("class", "hist-bar")
  .attr("x", 1)
  .attr("transform", (d) => "translate(" + x(d.x0) + "," + y(d.length) + ")")
  .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
  .attr("height", (d) => height - y(d.length));

// Calculate percentiles
const medianValue = d3.quantile(samples.sort(d3.ascending), 0.5);
const percentile90Value = d3.quantile(samples.sort(d3.ascending), 0.9);

// Add median line
const medianLine = svg
  .append("line")
  .attr("class", "median-line")
  .attr("x1", x(medianValue))
  .attr("x2", x(medianValue))
  .attr("y1", 0 - 30)
  .attr("y2", height + 30);

const medianLabel = svg
  .append("text")
  .attr("class", "median-label")
  .attr("x", x(medianValue) - 10)
  .attr("y", height / 2)
  .attr("dy", "1.8em")
  .attr("transform", `rotate(90,${x(medianValue) + 5},${height / 2})`)
  .text("Median")
  .attr("fill", "#B03060");

// Add 90th percentile line
const percentileLine = svg
  .append("line")
  .attr("class", "percentile-line")
  .attr("x1", x(percentile90Value))
  .attr("x2", x(percentile90Value))
  .attr("y1", 0 - 30)
  .attr("y2", height + 30);

const percentileLabel = svg
  .append("text")
  .attr("class", "percentile-label")
  .attr("x", x(percentile90Value) + 5)
  .attr("y", height / 2)
  .attr("dy", "1.8em")
  .attr("transform", `rotate(90,${x(percentile90Value) + 5},${height / 2})`)
  .text("90th")
  .attr("fill", "#6510AD");

// Zoom behavior
const zoom = d3
  .zoom()
  .scaleExtent([0.5, 10])
  .translateExtent([
    [0, 0],
    [width, height],
  ])
  .extent([
    [0, 0],
    [width, height],
  ])
  .on("zoom", zoomed);

svg.call(zoom);

function zoomed(event) {
  // Create new scales based on the zoom event
  const new_x = event.transform.rescaleX(x);
  const new_y = event.transform.rescaleY(y);

  // Update axes
  xAxis.call(d3.axisBottom(new_x));
  yAxis.call(d3.axisLeft(new_y).ticks(5));

  // Update bars
  bars
    .attr("transform", (d) => "translate(" + new_x(d.x0) + "," + new_y(d.length) + ")")
    .attr("width", (d) => new_x(d.x1) - new_x(d.x0) - 1)
    .attr("height", (d) => height - new_y(d.length));

  // Update percentile lines and labels
  medianLine.attr("x1", new_x(medianValue)).attr("x2", new_x(medianValue));
  medianLabel.attr("x", new_x(medianValue) + 5).attr("y", height / 2);

  percentileLine.attr("x1", new_x(percentile90Value)).attr("x2", new_x(percentile90Value));
  percentileLabel.attr("x", new_x(percentile90Value) + 5).attr("y", height / 2);

  meanLine.attr("x1", new_x(meanTemp)).attr("x2", new_x(meanTemp));
  meanLabel.attr("x", new_x(meanTemp) + 5).attr("y", height / 2);
}
