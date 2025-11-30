import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

// Importa il CSS di Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Importa il JS bundle (include anche Popper)
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
