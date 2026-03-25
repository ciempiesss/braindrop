# Audit Manual — BrainDrop (2026-03-25)

## ESTADO DE FIXES

- **Fix A (scroll continuo)** — APLICADO en Feed.tsx. IntersectionObserver + auto-rebuild.
- **Fix B (cards compactas)** — APLICADO en DropCard.tsx. `cardExpanded` state, 24 ocurrencias.
- **Fix C (long-press review overlay)** — APLICADO en DropCard.tsx. `showQuickReview` + `longPressTimer`.
- **Fix D (interleave buckets)** — APLICADO en feedAlgorithm.ts. `interleaveBuckets()`.
- **Fix E (counter hoy)** — APLICADO en Feed.tsx. `dropsViewedToday` en header.
- **Fix F (variedad visual tipo)** — APLICADO en DropCard.tsx. line-clamp por tipo, code snippet, operativo bullets.
- **AUDHD visual (OBS 14)** — APLICADO en DropCard.tsx. typeStyles con cardBorder/cardAccent/rupturaGlow, transiciones, first-sentence hook, badge compact.
- **Bug 2 (line-clamp dinámico)** — APLICADO en DropCard.tsx. Condicionales explícitos de Tailwind.
- **Bug 3 (↑ Cerrar)** — Falso positivo del audit. Funciona correctamente.
- **Bug 1 (primera card expandida)** — FIX APLICADO en DropCard.tsx. `useEffect` resetea `cardExpanded` cuando `drop.id` cambia.
- **Bug 4+6 (Quiz handleNext desfase)** — FIX APLICADO en Quiz.tsx. `nextIdx` calculado antes del setState.
- **Bug 5 (opciones dummy)** — FIX APLICADO en groq.ts. Distractores de otros drops del mismo tipo.
- **OBS 1+6 (dueToday inflado)** — FIX APLICADO en useBrainDrop.tsx y Progress.tsx. Solo `viewed === true`.
- **OBS 2+3 (Ejemplo placeholder / Explicación duplicada)** — FIX APLICADO en Quiz.tsx. Ocultar si no es modo IA.
- **OBS 7 (Compose expandido por default)** — FIX APLICADO en Compose.tsx. Default minimized = true.
- **OBS 8 (gap entre cards)** — FIX APLICADO en Feed.tsx. Eliminado gap-3.
- **OBS 18 (confirm nativo)** — FIX APLICADO en DropCard.tsx. Inline ¿Borrar? / ✕.
- **OBS 20 (eslint-disable incorrecto)** — FIX APLICADO en Quiz.tsx.

---

## BUGS CONFIRMADOS

### BUG 1 — Primera card del feed aparece expandida por default
- Al cargar la página, la primera card en "Para ti" siempre aparece en estado expanded (muestra tags, botones Difícil/Fácil, action bar, "↑ Cerrar").
- Debería iniciar collapsed como todas las demás.
- Causa probable: el IntersectionObserver de `useViewedObserver` dispara `onMarkViewed` en la primera card inmediatamente al montar, pero ese no es el trigger — más probable es que el primer drop en el pool tiene `drop.viewed === true` ya desde el seed, y algún estado de inicialización lo expande. Investigar.
- **Fix**: revisar si hay algún `cardExpanded` inicializado como `true` por lógica de viewed, o si el primer render tiene un race condition.

### BUG 2 — `line-clamp-${n}` dinámico no funciona en Tailwind (Fix F roto)
- Las cards de tipo `definition` deberían mostrar 1 línea en collapsed (`line-clamp-1`).
- En realidad muestran 4-5 líneas — igual que antes del fix.
- Causa: Tailwind v3/v4 no genera clases dinámicas como `line-clamp-${collapsedLines}` — la clase tiene que estar escrita literalmente en el código para que el purger la incluya en el bundle.
- **Fix aplicado**: reemplazar la interpolación dinámica por condicionales explícitos en DropCard.tsx (ya hecho, pendiente deploy).

