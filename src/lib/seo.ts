type SeoOptions = {
  title: string;
  description: string;
  canonical: string;
  image?: string;
};

export const DEFAULT_SEO = {
  title: 'Drone Delivery Platform | The Vajra',
  description:
    'The Vajra is building a drone-powered delivery platform for food, parcels, and local commerce with faster routing and smarter logistics.',
  canonical: 'https://www.vajracognixia.in/',
  image: 'https://www.vajracognixia.in/area/vajra-hero-drone.jpg',
} as const;

const upsertHeadTag = (
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

export const applySeo = ({ title, description, canonical, image = DEFAULT_SEO.image }: SeoOptions) => {
  document.title = title;

  upsertHeadTag('meta[name="description"]', 'content', description, {
    tagName: 'meta',
    attrs: { name: 'description' },
  });
  upsertHeadTag('link[rel="canonical"]', 'href', canonical, {
    tagName: 'link',
    attrs: { rel: 'canonical' },
  });
  upsertHeadTag('meta[property="og:title"]', 'content', title, {
    tagName: 'meta',
    attrs: { property: 'og:title' },
  });
  upsertHeadTag('meta[property="og:description"]', 'content', description, {
    tagName: 'meta',
    attrs: { property: 'og:description' },
  });
  upsertHeadTag('meta[property="og:url"]', 'content', canonical, {
    tagName: 'meta',
    attrs: { property: 'og:url' },
  });
  upsertHeadTag('meta[property="og:image"]', 'content', image, {
    tagName: 'meta',
    attrs: { property: 'og:image' },
  });
  upsertHeadTag('meta[name="twitter:title"]', 'content', title, {
    tagName: 'meta',
    attrs: { name: 'twitter:title' },
  });
  upsertHeadTag('meta[name="twitter:description"]', 'content', description, {
    tagName: 'meta',
    attrs: { name: 'twitter:description' },
  });
  upsertHeadTag('meta[name="twitter:image"]', 'content', image, {
    tagName: 'meta',
    attrs: { name: 'twitter:image' },
  });
};

export const applyDefaultSeo = () => {
  applySeo(DEFAULT_SEO);
};
