// Importing Reveal and plugins
import Reveal from "./dist/reveal.esm.js";
import Zoom from "./plugin/zoom/zoom.esm.js";
import Notes from "./plugin/notes/notes.esm.js";
import Search from "./plugin/search/search.esm.js";
import Markdown from "./plugin/markdown/markdown.esm.js";
import Highlight from "./plugin/highlight/highlight.esm.js";
import RevealMenu from "./plugin/menu/menu.esm.js";

async function loadSlides() {
  const slidePaths = ["slides/title.html", "slides/agenda.html"];

  const slideContainer = document.querySelector(".slides");
  for (let path of slidePaths) {
    const response = await fetch(path);
    const text = await response.text();
    slideContainer.innerHTML += text;
  }
}

async function initializeReveal() {
  await loadSlides(); // Ensure slides are loaded before initializing Reveal
  Reveal.initialize({
    width: "100%",
    height: "100%",
    margin: 0.0,
    controls: true,
    progress: true,
    center: true,
    hash: true,
    slideNumber: "c/t",
    plugins: [Zoom, Notes, Search, Markdown, Highlight, RevealMenu],
  });
}

// Call the initialize function
initializeReveal();