### BUG 3 — Botón "↑ Cerrar" no responde al click (falso positivo del audit)
- En el audit con browser automation, las coordenadas de click quedaban desfasadas por el scroll de página.
- Verificado que SÍ funciona cuando se hace click directo sobre el elemento.
- Conclusión: No es un bug real en producción.

### BUG 4 — Quiz: botón "Siguiente" no avanza (flashcard)
- En modo flashcard, después de marcar "Bien" o "Otra vez", `handleQuality()` activa `showExplanation = true`, lo que muestra el bloque de Explicación + botones "Preguntar a IA" / "Siguiente".
- El botón "Siguiente" llama `handleNext()`, que resetea `showAnswer`, `selectedOption`, `showExplanation` y avanza `currentIndex`.
- **BUG REAL**: `handleNext()` compara `currentIndex + 1 >= quizQuestions.length`, pero en el primer turno `quizQuestions` puede tener length 0 aún (las preguntas se generan en un `useEffect` sobre `quizDrops`). Si el usuario hace click muy rápido antes de que `quizQuestions` esté lleno, `completed = true` aparece prematuramente.
- También: `currentQuestion` se setea explícitamente en `handleNext()` via `setCurrentQuestion(quizQuestions[currentIndex + 1])`, pero como `setCurrentIndex` es asíncrono, hay un frame donde `currentIndex` y `currentQuestion` están desfasados.
- **Fix**: en `handleNext()`, derivar la siguiente question del índice calculado, no del estado anterior: `const nextIdx = currentIndex + 1; setCurrentIndex(nextIdx); setCurrentQuestion(quizQuestions[nextIdx])`. Agregar guard `if (!quizQuestions.length) return` al inicio.

### BUG 5 — Opción múltiple: opciones dummy con texto placeholder
- `generateQuizQuestion()` en groq.ts crea opciones: `[drop.title, 'Otra opción A', 'Otra opción B', 'Otra opción C']`.
- `correctIndex: 0` siempre apunta al título — después de shuffle, la posición varía pero el texto es siempre el título del drop.
- Las opciones incorrectas son strings literales hardcodeados — trivialmente identificables.
- **Fix opción A (sin IA)**: extraer títulos de otros 3 drops del mismo tipo del seed como distractores. Requiere pasar el array completo de drops a `generateQuizQuestion()`.
- **Fix opción B (con IA)**: ya existe `generateSmartQuizQuestion()` que llama a Groq — requiere API key.

### BUG 6 — "Siguiente pregunta" no avanza en opción múltiple
- En modo múltiple, responder activa `handleMultipleChoice()` → `handleQuality()` → `showExplanation = true`.
- Muestra bloque "Explicación" + botón "Preguntar a IA" + botón "Siguiente pregunta".
- "Siguiente pregunta" llama `handleNext()` — mismo código que flashcard. Mismo bug potencial que BUG 4.
- **Fix**: igual que Bug 4.

---

## OBSERVACIONES / MEJORAS POSIBLES

### OBS 1 — "260 por repasar hoy" en Progreso es engañoso
- Todos los drops del seed se inicializan con `nextReviewDate = new Date().toISOString()`, por lo que todos están "due" desde el primer día.
- Un usuario nuevo ve 260 como número de urgencia, lo que es abrumador y no refleja la realidad (nunca han visto esos drops).
- **Mejora**: separar "por repasar" (drops vistos cuya fecha de review pasó) de "nuevos por descubrir" (drops nunca vistos). El número rojo debería ser solo los drops `status !== 'new'` con `nextReviewDate <= now`.

### OBS 2 — Quiz: campo "Ejemplo" siempre con placeholder genérico
- En modo pre-generado: `example: 'Aplicación práctica del concepto en tu trabajo.'` — literal hardcodeado en Quiz.tsx:98.
- La card muestra esto como contenido real en el bloque morado "Ejemplo:".
- **Fix**: ocultar la sección "Ejemplo:" si `currentQuestion.example` es el string de placeholder, o cuando `useIAMode === false`.

