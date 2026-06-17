# Guía demo end-to-end — AgroPredict

Recorrido recomendado para defensa de tesis o presentación al productor. Duración estimada: **15–20 minutos**.

## Pre-requisitos

1. Backend en `http://127.0.0.1:8000` y frontend en `http://localhost:5173`
2. Usuario registrado e iniciado sesión
3. (Opcional) `GEMINI_API_KEY` en `agrotech-backend/.env` para recomendaciones con IA

En **Inicio** verifica que el panel **Estado del sistema** muestre módulos en verde o amarillo (no rojo).

---

## Paso 1 — Predicción FOB (Objetivo predictivo)

**Ruta:** F-03 Predicción

1. Destino: **UNITED STATES**
2. Temporada: **Invierno**
3. Horizonte: **4 semanas**
4. Ejecuta la predicción

**Qué mostrar:** consenso de SARIMAX/SVR/LSTM, tendencia y confianza. Panel **Predicho vs histórico**: contrasta el FOB proyectado con el promedio del mismo mes, el año anterior y la media móvil de 12 meses. Anota el precio FOB proyectado (ej. ~US$ 2.19/kg).

---

## Paso 2 — Rentabilidad con FOB proyectado (Objetivo prescriptivo)

**Ruta:** Calculo de rentabilidad (F-05)

1. Activa **Usar precio FOB proyectado** (mismo destino/temporada/horizonte)
2. Datos de campaña de ejemplo:
   - Rendimiento: **8500 kg/ha**
   - Hectáreas: **5**
   - Costo prod.: **0.85 US$/kg**
   - Flete: **0.30 US$/kg**
   - Región: **LA LIBERTAD / VIRU**
3. **Calcular rentabilidad**

**Qué mostrar:**
- Ganancia unitaria y total
- Punto de equilibrio vs FOB usado
- Recomendación (**SEMBRAR / REDUCIR ÁREA / MANTENER**)
- Badge **Análisis IA** o **Análisis por reglas**

---

## Paso 3 — Campaña y escenarios automáticos

**Ruta:** Campañas → crear campaña (ej. "Demo 2026 - Virú")

**Ruta:** Simulador campañas

1. Selecciona la campaña creada
2. Mismos parámetros del paso 2
3. Clic en **Generar escenarios automáticos**

**Qué mostrar:**
- Tres tarjetas **Alto / Medio / Bajo**
- Escenario Alto con mayor ganancia y menor riesgo que Bajo
- Marca el escenario sugerido como **Mejor**

---

## Paso 4 — Reportes de ciclos (Objetivo descriptivo)

**Ruta:** F-07 Reportes

1. Año: últimos 4–5 años disponibles
2. Mercado: **UNITED STATES** (mismo del paso 1)
3. **Actualizar reporte**

**Qué mostrar:**
- Picos y caídas estacionales con % de recurrencia
- Tabla trimestral: precio, volumen, ingreso estimado
- Botón **Descargar PDF** con el mismo filtro aplicado
- Coherencia: mercado y periodo alineados con la predicción

---

## Paso 5 — Histórico (validación visual)

**Ruta:** F-04 Histórico

1. Mismo destino **UNITED STATES**
2. Año reciente con datos
3. Gráfico mensual y comparativo

**Qué mostrar:** tendencia real que respalda la predicción y los ciclos del reporte.

---

## Mensaje de cierre para la tesis

> AgroPredict integra tres capas analíticas: **predice** el FOB exportador, **prescribe** acciones de campaña con costos explícitos y escenarios simulados, y **describe** ciclos históricos del mercado para reducir la desinformación del productor de palta Hass en La Libertad.

---

## Solución de problemas

| Problema | Acción |
|----------|--------|
| Modelos predictivos "No disponible" | `pip install scikit-learn statsmodels torch` y reiniciar backend |
| "Análisis por reglas" siempre | Agrega `GEMINI_API_KEY` en `agrotech-backend/.env` y reinicia uvicorn |
| Error al guardar campaña/simulación | Verifica token de sesión (re-login) |
| Reportes vacíos | Cambia mercado o amplía rango de años |
| `app.db` bloqueada en git pull | Cierra DBeaver y detén uvicorn |

## Checklist pre-defensa

- [ ] `pytest tests/ -v` pasa en backend
- [ ] `/system/status` → `overall: ok` o `warning`
- [ ] Flujo 1→5 completado sin errores
- [ ] Al menos una campaña con 3 escenarios auto-generados
- [ ] Capturas de pantalla de predicción, rentabilidad y reportes
