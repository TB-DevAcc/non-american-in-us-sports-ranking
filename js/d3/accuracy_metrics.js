const metrics = ["0.5 risk", "0.9 risk", "average"];
const metricData = [
  {
    metric: "0.5 risk",
    models: [
      { name: "Snyder", values: { parts: 1.0, "ec-sub": 1.07, ec: 1.12 } },
      { name: "Croston", values: { parts: 1.83, "ec-sub": 0.88, ec: 1.39 } },
      { name: "ISSM", values: { parts: 1.06, "ec-sub": 1.0, ec: 1.0 } },
      { name: "ETS", values: { parts: 1.38, "ec-sub": 0.84, ec: 1.23 } },
      { name: "rnn-gaussian", values: { parts: 1.56, "ec-sub": 0.85, ec: 1.14 } },
      { name: "rnn-negbin", values: { parts: 1.0, "ec-sub": 0.85, ec: 0.92 } },
      { name: "DeepAR", values: { parts: 1.01, "ec-sub": 0.73, ec: 0.98 } },
    ],
  },
  {
    metric: "0.9 risk",
    models: [
      { name: "Snyder", values: { parts: 1.0, "ec-sub": 1.17, ec: 1.01 } },
      { name: "Croston", values: { parts: 0, "ec-sub": 0, ec: 0 } },
      { name: "ISSM", values: { parts: 1.06, "ec-sub": 1.0, ec: 1.0 } },
      { name: "ETS", values: { parts: 1.04, "ec-sub": 0.74, ec: 1.11 } },
      { name: "rnn-gaussian", values: { parts: 1.04, "ec-sub": 0.67, ec: 0.9 } },
      { name: "rnn-negbin", values: { parts: 0.99, "ec-sub": 0.78, ec: 0.98 } },
      { name: "DeepAR", values: { parts: 0.94, "ec-sub": 0.57, ec: 0.91 } },
    ],
  },
  {
    metric: "average",
    models: [
      { name: "Snyder", values: { parts: 1.0, "ec-sub": 1.16, ec: 1.05 } },
      { name: "Croston", values: { parts: 1.97, "ec-sub": 1.2, ec: 1.34 } },
      { name: "ISSM", values: { parts: 1.08, "ec-sub": 1.0, ec: 1.0 } },
      { name: "ETS", values: { parts: 1.23, "ec-sub": 1.07, ec: 1.11 } },
      { name: "rnn-gaussian", values: { parts: 1.19, "ec-sub": 1.21, ec: 1.01 } },
      { name: "rnn-negbin", values: { parts: 0.99, "ec-sub": 1.17, ec: 0.93 } },
      { name: "DeepAR", values: { parts: 0.94, "ec-sub": 0.77, ec: 0.85 } },
    ],
  },
];

