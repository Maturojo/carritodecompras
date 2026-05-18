import { createContext, useContext, useState, useEffect } from 'react'

const ContentContext = createContext(null)

export const DEFAULT_CONTENT = {
  landing: {
    heroPretitle:  'Industria Argentina',
    heroTitle:     'El mate perfecto\nempieza acá',
    heroSubtitle:  'Mates artesanales, bombillas de alpaca, yerbas seleccionadas y termos premium. Todo lo que necesitás para tu ritual del mate.',
    heroImage:     '/hero.jpeg',
    aboutTitle:    'Más que una tienda, una pasión',
    aboutText1:    'Mate&Co nació de una mesa familiar un domingo a la tarde, con mate en mano y la pregunta de siempre: ¿dónde conseguir buenos mates artesanales sin tener que ir hasta una feria?',
    aboutText2:    'Hoy trabajamos con artesanos de todo el país para traerte productos únicos que respetan la tradición mateadora. Cada pieza que vendemos la elegimos como si fuera para nuestra propia mesa.',
    statClientes:  '+500',
    statArtesanos: '30+',
    statAnios:     '3',
  },
  nosotros: {
    heroImage:    '/nosotros.jpeg',
    heroTitle:    'Una historia de mates y pasión artesanal',
    heroSubtitle: 'Somos un equipo chico con un amor enorme por la cultura del mate. Creemos que un buen mate empieza con los productos correctos.',
    storyTitle:   '¿Cómo empezó todo?',
    storyText1:   'Todo comenzó un domingo de 2022. Nuestra fundadora estaba cebando unos mates con una calabaza heredada de su abuela y se preguntó por qué era tan difícil encontrar mates de calidad sin tener que ir a una feria artesanal. Ese mismo día empezó a llamar artesanos.',
    storyText2:   'Lo que empezó como una venta entre amigos se convirtió rápidamente en algo más grande. Hoy trabajamos con más de 30 artesanos de distintas provincias, cada uno con su técnica y materiales propios.',
    storyText3:   'Nuestra misión es simple: acercar el trabajo de los artesanos argentinos a la mesa de cada familia. Que cada mate tenga historia, que cada bombilla tenga alma.',
  },
  contacto: {
    email:    'hola@mateandcomdp.com.ar',
    whatsapp: '5492236359767',
    ciudad:   'Mar del Plata, Buenos Aires',
    horario:  'Lunes a viernes de 9 a 18 hs',
    instagram: 'https://www.instagram.com/by.mateandco/',
    tiktok:    'https://www.tiktok.com/@by.mateandco',
  },
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState(DEFAULT_CONTENT)
  const [loaded, setLoaded]   = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/content?key=landing').then(r => r.json()),
      fetch('/api/content?key=nosotros').then(r => r.json()),
      fetch('/api/content?key=contacto').then(r => r.json()),
    ]).then(([landing, nosotros, contacto]) => {
      setContent({
        landing:  Object.keys(landing).length  > 1 ? landing  : DEFAULT_CONTENT.landing,
        nosotros: Object.keys(nosotros).length > 1 ? nosotros : DEFAULT_CONTENT.nosotros,
        contacto: Object.keys(contacto).length > 1 ? contacto : DEFAULT_CONTENT.contacto,
      })
    }).catch(() => {}).finally(() => setLoaded(true))
  }, [])

  const saveContent = async (key, data) => {
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, ...data }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Error ${res.status} al guardar`)
    }
    // Solo actualizar estado local si el guardado en MongoDB fue exitoso
    setContent(prev => ({ ...prev, [key]: { ...prev[key], ...data } }))
  }

  return (
    <ContentContext.Provider value={{ content, saveContent, loaded }}>
      {children}
    </ContentContext.Provider>
  )
}

export function useContent() { return useContext(ContentContext) }
