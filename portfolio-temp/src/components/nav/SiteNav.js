import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./SiteNav.css";

const links = [
  { label: "Home", to: "/" },
  { label: "Vajra", to: "/vajra" },
  { label: "Contact", to: "/contact" },
  { label: "Contribute GIHUB", to: "/contact" },
];

export const SiteNav = () => {
  const location = useLocation();

  return (
    <nav className="site-nav" aria-label="Primary">
      {links.map((link) => {
        const isActive =
          link.to === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(link.to);

        return (
          <Link
            key={link.to}
            to={link.to}
            className={`site-nav-link${isActive ? " site-nav-link-active" : ""}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};
