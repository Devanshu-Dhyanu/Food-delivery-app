/* eslint-disable no-unused-vars */
import React from "react";
import { Container } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextDecrypt } from "../content/TextDecrypt";

import './Works.css';

// Import ../../assets/recentprojects/
import Portfolio from '../../assets/recentprojects/react-portfolio.png';
import Veritru from '../../assets/recentprojects/veritru.png';
import Lofo from '../../assets/recentprojects/lofo.png';
import Startup from '../../assets/recentprojects/startup.png';

const useStyles = makeStyles((theme) => ({
  main: {
    maxWidth: '100vw',
    marginTop: '3em',
    marginBottom: "auto",
  },
}));

export const Works = () => {
  const classes = useStyles();
  const projects = [
    { 
      id: 1,
      title: 'React + Firebase Web Apps',
      description: `Building fast, polished web applications with React and Firebase, including real-time systems and clean frontend experiences.`,
      alter: 'React Firebase Web Apps',
      image: `${Portfolio}`,
    },
    { 
      id: 2,
      title: 'Python Projects',
      description: `Exploring Python for practical problem solving, automation, and data-focused experiments while strengthening core programming concepts.`,
      alter: 'Python Projects',
      image: `${Startup}`,
    },
    { 
      id: 3,
      title: 'DSA and LeetCode',
      description: `Practicing algorithms and data structures on LeetCode to build stronger problem-solving habits and interview readiness.`,
      alter: 'DSA and LeetCode',
      image: `${Lofo}`,
    },
    { 
      id: 4,
      title: 'Portfolio Systems',
      description: `Creating portfolio experiences that present skills, achievements, contact paths, and real project work in one polished profile.`,
      alter: 'Portfolio Systems',
      image: `${Veritru}`,
    }
  ];

  return (
    <section id="works">
      <Container component="main" className={classes.main} maxWidth="md">
        {projects.map((project) => (
          <div className="project" key={ project.id }>
            <div className="__img_wrapper">
              <img src={ project.image } alt={ project.alter }/>
            </div>
            <div className="__content_wrapper">
              <h3 className="title">
                <TextDecrypt text={ project.id + '. ' + project.title } />
              </h3>
              <p className="description">
                { project.description }
              </p>
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
};
