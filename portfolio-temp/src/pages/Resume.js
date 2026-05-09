import React from "react";
import { Container, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ResumeData from "../settings/resume.json";

const useStyles = makeStyles((theme) => ({
    page: {
        minHeight: "100vh",
        paddingTop: theme.spacing(8),
        paddingBottom: theme.spacing(8),
    },
    header: {
        marginBottom: theme.spacing(5),
    },
    section: {
        marginTop: theme.spacing(4),
    },
    list: {
        paddingLeft: theme.spacing(3),
        lineHeight: 1.8,
    },
    profileLinks: {
        display: "flex",
        gap: theme.spacing(2),
        flexWrap: "wrap",
        marginTop: theme.spacing(2),
    },
}));

export const Resume = () => {
    const classes = useStyles();
    const { basics, work, education, skills, interests } = ResumeData;

    return (
        <Container component="main" maxWidth="md" className={classes.page}>
            <Link href="/" color="inherit">
                Back to portfolio
            </Link>

            <header className={classes.header}>
                <Typography variant="h2" component="h1">
                    {basics.name}
                </Typography>
                <Typography variant="h5" component="p">
                    {basics.label} | {basics.location.city}, {basics.location.region}
                </Typography>
                <div className={classes.profileLinks}>
                    <Link href={`mailto:${basics.email}`} color="inherit">
                        {basics.email}
                    </Link>
                    {basics.profiles.map((profile) => (
                        <Link
                            key={profile.network}
                            href={profile.url}
                            color="inherit"
                            target={profile.url.startsWith("http") ? "_blank" : undefined}
                            rel={profile.url.startsWith("http") ? "noopener noreferrer" : undefined}
                        >
                            {profile.network}
                        </Link>
                    ))}
                </div>
            </header>

            <section className={classes.section}>
                <Typography variant="h4" component="h2">
                    Professional Summary
                </Typography>
                <Typography component="p">{basics.description}</Typography>
                <Typography component="p">
                    Open to internships, freelance projects, and collaboration.
                </Typography>
            </section>

            <section className={classes.section}>
                <Typography variant="h4" component="h2">
                    Technical Skills
                </Typography>
                <ul className={classes.list}>
                    {skills.map((skill) => (
                        <li key={skill.name}>
                            <strong>{skill.name}:</strong> {skill.keywords.join(", ")}
                        </li>
                    ))}
                </ul>
            </section>

            <section className={classes.section}>
                <Typography variant="h4" component="h2">
                    Experience
                </Typography>
                {work.map((item) => (
                    <div key={item.company}>
                        <Typography variant="h6" component="h3">
                            {item.company}
                        </Typography>
                        <Typography component="p">{item.summary}</Typography>
                        <ul className={classes.list}>
                            {item.highlights.map((highlight) => (
                                <li key={highlight}>{highlight}</li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>

            <section className={classes.section}>
                <Typography variant="h4" component="h2">
                    Education
                </Typography>
                {education.map((item) => (
                    <Typography component="p" key={item.institution}>
                        {item.studyType} in {item.area}, {item.institution} ({item.startDate} - {item.endDate})
                    </Typography>
                ))}
            </section>

            <section className={classes.section}>
                <Typography variant="h4" component="h2">
                    Additional
                </Typography>
                <ul className={classes.list}>
                    {interests.map((item) => (
                        <li key={item.name}>
                            <strong>{item.name}:</strong> {item.keywords.join(", ")}
                        </li>
                    ))}
                </ul>
            </section>
        </Container>
    );
};
