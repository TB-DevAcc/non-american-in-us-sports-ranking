// Mock data for the parts dataset
const partsCategories = [
  { category: "Engine", count: 1200 },
  { category: "Transmission", count: 900 },
  { category: "Brakes", count: 700 },
  { category: "Suspension", count: 500 },
  { category: "Electrical", count: 300 },
  { category: "Exhaust", count: 400 },
  { category: "Cooling", count: 600 },
  { category: "Interior", count: 550 },
];

// Time-based sales trends for the Engine category (monthly)
const engineMonthlySales = [
  { month: "January", sales: 200 },
  { month: "February", sales: 220 },
  { month: "March", sales: 250 },
  { month: "April", sales: 300 },
  { month: "May", sales: 280 },
  { month: "June", sales: 310 },
  { month: "July", sales: 340 },
  { month: "August", sales: 360 },
  { month: "September", sales: 320 },
  { month: "October", sales: 290 },
  { month: "November", sales: 260 },
  { month: "December", sales: 240 },
];

// Dimensions and margins
const margin = { top: 40, right: 20, bottom: 50, left: 60 };
const width = 700 - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

// Bar chart for parts categories
const svg1 = d3
  .select("#parts-categories-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const x1 = d3
  .scaleBand()
  .range([0, width])
  .domain(partsCategories.map((d) => d.category))
  .padding(0.3);

const y1 = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, d3.max(partsCategories, (d) => d.count)]);

svg1.append("g").call(d3.axisLeft(y1).tickSize(-width).tickFormat(d3.format("d")));

svg1.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x1));

svg1
  .selectAll(".bar")
  .data(partsCategories)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (d) => x1(d.category))
  .attr("y", (d) => y1(d.count))
  .attr("width", x1.bandwidth())
  .attr("height", (d) => height - y1(d.count))
  .style("fill", "steelblue");

svg1
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.bottom / 1.5})`)
  .style("text-anchor", "middle")
  .attr("class", "axis-label")
  .text("Part Categories");

svg1
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .style("text-anchor", "middle")
  .attr("class", "axis-label")
  .text("Count");

// Line chart for engine monthly sales trends
const svg2 = d3
  .select("#engine-monthly-chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const x2 = d3
  .scaleBand()
  .range([0, width])
  .domain(engineMonthlySales.map((d) => d.month))
  .padding(0.3);

const y2 = d3
  .scaleLinear()
  .range([height, 0])
  .domain([0, d3.max(engineMonthlySales, (d) => d.sales)]);

svg2.append("g").call(d3.axisLeft(y2).tickSize(-width).tickFormat(d3.format("d")));

svg2.append("g").attr("transform", `translate(0, ${height})`).call(d3.axisBottom(x2));

svg2
  .append("path")
  .datum(engineMonthlySales)
  .attr("fill", "none")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2)
  .attr(
    "d",
    d3
      .line()
      .x((d) => x2(d.month) + x2.bandwidth() / 2)
      .y((d) => y2(d.sales))
  );

svg2
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.bottom / 1.5})`)
  .style("text-anchor", "middle")
  .attr("class", "axis-label")
  .text("Month");

svg2
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .style("text-anchor", "middle")
  .attr("class", "axis-label")
  .text("Sales");
