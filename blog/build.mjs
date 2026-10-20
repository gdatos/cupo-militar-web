// Generador del blog de Cupo Militar con publicación programada.
// Uso: node blog/build.mjs [--today=AAAA-MM-DD]
// Lee blog/_src/articles.json, genera las páginas de los artículos cuya fecha ya ha llegado
// (zona horaria de Canarias), y regenera el listado del blog y el sitemap.xml.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOG = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(BLOG, '..');
const SITE = 'https://www.cupomilitar.es';
const arg = process.argv.find((a) => a.startsWith('--today='));
const today = arg ? arg.slice(8) : new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });

const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const fechaLarga = (d) => { const [y, m, dd] = d.split('-').map(Number); return `${dd} ${MESES[m - 1]} ${y}`; };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Artículos escritos a mano (no se regeneran, solo aparecen en el listado y el sitemap).
const manuales = [
  { slug: 'cupo-militar-guardia-civil-2026-plazas-requisitos-baremo', date: '2026-10-04', category: 'Cupo a otros cuerpos',
    title: 'Cupo militar a la Guardia Civil 2026: plazas, requisitos y baremo',
    description: '1.296 plazas reservadas a militares de Tropa y Marinería, requisitos, fases del concurso-oposición y cómo se puntúan los 45 puntos de méritos, con un ejemplo de cálculo.' },
  { slug: 'permanencia-2026-requisitos-proceso-examen', date: '2026-09-17', category: 'Permanencia',
    title: 'Permanencia 2026: requisitos, proceso y examen — guía completa',
    description: 'Cuántas plazas hay, quién puede presentarse, cómo se puntúa el concurso-oposición y qué formato tiene el examen de conocimientos: cronómetro, número de preguntas y penalización real, con fuentes oficiales.' },
];

const programados = JSON.parse(fs.readFileSync(path.join(BLOG, '_src', 'articles.json'), 'utf8'));
const publicados = programados.filter((a) => a.date <= today);

// Pie y barra de navegación: se reutilizan del listado actual para no duplicarlos aquí.
const indexPath = path.join(BLOG, 'index.html');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const footer = indexHtml.slice(indexHtml.indexOf('<footer>'), indexHtml.indexOf('</footer>') + 9);
const navbar = (ref) => `<div class="navbar">
  <a href="../index.html" class="brand"><img src="../icono-cupo-militar.svg" alt="" width="26" height="26" class="brand-icon">CUPO MILITAR</a>
  <div class="links">
    <a href="../index.html#pilar-permanencia">Permanencia</a>
    <a href="../convocatorias.html">Convocatorias</a>
    <a href="index.html">Blog</a>
    <a href="https://portal.cupomilitar.es/login?ref=${ref}" class="cta">Acceder / Suscribirme</a>
  </div>
</div>`;

const bloque = (b) => {
  if (b.t === 'h') return `  <h2>${b.x}</h2>`;
  if (b.t === 'p') return `  <p>${b.x}</p>`;
  const tag = b.t === 'ol' ? 'ol' : 'ul';
  return `  <${tag}>\n${b.items.map((i) => `    <li>${i}</li>`).join('\n')}\n  </${tag}>`;
};

function paginaArticulo(a) {
  const url = `${SITE}/blog/${a.slug}.html`;
  const img = `${SITE}/blog/img/${a.slug}.webp`;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.description,
    image: img, datePublished: a.date, dateModified: a.date,
    author: { '@type': 'Organization', name: 'Cupo Militar' }, publisher: { '@type': 'Organization', name: 'Cupo Militar' },
    mainEntityOfPage: url,
  };
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(a.title)} | Cupo Militar</title>
<meta name="description" content="${esc(a.description)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Cupo Militar">
<meta property="og:title" content="${esc(a.title)}">
<meta property="og:description" content="${esc(a.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${img}">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../favicon.ico">
<link rel="apple-touch-icon" href="../apple-touch-icon.png">
<link rel="stylesheet" href="blog.css">
<script type="application/ld+json">
${JSON.stringify(ld, null, 2)}
</script>
<script defer src="/_vercel/insights/script.js"></script>
</head>
<body>

${navbar('web-blog-' + a.ref)}

<main>
<article class="post">
  <h1>${esc(a.title)}</h1>
  <div class="meta">${fechaLarga(a.date)} · ${esc(a.category)}</div>
  <img class="hero" src="img/${a.slug}.webp" alt="${esc(a.imageAlt)}" width="1600" height="893">

${a.blocks.map(bloque).join('\n\n')}

  <div class="cta-box">
    <strong>Prepárate con temario completo y tests ilimitados en Cupo Militar.</strong><br>
    <a href="https://portal.cupomilitar.es/login?ref=web-blog-${a.ref}">Empieza en Cupo Militar →</a>
  </div>
</article>
</main>

${footer}

</body>
</html>
`;
}

for (const a of publicados) fs.writeFileSync(path.join(BLOG, `${a.slug}.html`), paginaArticulo(a));

// Listado del blog (más reciente primero)
const todos = [...manuales.map((m) => ({ ...m })), ...publicados].sort((x, y) => (y.date > x.date ? 1 : y.date < x.date ? -1 : 0));
const tarjetas = todos.map((p) => `  <a class="post-card" href="${p.slug}.html">
${p.imageAlt ? `    <img class="thumb" src="img/${p.slug}.webp" alt="" width="1600" height="893" loading="lazy">\n` : ''}    <div class="fecha">${fechaLarga(p.date)} · ${esc(p.category)}</div>
    <h2>${esc(p.title)}</h2>
    <p>${esc(p.description)}</p>
  </a>`).join('\n\n');
const nuevoIndex = indexHtml.replace(/<main>[\s\S]*<\/main>/, `<main>\n\n${tarjetas}\n\n</main>`);
fs.writeFileSync(indexPath, nuevoIndex);

// Sitemap
const urls = [`${SITE}/`, `${SITE}/convocatorias.html`, `${SITE}/blog/`, ...todos.map((p) => `${SITE}/blog/${p.slug}.html`)];
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);

console.log(`Hoy (Canarias): ${today} · publicados ${publicados.length}/${programados.length} programados · ${todos.length} en el listado`);