const svgWidth = window.innerWidth * 0.7 || 700; // Increase if necessary
const svgHeight = window.innerHeight * 0.9 || 500;
const margin = { top: 20, right: 20, bottom: 70, left: 70 }; // Increase left margin
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Select the container and append SVG
const svg = d3
  .select("#accuracy-metrics-chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales and axes
const x0 = d3.scaleBand().rangeRound([0, width]).paddingInner(0.1);
const x1 = d3.scaleBand().padding(0.05);
const y = d3.scaleLinear().rangeRound([height, 0]);
const xAxis = d3.axisBottom(x0);
const yAxis = d3.axisLeft(y);

// Initialize zoom behavior
const zoom = d3
  .zoom()
  .scaleExtent([1, 10])
  .extent([
    [0, 0],
    [width, height],
  ])
  .on("zoom", zoomed);

function zoomed(event) {
  svg.attr("transform", event.transform);
}

svg.call(zoom);

// Define patterns in defs
const defs = svg.append("defs");

defs
  .append("pattern")
  .attr("id", "stripe")
  .attr("width", 4)
  .attr("height", 4)
  .attr("patternUnits", "userSpaceOnUse")
  .append("path")
  .attr("d", "M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2")
  .attr("stroke", "black")
  .attr("stroke-width", 1);

defs
  .append("pattern")
  .attr("id", "dot")
  .attr("width", 10)
  .attr("height", 10)
  .attr("patternUnits", "userSpaceOnUse")
  .append("circle")
  .attr("cx", 5)
  .attr("cy", 5)
  .attr("r", 2)
  .attr("fill", "black");

defs
  .append("pattern")
  .attr("id", "cross")
  .attr("width", 10)
  .attr("height", 10)
  .attr("patternUnits", "userSpaceOnUse")
  .append("path")
  .attr("d", "M0,5 L10,5 M5,0 L5,10")
  .attr("stroke", "black")
  .attr("stroke-width", 2);

var redTintFilter = defs.append("filter").attr("id", "redTint");

redTintFilter
  .append("feColorMatrix")
  .attr("type", "matrix")
  .attr("values", "1.0 0.5 0.5 0.5 0 0 0.1 0 0 0 0 0 0.1 0 0 0 0 0 1 0");

function updateChart(index) {
  const metric = metrics[index];
  renderChart(metricData, metric);
  // Update the header to show the current metric
  d3.select("#dar-metric-header").text(`${metric}`);
}

// Function to render the chart
function renderChart(data, metric) {
  const metricData = data.find((d) => d.metric === metric).models;

  // Prepare the data
  x0.domain(metricData.map((d) => d.name));
  x1.domain(["parts", "ec-sub", "ec", "DeepAR"]).rangeRound([0, x0.bandwidth()]);
  y.domain([0, 2]).nice();

  // Update axes
  svg.selectAll(".axis").remove();
  svg.append("g").attr("class", "x axis").attr("transform", `translate(0,${height})`).call(xAxis);

  // Y-Axis with corrected label position
  const yAxisG = svg.append("g").attr("class", "y axis").call(yAxis);

  yAxisG
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60) // Adjusted left of the axis more
    .attr("x", 0 - height / 2)
    .attr("dy", "0.71em")
    .attr("text-anchor", "middle")
    .style("fill", "black") // Ensure text color is visible
    .text("Accuracy relative to baseline");

  svg
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", y(1.0))
    .attr("y2", y(1.0))
    .attr("stroke", "#6510AD")
    .attr("stroke-dasharray", 2);

  // Implementing and fixing the legend without DeepAR
  const legendData = ["parts", "ec-sub", "ec"]; // Exclude DeepAR from legend

  const legend = svg
    .selectAll(".legend")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(0,${i * 20})`);

  legend
    .append("rect")
    .attr("x", width - 18)
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => `url(#${d === "parts" ? "stripe" : d === "ec-sub" ? "dot" : "cross"})`);

  legend
    .append("text")
    .attr("x", width - 24)
    .attr("y", 9)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .style("fill", "black") // Ensure text color is set
    .text((d) => d);

  // Update bars
  const model = svg.selectAll(".model").data(metricData);

  model
    .enter()
    .append("g")
    .attr("class", (d) => "model" + (" " + d.name + "-model-bars"))
    .merge(model)
    .attr("transform", (d) => `translate(${x0(d.name)},0)`);

  // Define the datasets without DeepAR for default pattern assignment
  const datasets = ["parts", "ec-sub", "ec"];

  // Update bars with specific handling for non-DeepAR datasets
  const bars = model
    .selectAll("rect")
    .data((d) => datasets.map((key) => ({ key, value: d.values[key] || 0 })));

  bars
    .enter()
    .append("rect")
    .merge(bars)
    .transition() // Transition for smooth updating
    .duration(500)
    .ease(d3.easeCubicInOut)
    .attr("x", (d) => x1(d.key))
    .attr("y", (d) => y(Math.max(0, d.value)))
    .attr("width", x1.bandwidth())
    .attr("height", (d) => Math.max(0, height - y(Math.max(0, d.value))))
    .attr(
      "fill",
      (d) => `url(#${d.key === "parts" ? "stripe" : d.key === "ec-sub" ? "dot" : "cross"})`
    )
    .attr("stroke", "black")
    .attr("class", (d) => d.key); // Add class for later specific styling if needed

  model.selectAll("g.DeepAR-model-bars rect").attr("filter", "url(#redTint)");

  model.exit().remove();
  bars.exit().remove();
}

var currentMetricIndex = 0; // Initial index for the current metric (0.5 risk)

var _transitions = [
  {
    transitionForward: () => {
      currentMetricIndex = 1; // Move to 0.9 risk
      updateChart(currentMetricIndex);
    },
    transitionBackward: () => {
      currentMetricIndex = 0; // Move back to 0.5 risk
      updateChart(currentMetricIndex);
    },
  },
  {
    transitionForward: () => {
      currentMetricIndex = 2; // Move to average
      updateChart(currentMetricIndex);
    },
    transitionBackward: () => {
      currentMetricIndex = 1; // Move back to 0.9 risk
      updateChart(currentMetricIndex);
    },
  },
];

updateChart(0);
updateChart(0);