### OBS 3 — Quiz: "Explicación:" duplica la Respuesta
- En modo pre-generado: `explanation: drop.content.substring(0, 200)` — exactamente el mismo texto truncado que ya se muestra en "Respuesta:".
- En la flashcard se ven dos bloques consecutivos con el mismo contenido.
- **Fix**: en modo pre-generado, o eliminar el bloque "Explicación:", o usar los primeros 200 chars de `drop.content` solo para uno de los dos.

### OBS 4 — Cards en Colecciones siempre expandidas (sin collapsed)
- Al entrar a una colección (ej: "Consciencia & Mente"), todas las cards muestran su contenido completo.
- No hay estado collapsed en la vista de colección — es una lista densa de texto largo.
- **Mejora**: aplicar el mismo comportamiento collapsed/expanded del feed a las cards en colecciones.

### OBS 5 — Colecciones: no hay gestión (crear, editar, borrar)
- La lista de colecciones es solo lectura. No hay botón "Nueva colección", no hay hover con opciones de editar/borrar.
- El FAB "+" en la vista de colección lleva al Feed, no abre un modal de nueva colección.
- **Mejora**: añadir acciones de gestión. Mínimo: crear nueva colección desde la lista, renombrar, cambiar color/icono.

### OBS 6 — RightSidebar: "Hora de quiz" con 258-260 drops siempre visible
- El widget muestra un número inflado (todos los drops "due") que da sensación de deuda imposible.
- Mismo problema que OBS 1.
- **Mejora**: mostrar solo drops `viewed === true` con `nextReviewDate <= now`.

### OBS 7 — Compose desktop ocupa mucho espacio fijo
- El formulario de Compose siempre está visible en desktop arriba del feed, ocupando ~260px de altura.
- Para modo doomscroll (objetivo principal), ese espacio es casi siempre desperdiciado.
- **Mejora sugerida**: Compose colapsado por default, FAB "+" lo expande.

### OBS 8 — Gap entre cards interrumpe el flujo de scroll
- `gap-3` (12px) entre cards crea respiración visual que rompe el doomscroll continuo.
- Twitter usa solo `border-b` sin gap — la separación es mínima.
- **Mejora**: eliminar gap, dejar solo `border-b border-white/5`.

### OBS 9 — Scroll automático hasta límite 40 — no verificado
- El IntersectionObserver para auto-load no fue probado completamente.
- Las cards sin line-clamp son tan largas que 10 cards ocupan la pantalla entera — antes de llegar al sentinel hay que scrollear muchísimo.
- Relación directa: Bug 2 hace que el feed sea mucho más largo de lo previsto. Fix Bug 2 → fix indirecto del flujo de scroll.

### OBS 10 — Config: Quiz modo "IA" — fallback sin API key
- Sin `VITE_GROQ_API_KEY`, `generateSmartQuizQuestion()` tiene un fallback que devuelve una pregunta básica con `correctIndex: 0` y opciones dummy — igual que modo pre-generado.
- El usuario no ve ningún error — el quiz parece funcionar igual en ambos modos si no hay API key.
- **Pendiente**: testear con API key real para confirmar que genera preguntas mejores en modo IA.

### OBS 11 — Config: opción "Preguntas por sesión" solo tiene 3 valores (5/10/20)
- Pocos valores disponibles. No hay slider ni input libre.
- Para AUDHD: 10 preguntas puede ser demasiado en algunos momentos, 5 puede ser poco en otros.
- **Mejora sugerida**: añadir valor 3 (sesión ultra-corta para días de poca energía) y 15.

### OBS 12 — RightSidebar "Tus temas" — tags clickeables activan filtro en feed
- Hacer click en un tag del sidebar activa el banner "Filtrando por: [tag]" en el feed.
- Es una feature que funciona. Pero el banner queda activo incluso navegando a otros tabs (Recientes, Favoritos) y al volver al feed.
- El botón X del banner a veces no responde en desktop (coordenadas de la barra fija).
- **Mejora**: el filtro debería limpiarse al cambiar de tab o al navegar a otra sección.

