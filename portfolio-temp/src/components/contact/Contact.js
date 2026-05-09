/* eslint-disable no-unused-vars */
import React from "react";
import { useRef } from "react";
import { Container, Typography, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { TextDecrypt } from "../content/TextDecrypt";
import Resume from "../../settings/resume.json";

import './Contact.css';

const useStyles = makeStyles((theme) => ({
  main: {
    maxWidth: '100vw',
    marginTop: '3em',
    marginBottom: "3em",
  },
  form: {
    width: '100%',
  },
  formfield: {
    width: '100%',
    marginBottom: '2rem',
  },
}));



export const Contact = () => {
  const classes = useStyles();
  const greetings = "Say hello.";

  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    const formData = new FormData(form.current);
    const name = formData.get('name') || 'Portfolio visitor';
    const email = formData.get('email') || '';
    const message = formData.get('message') || '';
    const subject = encodeURIComponent(`Portfolio message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

    window.location.href = `mailto:${Resume.basics.email}?subject=${subject}&body=${body}`;
    e.target.reset();
  };



    return (
      <section id="contact">
        <Container component="main" className={classes.main} maxWidth="md">
          <div className="contact">
            <div className="_form_wrapper">
              <form ref={form} onSubmit={sendEmail} className={classes.form}>
                <TextField
                  id="outlined-name-input"
                  label="Name"
                  type="text"
                  size="small"
                  variant="filled"
                  name="name"
                  required
                  className={classes.formfield}
                />
                <TextField
                  id="outlined-email-input"
                  label="Email"
                  type="email"
                  size="small"
                  variant="filled"
                  name="email"
                  required
                  className={classes.formfield}
                />
                <TextField
                  id="outlined-message-input"
                  label="Message"
                  type="textarea"
                  size="small"
                  multiline
                  minRows={5}
                  variant="filled"
                  name="message"
                  required
                  className={classes.formfield}
                />
                <button type="submit" value="Send" className="submit-btn">
                <i className="fas fa-terminal"></i>
                  <Typography component='span'> Send Message</Typography>
                </button>
              </form>
            </div>
            <h1 className="contact_msg">
              <TextDecrypt text={greetings}/>
            </h1>
          </div>
        </Container>
      </section>
  );
};
