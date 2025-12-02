import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

import "flyonui/flyonui";

const app = mount(App, {
  target: document.getElementById("app")!,
});

export default app;
