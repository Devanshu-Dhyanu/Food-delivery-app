/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { Container, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextDecrypt } from "../content/TextDecrypt";
import { FirstName, LastName } from "../../utils/getName";
import Resume from "../../settings/resume.json";

import './About.css';

import profile from '../../assets/recentprojects/founder.png';

const useStyles = makeStyles((theme) => ({
  main: {
    maxWidth: '100vw',
    marginTop: '3em',
    marginBottom: "auto",
  },
}));

export const About = () => {
  const classes = useStyles();
  const [audioStatus, setAudioStatus] = useState("Ready to speak.");
  const [audioSpeaking, setAudioSpeaking] = useState(false);
  const greetings = "Hello there!";
  const aboutme = `I'm ${FirstName} ${LastName}, a full stack developer and national handball athlete studying Computer Science at Lovely Professional University. I build real products with HTML, CSS, JavaScript, React, Firebase, Python, and SQL.`;
  const audioResumeText = `Hello, I am ${Resume.basics.name}, a full stack developer and national handball athlete studying Computer Science at Lovely Professional University. I build real products with HTML, CSS, JavaScript, Firebase, and Python. I create fast, polished websites and applications backed by real-time systems. I am open to internships, freelance projects, and collaboration.`;

  const playAudioResume = () => {
    if (!window.speechSynthesis) {
      setAudioStatus("Audio resume is not supported in this browser.");
      return;
    }

    if (audioSpeaking) {
      window.speechSynthesis.cancel();
      setAudioSpeaking(false);
      setAudioStatus("Ready to speak.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(audioResumeText);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((item) => item.lang && item.lang.toLowerCase().startsWith("en-in"))
      || voices.find((item) => item.lang && item.lang.toLowerCase().startsWith("en"))
      || voices[0];

    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      setAudioSpeaking(true);
      setAudioStatus("Speaking...");
    };
    utterance.onend = () => {
      setAudioSpeaking(false);
      setAudioStatus("Audio finished.");
    };
    utterance.onerror = () => {
      setAudioSpeaking(false);
      setAudioStatus("Audio failed to play.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <section id="about">
      <Container component="main" className={classes.main} maxWidth="md">
        <div className="about">
          <div className="_img"
            style={{ 
              background: "url(" + profile + ")",
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
          </div>
          <div className="_content_wrapper">
            <Typography component='h2' variant="h5">
              <TextDecrypt text={`${greetings}`} />
            </Typography>
            <p className="aboutme">
              {aboutme}
            </p>
            <a href="#contact" className="contact-btn">
              <i className="fas fa-terminal"></i>
              <Typography component='span'> Send me a message.</Typography>
            </a>
            <button type="button" className="contact-btn audio-btn" onClick={playAudioResume}>
              <i className="fas fa-volume-up"></i>
              <Typography component='span'>
                {audioSpeaking ? ' Stop Audio Resume' : ' Play Audio Resume'}
              </Typography>
            </button>
            <p className="audio-status">{audioStatus}</p>
          </div>
        </div>
      </Container>
    </section>
  );
};
