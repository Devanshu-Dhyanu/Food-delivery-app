import React from "react";
import { usePortfolioNav } from "../../PortfolioNavigationContext";
import { PortfolioLink } from "../../PortfolioLink";
import "./SiteNav.css";

const links = [
  { label: "Home", to: "/" },
  { label: "Vajra", to: "/vajra" },
  { label: "Contact", to: "/contact" },
  { label: "Contribute GIHUB", to: "/contact" },
];

export const SiteNav = () => {
  const { pathname } = usePortfolioNav();

  return (
    <nav className="site-nav" aria-label="Primary">
      {links.map((link) => {
        const isActive =
          link.to === "/"
            ? pathname === "/"
            : pathname === link.to || pathname.startsWith(`${link.to}/`);

        return (
          <PortfolioLink
            key={`${link.label}-${link.to}`}
            to={link.to}
            className={`site-nav-link${isActive ? " site-nav-link-active" : ""}`}
          >
            {link.label}
          </PortfolioLink>
        );
      })}
    </nav>
  );
};
