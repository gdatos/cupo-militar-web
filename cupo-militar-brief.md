# Cupo Militar — brief de traspaso a Cowork

## Qué es
Producto nuevo de Guardián de Datos: academia de oposiciones específica para militares
profesionales de Tropa y Marinería que preparan su salida vía **cupo militar reservado**
(Guardia Civil, Policía Nacional, Vigilancia Aduanera, funcionarios de Defensa) o su
ascenso interno dentro de FAS/GC.

## Decisiones ya cerradas
- **Nombre**: Cupo Militar
- **Dominio**: cupomilitar.es, comprado en Piensa Solutions (piensasolutions.com/clientes)
  — pendiente conectar el DNS al proyecto de Vercel
- **Identidad visual**: deliberadamente distinta de Guardián de Datos (nada de su verde
  institucional #1B6B54) — paleta propia: tinta #20242b, latón #a9793f, papel #eef0f2
- **Modelo de precios**: plan único "Cupo Militar Completo" — 79€/año (destacado) o
  14,99€/mes sin permanencia. Programa de recomendación: un mes gratis para quien
  recomienda y para el recomendado.
- **Producto de pago**: temario + test ilimitados (GC, Policía Nacional, Vigilancia
  Aduanera) + calculadora de baremo real + comparador de cupos + alertas de convocatoria.

## Estado del prototipo
Desplegado en Vercel (proyecto `cupo-militar`, team `gdatos`), protección SSO desactivada.
Incluye: panel de convocatorias 2026 con datos reales (plazas, fechas BOE, previsión 2027),
calculadora de elegibilidad al cupo, sección de planes de precio, cabecera con bandera de
España + motivo SVG propio (galones/estrella), logo en SVG (icono + wordmark).
Archivos adjuntos a este brief: el HTML del prototipo y el logo.

## Siguiente pieza técnica: automatizar la carga de convocatorias
El BOE tiene una **API REST oficial de datos abiertos** (boe.es/datosabiertos/api/api.php)
con un endpoint de "sumario para un día determinado" (por fecha AAAAMMDD) que devuelve
todo lo publicado ese día, ya clasificado por departamento y sección. La sección relevante
es "II. Autoridades y personal — B. Oposiciones y concursos".

Arquitectura propuesta:
1. Job diario que lee el sumario del BOE del día vía esa API.
2. Filtro por departamento (Defensa/Interior/Hacienda) + sección oposiciones + palabras
   clave ("tropa y marinería", "cupo", nombres de los cuerpos).
3. Cuando hay match, una llamada a IA para extraer datos estructurados (plazas totales,
   plazas reservadas, fechas, plazo) del texto legal — el formato del BOE no es fijo, así
   que esto no se puede sacar con un patrón de texto simple.
4. Guardar en Supabase (mismo patrón que ya usáis en el panel de subvenciones) y que el
   panel lo pinte automáticamente.

Recomendación: añadir una revisión humana rápida antes de publicar cualquier dato
extraído automáticamente, al menos al principio — un error de la IA extrayendo plazas o
fechas mal es el tipo de fallo que rompe la confianza de un opositor de inmediato.

## Datos reales ya investigados (para no tener que rebuscarlos)
- **Guardia Civil** (Escala de Cabos y Guardias): 3.240 plazas, 1.296 reservadas (40%),
  BOE 8 mayo 2026, incorporación 13 octubre 2026.
- **Policía Nacional** (Escala Básica, Convocatoria 43): 2.704 plazas, 541 reservadas
  (20%), BOE 10 julio 2026, examen 26 septiembre 2026.
- **Vigilancia Aduanera** (Cuerpo de Agentes, esp. marítima): 20 plazas, 8 reservadas
  (40%), BOE 31 diciembre 2025.
- **Oficiales/Suboficiales FAS-GC** (promoción interna): 2.944 plazas totales, 1.261
  específicas para tropa y marinería.
- Base legal de todo el cupo: **art. 20, Ley 8/2006, de Tropa y Marinería**.
