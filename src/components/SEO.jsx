import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://www.mateandcomdp.com.ar'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`

export default function SEO({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  schema = null,
}) {
  const fullTitle = title
    ? `${title} | Mate&Co`
    : 'Mate&Co — Mates artesanales y personalizados | Mar del Plata'

  const fullCanonical = canonical ? `${BASE_URL}${canonical}` : BASE_URL

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url"         content={fullCanonical} />
      <meta property="og:image"       content={image} />
      <meta property="og:type"        content={type} />

      {/* Twitter */}
      <meta name="twitter:title"      content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      <meta name="twitter:image"      content={image} />

      {/* JSON-LD schema personalizado */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}
