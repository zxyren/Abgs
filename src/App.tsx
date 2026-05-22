import { Router } from "wouter";
import { Index } from "./routes/index";

export function App() {
  return (
    <Router>
      <Index />
    </Router>
  );
}
