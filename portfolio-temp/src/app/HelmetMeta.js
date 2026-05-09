import React from "react";
import Helmet from "react-helmet";
import Resume from "../settings/resume.json";
import Settings from "../settings/settings.json";

export const HelmetMeta = () => {
    const location = [
        Resume.basics.location.city,
        Resume.basics.location.region,
        Resume.basics.location.country,
    ].filter(Boolean).join(", ");
    const title = location ? `${Resume.basics.name} | ${location}` : Resume.basics.name;

    return (
        <Helmet>
            <meta name="theme-color" content={Settings.colors.primary} />
            <title>{title}</title>
            <meta name="author" content={Resume.basics.name} />
            <meta name="description" content={Resume.basics.description} />
            <meta name="keywords" content={Resume.basics.keywords} />
        </Helmet>
    );
};
