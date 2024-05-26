function updateGraphSize() {
  const container = document.getElementById("graph-container");
  const width = container.clientWidth || 800; // Set default width if clientWidth is not available
  const height = container.clientHeight || 600; // Set default height if clientHeight is not available
  const margin = 20; // Margin to prevent overflow

  const svg = d3
    .select("#graph-container")
    .select("svg")
    .attr("width", width - margin)
    .attr("height", height - margin);

  renderGraph(width - margin, height - margin); // Adjust width and height for margins
}

var svgGroup = null;
var graph = null;

// Define transitions
var _transitions = [
  {
    transitionForward: () => fadeInElement(0),
    transitionBackward: () => fadeOutElement(0),
    index: 0,
  },
  {
    transitionForward: () => fadeInElement(1),
    transitionBackward: () => fadeOutElement(1),
    index: 1,
  },
  {
    transitionForward: () => fadeInElement(2),
    transitionBackward: () => fadeOutElement(2),
    index: 2,
  },
  {
    transitionForward: () => fadeInElement(3),
    transitionBackward: () => fadeOutElement(3),
    index: 3,
  },
  {
    transitionForward: () => fadeInElement(4),
    transitionBackward: () => fadeOutElement(4),
    index: 4,
  },
  {
    transitionForward: () => fadeInElement(5),
    transitionBackward: () => fadeOutElement(5),
    index: 5,
  },
];

function fadeElement(orderId, opacity) {
  if (svgGroup && graph) {
    // Retrieve the node DOM element array
    const allNodes = svgGroup.selectAll("g.node").nodes();

    // Check if the index is valid
    if (orderId >= 0 && orderId < allNodes.length) {
      // Select the specific node and apply the transition
      var node = svgGroup.selectAll(".node").filter(function (d, index) {
        return index === orderId;
      });
      var nodeId = node.datum();
      node.transition().duration(500).style("opacity", opacity);

      // Retrieve node edges (both incoming and outgoing)
      var incomingEdges = svgGroup.selectAll(".edgePath").filter(function (d) {
        return d.w === nodeId;
      });

      // Apply transition to connected incoming edges
      incomingEdges.each(function () {
        d3.select(this).transition().duration(500).style("opacity", opacity);
      });
    } else {
      console.warn(`Invalid index: ${orderId}. Total nodes: ${allNodes.length}`);
    }
  } else {
    console.warn("svgGroup or graph is not defined.");
  }
}

function fadeInElement(orderId) {
  fadeElement(orderId, 1);
}
function fadeOutElement(orderId) {
  fadeElement(orderId, 0.25);
}

function renderGraph(width, height) {
  // Select or create the SVG element
  let svg = d3.select("#graph-container").select("svg");
  if (svg.empty()) {
    svg = d3.select("#graph-container").append("svg");
  }
  svg.attr("width", width).attr("height", height);

  // Select or create the g element
  svgGroup = svg.select("g");
  if (svgGroup.empty()) {
    svgGroup = svg.append("g");
  }

  // Configure the g element's transformation
  svgGroup.attr("transform", "translate(40,20)");

  // Create and configure the zoom behavior
  const zoom = d3.zoom().on("zoom", function (event) {
    svgGroup.attr("transform", event.transform);
  });
  svg.call(zoom);

  // Create and configure the graph
  graph = new dagreD3.graphlib.Graph().setGraph({ rankdir: "LR" }).setDefaultEdgeLabel(() => ({}));

  // Load the graph data and construct the graph
  d3.json("./flow_graph.json").then((data) => {
    // Create nodes
    data.nodes.forEach((node) => {
      graph.setNode(node.id, {
        labelType: "html",
        label: `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <svg class="bi" width="32" height="32" fill="currentColor">
        <use xlink:href="../../src/icons/bootstrap-icons.svg#${node.icon}" />
      </svg>
      <span class="node-label">${node.label}</span>  <!-- Apply the class here -->
    </div>`,
        class: node.class,
      });
    });

    data.edges.forEach((edge) => {
      graph.setEdge(edge.source, edge.target);
    });

    // Add IDs to edges
    svgGroup.selectAll("g.edgePath").each(function () {
      var edge = d3.select(this);
      var edgeData = edge.datum();
      var edgeId = `edge${edgeData.v}-${edgeData.w}`;
      edge.attr("id", edgeId);
    });

    // Render the graph
    const render = dagreD3.render();
    render(svgGroup, graph);

    // Apply initial opacity
    svgGroup.selectAll("g.node, g.edgePath").style("opacity", 0.25);

    // Center the graph
    const xCenterOffset = (svg.attr("width") - graph.graph().width) / 2;
    const yCenterOffset = (svg.attr("height") - graph.graph().height) / 2;
    svgGroup.attr("transform", "translate(" + xCenterOffset + ", " + yCenterOffset + ")");
  });
}

d3.select("#graph-container").append("svg").append("g");
updateGraphSize(); // Set the initial size based on the current viewport
window.addEventListener("resize", updateGraphSize); // Adjust the size on window resize
