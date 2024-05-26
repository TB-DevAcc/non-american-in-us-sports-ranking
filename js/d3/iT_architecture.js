// Define the transitions for each rectangle
var _transitions = [
  {
    transitionForward: () => fadeOutElement("#rect-mask-1"),
    transitionBackward: () => fadeInElement("#rect-mask-1"),
    index: 0,
  },
  {
    transitionForward: () => fadeOutElement("#rect-mask-2"),
    transitionBackward: () => fadeInElement("#rect-mask-2"),
    index: 1,
  },
  {
    transitionForward: () => fadeOutElement("#rect-mask-3"),
    transitionBackward: () => fadeInElement("#rect-mask-3"),
    index: 2,
  },
  {
    transitionForward: () => fadeOutElement("#rect-mask-4"),
    transitionBackward: () => fadeInElement("#rect-mask-4"),
    index: 3,
  },
];

// Functions to fade elements in and out
function fadeInElement(id) {
  if (d3.select(id).node()) {
    console.log("fade in", id);
    d3.select(id)
      .transition()
      .duration(1000) // transition duration in milliseconds
      .style("opacity", 1); // target opacity for fade in
  }
}

function fadeOutElement(id) {
  if (d3.select(id).node()) {
    console.log("fade out", id);
    d3.select(id).transition().duration(1000).style("opacity", 0); // target opacity for fade out
  }
}

// Load and display the SVG
fetch("../../src/img/iT_architecture_rects.svg")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("svg-container").innerHTML = data;
  })
  .catch((error) => console.error("Error loading the SVG:", error));
