import React from "react";
import { PortfolioLink } from "../PortfolioLink";

export const PageNotFound = () => {
  return (
    <main
      style={{
        minHeight: "40vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "2rem",
        background: "#0f131a",
        color: "#e8ecf4",
        fontFamily: "Roboto, system-ui, sans-serif",
      }}
    >
      <p>Page not found</p>
      <PortfolioLink to="/" style={{ color: "#9eb5f0" }}>
        Back to portfolio home
      </PortfolioLink>
    </main>
  );
};