### OBS 13 — RightSidebar "Trending drops" — qué significa "trending"
- Muestra "glosario — 163 drops" y "qa — 56 drops" como trending.
- Parece ser tags ordenados por cantidad de drops, no por actividad real del usuario.
- Para un solo usuario sin historial real, "trending" no tiene significado.
- **Mejora**: renombrar a "Tus colecciones más grandes" o "Tags más usados", o calcular trending por drops vistos recientemente.

### OBS 14 — Diseño AUDHD: jerarquía visual insuficiente en collapsed
- En collapsed, título y body tienen peso visual similar.
- Para AUDHD la primera frase debería ser blanca brillante (`text-white/90`), el body casi invisible (`text-white/20`).
- El borde izquierdo por tipo existe pero es sutil — debería ser más grueso para categorización instantánea sin lectura.
- Cards de tipo "Ruptura" merecen tratamiento visual diferente (son las más impactantes).
- La micro-animación al expandir/colapsar no existe — sin feedback visual el usuario AUDHD no sabe si el click funcionó.

### OBS 15 — Compose: ruido visual en campo vacío
- El Compose visible siempre muestra `0/200`, `0/5000`, placeholder text, tipo selector, tags input, "Drop it!" button.
- ~7 elementos UI visibles en estado vacío — carga cognitiva background permanente.
- Para AUDHD: todo elemento visible que no es la tarea actual consume atención.

---

## SECCIONES EXPLORADAS ✓
- [x] Feed — Para ti, scroll, collapsed/expanded, action bar
- [x] Feed — Recientes (tab con badge)
- [x] Feed — Favoritos
- [x] Feed — Scroll continuo (IntersectionObserver + auto-rebuild verificado en código)
- [x] Feed — Counter "X hoy" en header
- [x] Feed — Pull-to-refresh (touch handlers verificados en código)
- [x] Explorar — búsqueda, filtros por tipo, "Mis drops", colecciones
- [x] Progreso — barras por colección, streak, breakdown
- [x] Quiz — Flashcard (flip, Bien/Otra vez, Siguiente, Explicación)
- [x] Quiz — Opción múltiple (selección, feedback, "Siguiente pregunta")
- [x] Quiz — Chat IA dentro del quiz (botón "Preguntar a IA" post-flip)
- [x] Quiz — Modo IA (generación por batches con barra de progreso, fallback sin API key)
- [x] Colecciones — lista, entrar a una colección, hover
- [x] Config — tamaño fuente, goal semanal, colecciones en home, quiz, datos, restablecer
- [x] RightSidebar — tags, trending, progreso semanal, "Empezar Quiz"
- [x] Compose — flujo manual (explorado en sesión anterior) + flujo IA (placeholder sin API key)
- [x] AIChat — modal full-screen, contexto del drop, sugerencias rápidas, Groq API (verificado en código)
- [x] Editar drop — modal con tabs Manual / IA, campos title/type/content/tags/visual (verificado en código)
- [x] Eliminar drop — confirm() dialog nativo + `onDelete(drop.id)` (verificado en código)
- [x] Long-press review overlay — showQuickReview overlay (Fix C implementado, verificado en código)

## SECCIONES PENDIENTES (requieren browser para verificar visualmente)
- [ ] Quick Capture — FAB "+" móvil (bottom sheet — requiere viewport móvil)
- [ ] Editar drop IA — flujo con Groq (requiere API key)
- [ ] AIChat con respuesta real — requiere API key
- [ ] Long-press en móvil — verificar que 500ms funciona con touch events reales

### OBS 16 — AIChat: sugerencias fijas no contextuales
- Los 4 chips de sugerencia ("Explícame más", "Dame un ejemplo", "¿Qué conexiones tiene?", "Hazme una pregunta") son strings hardcodeados en AIChat.tsx:79-84.
- No varían según el tipo de drop (un `code` drop debería tener "Muéstrame cómo se usa", un `ruptura` debería tener "¿Por qué rompe con lo anterior?").
- Impacto bajo pero fácil de mejorar con un mapa tipo → sugerencias en el componente.

