import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ImageSharpenClient } from "./components/ImageSharpenClient";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ImageSharpenClient />
  </StrictMode>,
);
