import React from "react";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  svgHover: {
    fill: theme.palette.foreground.default,
    stroke: theme.palette.foreground.default,
    "&:hover": {
        fill: theme.palette.primary.main,
        stroke: theme.palette.primary.main,
    },
    transition: "all 0.5s ease",
  },
}));

export const Logo = () => {
    const classes = useStyles();

    return (
      <svg 
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        className={classes.svgHover}
      >
        <circle cx="60" cy="60" r="50" fill="none" strokeWidth="8" />
        <text
          x="60"
          y="66"
          textAnchor="middle"
          fontFamily="Roboto Mono, monospace"
          fontSize="42"
          fontWeight="700"
          stroke="none"
        >
          DD
        </text>
      </svg>
    );
};
