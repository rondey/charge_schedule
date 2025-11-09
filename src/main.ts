import { createApp } from "vue";
import "./style.css";
// Importa il CSS di Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

// Importa il JS bundle (include anche Popper)
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from "./App.vue";

createApp(App).mount("#app");
