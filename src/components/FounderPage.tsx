import { useEffect } from 'react';
import { VAJRA_INTERNAL_PATH_CHANGE_EVENT } from '../lib/vajraNavigationEvents';
import { DEFAULT_SEO } from '../lib/seo';
import PortfolioIntegratedApp from '../founder-portfolio/PortfolioIntegratedApp';

interface FounderPageProps {
  onNavigate?: (page: string) => void;
  publicView?: boolean;
}

const FOUNDER_NAME = 'Devanshu Dhyanu';
const FOUNDER_ROLE = 'Founder, The Vajra Campus Delivery';
const FOUNDER_EMAIL = 'founder-thevajra@vajracognixia.in';
const FOUNDER_INSTAGRAM_URL = 'https://www.instagram.com/devanshu_dhyanu/';
const COMPANY_INSTAGRAM_URL = 'https://www.instagram.com/vajracognixia.in/';
const DEFAULT_TITLE = DEFAULT_SEO.title;
const DEFAULT_DESCRIPTION = DEFAULT_SEO.description;
const DEFAULT_CANONICAL = DEFAULT_SEO.canonical;
const DEFAULT_IMAGE = DEFAULT_SEO.image;

const FOUNDER_TITLE = `${FOUNDER_NAME} | Founder of The Vajra Campus Delivery`;
const FOUNDER_DESCRIPTION =
  `${FOUNDER_NAME} is the founder of The Vajra Campus Delivery. Read the founder story, mission, and product vision behind the platform by The VajraCognixia Technologies Private Limited.`;
const FOUNDER_CANONICAL = 'https://www.vajracognixia.in/founder';
const FOUNDER_IMAGE = 'https://www.vajracognixia.in/founder.png';

const upsertMeta = (
  selector: string,
  attributeName: 'content' | 'href',
  value: string,
  fallback: { tagName: 'meta' | 'link'; attrs: Record<string, string> }
) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;

  if (!element) {
    element = document.createElement(fallback.tagName);
    Object.entries(fallback.attrs).forEach(([key, attrValue]) => {
      element?.setAttribute(key, attrValue);
    });
    document.head.appendChild(element);
  }

  element.setAttribute(attributeName, value);
};

const applyDefaultSeo = () => {
  document.title = DEFAULT_TITLE;
  upsertMeta('meta[name="description"]', 'content', DEFAULT_DESCRIPTION, {
    tagName: 'meta',
    attrs: { name: 'description' },
  });
  upsertMeta('link[rel="canonical"]', 'href', DEFAULT_CANONICAL, {
    tagName: 'link',
    attrs: { rel: 'canonical' },
  });
  upsertMeta('meta[property="og:title"]', 'content', DEFAULT_TITLE, {
    tagName: 'meta',
    attrs: { property: 'og:title' },
  });
  upsertMeta('meta[property="og:description"]', 'content', DEFAULT_DESCRIPTION, {
    tagName: 'meta',
    attrs: { property: 'og:description' },
  });
  upsertMeta('meta[property="og:url"]', 'content', DEFAULT_CANONICAL, {
    tagName: 'meta',
    attrs: { property: 'og:url' },
  });
  upsertMeta('meta[property="og:image"]', 'content', DEFAULT_IMAGE, {
    tagName: 'meta',
    attrs: { property: 'og:image' },
  });
  upsertMeta('meta[name="twitter:title"]', 'content', DEFAULT_TITLE, {
    tagName: 'meta',
    attrs: { name: 'twitter:title' },
  });
  upsertMeta('meta[name="twitter:description"]', 'content', DEFAULT_DESCRIPTION, {
    tagName: 'meta',
    attrs: { name: 'twitter:description' },
  });
  upsertMeta('meta[name="twitter:image"]', 'content', DEFAULT_IMAGE, {
    tagName: 'meta',
    attrs: { name: 'twitter:image' },
  });
};

