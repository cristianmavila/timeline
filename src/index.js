import React from "react";
import { render } from "react-dom";
import Timeline from "./components/Timeline/Timeline";

const App = () => (
  <div>
    <h2>Start editing to see some magic happen {"\u2728"}</h2>
    <Timeline />
  </div>
);

render(<App />, document.getElementById("root"));
