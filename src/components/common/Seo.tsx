// components/common/Seo.tsx
import Head from "next/head";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";

interface SeoProps {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
  ogImageAlt?: string;
  ogUrl?: string;
  siteName?: string;
  locale?: string;
  canonical?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
  fbAppId?: string;
  fbPageUrl?: string;
  fbAdmins?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthorUrl?: string;
  articleSection?: string;
  articleTags?: string[];
  noindex?: boolean;
  alternates?: { hrefLang: string; href: string }[];
  structuredData?: any;
}

export default function Seo({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType = "website",
  ogImage = "/snm_brand.png",
  ogImageWidth,
  ogImageHeight,
  ogImageAlt,
  ogUrl = "https://snm.jewelry",
  siteName = "GreenEye",
  locale = "en_US",
  canonical,
  twitterCard = "summary_large_image",
  twitterSite,
  twitterCreator,
  fbAppId,
  fbPageUrl,
  fbAdmins,
  articlePublishedTime,
  articleModifiedTime,
  articleAuthorUrl,
  articleSection,
  articleTags = [],
  noindex = false,
  alternates = [],
  structuredData,
}: SeoProps) {
  const safeTitle = ogTitle || title;
  const resolvedOgImage = ogImage?.startsWith("https")
    ? ogImage
    : `${SITE_URL}${ogImage}`;

  return (
    <Head>
      {/* Basic */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}

      {/* Robots */}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow, noarchive" : "index, follow"}
      />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Hreflang alternates */}
      {alternates.map((alt) => (
        <link key={alt.hrefLang} rel="alternate" hrefLang={alt.hrefLang} href={alt.href} />
      ))}

      {/* Open Graph / Facebook / Instagram / WhatsApp */}
      <meta property="og:type" content={ogType} />
      {safeTitle && <meta property="og:title" content={safeTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={resolvedOgImage} />}
      {ogImage && <meta property="og:image:secure_url" content={resolvedOgImage} />}
      {ogImageWidth && <meta property="og:image:width" content={String(ogImageWidth)} />}
      {ogImageHeight && <meta property="og:image:height" content={String(ogImageHeight)} />}
      {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      {siteName && <meta property="og:site_name" content={siteName} />}
      {locale && <meta property="og:locale" content={locale} />}

      {/* Facebook specific */}
      {fbAppId && <meta property="fb:app_id" content={fbAppId} />}
      {fbAdmins && <meta property="fb:admins" content={fbAdmins} />}
      {fbPageUrl && <meta property="article:publisher" content={fbPageUrl} />}

      {/* Article meta (for blog detail pages) */}
      {articlePublishedTime && (
        <meta property="article:published_time" content={articlePublishedTime} />
      )}
      {articleModifiedTime && (
        <meta property="article:modified_time" content={articleModifiedTime} />
      )}
      {articleAuthorUrl && <meta property="article:author" content={articleAuthorUrl} />}
      {articleSection && <meta property="article:section" content={articleSection} />}
      {articleTags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      {safeTitle && <meta name="twitter:title" content={safeTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImage && <meta name="twitter:image" content={resolvedOgImage} />}
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}

      {/* JSON-LD */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
    </Head>
  );
}