function injectPortfolioAssets() {
  const ids = [
    'portfolio-roboto',
    'portfolio-roboto-mono',
    'portfolio-font-awesome',
    'portfolio-material-icons',
  ] as const;

  const links: { id: string; href: string; rel?: string }[] = [
    {
      id: 'portfolio-roboto',
      href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap',
    },
    {
      id: 'portfolio-roboto-mono',
      href: 'https://fonts.googleapis.com/css?family=Roboto+Mono:300,400,500,700&display=swap',
    },
    {
      id: 'portfolio-font-awesome',
      href: 'https://cdn.jsdelivr.net/gh/FortAwesome/Font-Awesome@5.13.0/css/all.min.css',
    },
    {
      id: 'portfolio-material-icons',
      href: 'https://fonts.googleapis.com/icon?family=Material+Icons',
    },
  ];

  links.forEach(({ id, href }) => {
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  });

  return () => {
    ids.forEach((id) => document.getElementById(id)?.remove());
  };
}

export default function FounderPage({ onNavigate, publicView = false }: FounderPageProps) {
  useEffect(() => {
    const removePortfolioLinks = injectPortfolioAssets();

    document.title = FOUNDER_TITLE;
    upsertMeta('meta[name="description"]', 'content', FOUNDER_DESCRIPTION, {
      tagName: 'meta',
      attrs: { name: 'description' },
    });
    upsertMeta('link[rel="canonical"]', 'href', FOUNDER_CANONICAL, {
      tagName: 'link',
      attrs: { rel: 'canonical' },
    });
    upsertMeta('meta[property="og:title"]', 'content', FOUNDER_TITLE, {
      tagName: 'meta',
      attrs: { property: 'og:title' },
    });
    upsertMeta('meta[property="og:description"]', 'content', FOUNDER_DESCRIPTION, {
      tagName: 'meta',
      attrs: { property: 'og:description' },
    });
    upsertMeta('meta[property="og:url"]', 'content', FOUNDER_CANONICAL, {
      tagName: 'meta',
      attrs: { property: 'og:url' },
    });
    upsertMeta('meta[property="og:image"]', 'content', FOUNDER_IMAGE, {
      tagName: 'meta',
      attrs: { property: 'og:image' },
    });
    upsertMeta('meta[name="twitter:title"]', 'content', FOUNDER_TITLE, {
      tagName: 'meta',
      attrs: { name: 'twitter:title' },
    });
    upsertMeta('meta[name="twitter:description"]', 'content', FOUNDER_DESCRIPTION, {
      tagName: 'meta',
      attrs: { name: 'twitter:description' },
    });
    upsertMeta('meta[name="twitter:image"]', 'content', FOUNDER_IMAGE, {
      tagName: 'meta',
      attrs: { name: 'twitter:image' },
    });

    const existingSchema = document.getElementById('founder-page-schema');
    existingSchema?.remove();

    const schema = document.createElement('script');
    schema.id = 'founder-page-schema';
    schema.type = 'application/ld+json';
    schema.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      name: FOUNDER_TITLE,
      url: FOUNDER_CANONICAL,
      description: FOUNDER_DESCRIPTION,
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: FOUNDER_IMAGE,
      },
      mainEntity: {
        '@type': 'Person',
        name: FOUNDER_NAME,
        jobTitle: FOUNDER_ROLE,
        email: FOUNDER_EMAIL,
        image: FOUNDER_IMAGE,
        url: FOUNDER_CANONICAL,
        sameAs: [FOUNDER_INSTAGRAM_URL],
        worksFor: {
          '@type': 'Organization',
          name: 'The VajraCognixia Technologies Private Limited',
        },
      },
      about: {
        '@type': 'Organization',
        name: 'The VajraCognixia Technologies Private Limited',
        brand: {
          '@type': 'Brand',
          name: 'The Vajra Campus Delivery',
        },
        sameAs: [COMPANY_INSTAGRAM_URL],
      },
    });

    document.head.appendChild(schema);

    return () => {
      removePortfolioLinks();
      document.getElementById('founder-page-schema')?.remove();
      applyDefaultSeo();
    };
  }, []);

  const handleBackToMainSite = () => {
    if (onNavigate) {
      onNavigate('service-hub');
      return;
    }
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new CustomEvent(VAJRA_INTERNAL_PATH_CHANGE_EVENT));
  };

  return (
    <div
      data-founder-portfolio-embed=""
      className={`founder-portfolio-root ${publicView ? 'min-h-screen' : 'min-h-screen w-full'}`}
    >
      <PortfolioIntegratedApp onBackToMainSite={handleBackToMainSite} />
    </div>
  );
}