### OBS 17 — Edit modal: IA mode no tiene prompt visible
- El modal de edición tiene dos tabs: Manual y 🤖 IA.
- En modo IA el usuario escribe una instrucción (ej: "hazlo más conciso") y Groq reescribe el drop.
- No hay indicación de qué tipo de instrucciones acepta ni ejemplos — UX en blanco para el usuario.
- **Mejora**: placeholder descriptivo o ejemplos de prompts en el input del modo IA.

### OBS 18 — Eliminar drop: usa `confirm()` nativo del browser
- El botón 🗑️ dispara `window.confirm('¿Estás seguro de que quieres eliminar este drop?')`.
- `confirm()` es un dialog bloqueante del browser — apariencia inconsistente con el resto de la UI dark/glassmorphism.
- En mobile el dialog nativo rompe la ilusión de app nativa.
- **Mejora**: reemplazar por un toast-confirm o un mini-modal inline dentro de la card (ej: "¿Eliminar? [Sí] [No]" aparece durante 3s).

### OBS 19 — Quiz: shuffleArray en cada render de `restart()`
- `restart()` llama `shuffleArray(drops).slice(0, quizCount)` y actualiza `quizDrops`.
- Esto dispara el `useEffect` de generación de preguntas — en modo IA significa regenerar todo con N llamadas a Groq.
- El usuario que quiere repetir el quiz desde la pantalla final paga el costo de regeneración completa.
- En modo pre-generado el costo es mínimo. En modo IA puede ser 3-6 segundos de espera inesperada.
- **Mejora**: distinguir "nueva sesión con drops nuevos" de "repetir misma sesión" — el segundo debería solo resetear índices.

### OBS 20 — Quiz: `sendChatMessage` tiene `eslint-disable-next-line @typescript-eslint/no-unused-vars`
- La función `sendChatMessage` tiene el comment `// eslint-disable-next-line @typescript-eslint/no-unused-vars` encima de su declaración.
- Sin embargo SÍ es usada — está referenciada en el `onKeyDown` del input y en el botón "Enviar" dentro del chat overlay del quiz.
- El comment es incorrecto y puede causar confusión (alguien podría pensar que la función es dead code y eliminarla).
- **Fix**: eliminar el comment `@typescript-eslint/no-unused-vars`.

---

## FIXES PRIORITARIOS (orden sugerido)

### Bugs funcionales — RESUELTOS ✅
1. **Bug 4 + 6** ✅ — Quiz `handleNext()` desfase de índice → fix en Quiz.tsx
2. **Bug 5** ✅ — Opciones múltiples dummy → distractores de otros drops del mismo tipo en groq.ts
3. **Bug 1** ✅ — Primera card expandida → `useEffect` con `drop.id` dep en DropCard.tsx
4. **Bug 2** ✅ — line-clamp dinámico → condicionales explícitos en DropCard.tsx

### Calidad de contenido — RESUELTOS ✅
5. **OBS 2 + 3** ✅ — Quiz Ejemplo placeholder + Explicación duplicada → ocultos en modo pre-generado
6. **OBS 20** ✅ — Eliminado `eslint-disable` incorrecto en `sendChatMessage`

### UX / flujo — RESUELTOS ✅
7. **OBS 1 + 6** ✅ — "258 por repasar" engañoso → filtrado `viewed === true` en useBrainDrop.tsx + Progress.tsx
8. **OBS 7** ✅ — Compose colapsado por default → default minimized=true en Compose.tsx
9. **OBS 8** ✅ — Eliminado gap-3 entre cards en Feed.tsx
10. **OBS 18** ✅ — Confirm nativo → inline ¿Borrar? / ✕ en DropCard.tsx

### Más fixes aplicados ✅
11. **OBS 4** ✅ — Collections y Explore: eliminado gap-3, cards ya usan cardExpanded state
12. **OBS 16** ✅ — AIChat sugerencias contextuales por tipo de drop (suggestionsByType map)
13. **OBS 17** — Ya tenía placeholder. Cubierto.

### Pendientes (menor prioridad)
14. **OBS 19** — Quiz restart → separar "nueva sesión" de "repetir sesión"
15. **OBS 5** — Colecciones: no hay gestión (crear/editar/borrar)
