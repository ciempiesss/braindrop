# BrainDrop — Instrucciones para Claude

## LEER PRIMERO antes de tocar el seed

Antes de cualquier operación sobre `src/data/seed.ts` — añadir colección, añadir drops, editar, eliminar — leer `docs/drops-inventory.md` para saber exactamente qué colecciones existen, cuáles son sus IDs, y cuántos drops hay. No asumir. No inventar IDs. El inventario es la fuente de verdad.

## Inventario de drops

El inventario completo de colecciones y drops se mantiene en `docs/drops-inventory.md`.

**Regla:** Cada vez que añadas, edites, elimines o muevas un drop en `src/data/seed.ts`, actualiza `docs/drops-inventory.md` antes de terminar:
- Si añades una colección: agrégala al inventario con su ID real del seed.
- Si añades un drop: agrega la línea `` `id` [tipo] Título `` en la sección correcta y sube el contador del encabezado.
- Si eliminas un drop: quita su línea y baja el contador.
- Si editas título o tipo: actualiza la línea correspondiente.
- Si mueves un drop de colección: mueve su línea a la sección destino y ajusta ambos contadores.
- Actualiza la fecha "Última actualización" y el total global.
