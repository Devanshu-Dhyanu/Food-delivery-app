import React, { lazy } from "react";

import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { HelmetMeta } from "./HelmetMeta";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { CssBaseline } from "@material-ui/core";
import { logCredits } from "../utils/logCredits";

import { Home } from "../pages/Home";
import { Resume as ResumePage } from "../pages/Resume";
import { Vajra } from "../pages/Vajra";
import { ContactPage } from "../pages/ContactPage";

const PageNotFound = lazy(() => import("../pages/PageNotFound"));

export const App = () => {
    logCredits();

    return (
      <ThemeProvider>
        <CssBaseline />
        <Router>
          <HelmetMeta />
          <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/vajra" component={Vajra} />
              <Route path="/contact" component={ContactPage} />
              <Route path="/resume" component={ResumePage} />
              <Route path="*" component={PageNotFound} />
          </Switch>
        </Router>
      </ThemeProvider>
    );
};
