// Importing D3.js components
const d3 = window.d3;

// Global parameters
let gaussianMean = 0;
let gaussianVariance = 1;
let negativeBinomialSize = 5;
let negativeBinomialProb = 0.5;

// Fixed Y-Axis Range
const fixedYAxisMax = 0.5; // Adjust this based on your data

// Function to reset global parameters to default values
function resetDefaults() {
  // Reset global parameters to their original default values
  gaussianMean = 0;
  gaussianVariance = 1;
  negativeBinomialSize = 5;
  negativeBinomialProb = 0.5;

  // Reset slider values
  document.getElementById("gaussian-mean").value = gaussianMean;
  document.getElementById("gaussian-variance").value = gaussianVariance;
  document.getElementById("negative-binomial-size").value = negativeBinomialSize;
  document.getElementById("negative-binomial-probability").value = negativeBinomialProb;

  // Update the displayed values next to sliders
  document.getElementById("gaussian-mean-value").innerText = gaussianMean;
  document.getElementById("gaussian-variance-value").innerText = gaussianVariance;
  document.getElementById("negative-binomial-size-value").innerText = negativeBinomialSize;
  document.getElementById("negative-binomial-probability-value").innerText = negativeBinomialProb;

  // Re-plot the distributions
  plotDistributions();
}

// Generate Gaussian distribution data
function generateGaussianData(mean, variance, points = 100) {
  const data = [];
  const standardDeviation = Math.sqrt(variance);
  const rangeStart = -10;
  const rangeEnd = 10;
  const step = (rangeEnd - rangeStart) / points;

  for (let x = rangeStart; x <= rangeEnd; x += step) {
    const y =
      (1 / (standardDeviation * Math.sqrt(2 * Math.PI))) *
      Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
    data.push({ x, y });
  }
  return data;
}

// Generate Negative Binomial distribution data
function generateNegativeBinomialData(size, prob, maxX = 20) {
  const data = [];
  function negativeBinomialPMF(k, size, prob) {
    function factorial(n) {
      return n <= 1 ? 1 : n * factorial(n - 1);
    }
    const combination = factorial(k + size - 1) / (factorial(k) * factorial(size - 1));
    return combination * Math.pow(prob, size) * Math.pow(1 - prob, k);
  }

  for (let k = 0; k <= maxX; k++) {
    const y = negativeBinomialPMF(k, size, prob);
    data.push({ x: k, y });
  }
  return data;
}

// Plot both distributions on the same chart with zoom behavior
function plotDistributions() {
  const gaussianData = generateGaussianData(gaussianMean, gaussianVariance);
  const negativeBinomialData = generateNegativeBinomialData(
    negativeBinomialSize,
    negativeBinomialProb
  );

  const svgWidth = window.innerWidth * 0.7 || 600; // 70% of the viewport width or fallback to 600
  const svgHeight = window.innerHeight * 0.9 || 500; // 90% of the viewport height or fallback to 500
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const width = Math.max(svgWidth - margin.left - margin.right, 0);
  const height = Math.max(svgHeight - margin.top - margin.bottom, 0);

  d3.select("svg").remove(); // Clear previous SVG for redrawing

  const svg = d3
    .select("#graph-container")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleLinear()
    .domain([-10, 20]) // Cover Gaussian (-10 to 10) and Non-negative binomial (0 to 20)
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, fixedYAxisMax]) // Fixed y-axis range
    .range([height, 0]);

  // Axes
  const xAxis = svg
    .append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale).ticks(10));
  const yAxis = svg.append("g").call(d3.axisLeft(yScale).ticks(10));

  // Gaussian line
  const gaussianLine = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  const gaussianPath = svg
    .append("path")
    .datum(gaussianData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", gaussianLine);

  // Negative Binomial line
  const negativeBinomialLine = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y));

  const negativeBinomialPath = svg
    .append("path")
    .datum(negativeBinomialData)
    .attr("fill", "none")
    .attr("stroke", "darkorange")
    .attr("stroke-width", 1.5)
    .attr("d", negativeBinomialLine);

  // Zoom behavior
  const zoom = d3
    .zoom()
    .scaleExtent([0.5, 10])
    .extent([
      [0, 0],
      [width, height],
    ])
    .on("zoom", (event) => {
      const newX = event.transform.rescaleX(xScale);

      xAxis.call(d3.axisBottom(newX).ticks(10));
      yAxis.call(d3.axisLeft(yScale).ticks(10)); // Y-Axis stays fixed

      gaussianPath.attr(
        "d",
        gaussianLine.x((d) => newX(d.x)).y((d) => yScale(d.y))
      );
      negativeBinomialPath.attr(
        "d",
        negativeBinomialLine.x((d) => newX(d.x)).y((d) => yScale(d.y))
      );
    });

  svg.call(zoom);

  // Legend data
  const legendData = [
    { color: "steelblue", label: "Gaussian Distribution" },
    { color: "darkorange", label: "Negative Binomial Distribution" },
  ];

  // Legend group
  const legend = svg.append("g").attr("transform", `translate(${width * 0.6}, 20)`);

  // Add legend rectangles
  legend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("class", "svg-legend-rect") // Add your custom class here
    .attr("width", 18)
    .attr("height", 18)
    .attr("fill", (d) => d.color)
    .attr("y", (d, i) => i * 25);

  // Add legend text with the specified class
  legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("class", "svg-legend-text") // Add your custom class here
    .attr("x", 24)
    .attr("y", (d, i) => i * 25 + 14)
    .text((d) => d.label);
}

// Update parameters and redraw charts
function updateGaussianMean(value) {
  gaussianMean = parseFloat(value);
  document.getElementById("gaussian-mean-value").innerText = value;
  plotDistributions();
}

function updateGaussianVariance(value) {
  gaussianVariance = parseFloat(value);
  document.getElementById("gaussian-variance-value").innerText = value;
  plotDistributions();
}

function updateNegativeBinomialSize(value) {
  negativeBinomialSize = parseInt(value);
  document.getElementById("negative-binomial-size-value").innerText = value;
  plotDistributions();
}

function updateNegativeBinomialProb(value) {
  negativeBinomialProb = parseFloat(value);
  document.getElementById("negative-binomial-probability-value").innerText = value;
  plotDistributions();
}

// Add event listeners to the sliders
document
  .getElementById("gaussian-mean")
  .addEventListener("input", (e) => updateGaussianMean(e.target.value));
document
  .getElementById("gaussian-variance")
  .addEventListener("input", (e) => updateGaussianVariance(e.target.value));
document
  .getElementById("negative-binomial-size")
  .addEventListener("input", (e) => updateNegativeBinomialSize(e.target.value));
document
  .getElementById("negative-binomial-probability")
  .addEventListener("input", (e) => updateNegativeBinomialProb(e.target.value));

// Add event listener to the reset button
document.getElementById("reset-button").addEventListener("click", resetDefaults);

// Initial plot with default values
plotDistributions();
plotDistributions();
