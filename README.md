# AgroPredict — Analítica de negocios (palta Hass, La Libertad)

Plataforma full-stack para productores exportadores: **predicción FOB**, **rentabilidad prescriptiva** y **reportes históricos de ciclos**.

## Repositorios

| Carpeta | Stack |
|---------|--------|
| `agrotech-backend/` | FastAPI, SQLAlchemy, SQLite, scikit-learn, statsmodels, PyTorch |
| `agrotech-frontend/` | React 19, Vite, Tailwind |

## Arranque rápido

### Backend
```powershell
cd agrotech-backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```powershell
cd agrotech-frontend
npm install
npm run dev
```

Abre `http://localhost:5173`, regístrate e inicia sesión.

### Variables opcionales (backend)

Copia `agrotech-backend/.env.example` a `agrotech-backend/.env` y agrega tu clave:

```env
AI_PROVIDER=gemini
GEMINI_API_KEY=tu-clave-aqui
GEMINI_MODEL=gemini-2.0-flash
```

Obtén la clave en [Google AI Studio](https://aistudio.google.com/apikey).

Alternativa OpenAI:
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## Modelos ML por módulo

| Módulo | Modelos | Objetivo |
|--------|---------|----------|
| **F-03 Predicción** | SARIMAX, SVR, LSTM (`app/predict/07_models/`) | Precio FOB a 4–12 semanas |
| **Rentabilidad** | Random Forest margen (`04_margen`), Logistic riesgo (`09_escenario`) | Margen y probabilidad de margen bajo |
| **Recomendación** | Gemini o OpenAI (opcional) o reglas | SEMBRAR / REDUCIR ÁREA / MANTENER |
| **Reportes** | Reglas sobre series históricas | Picos, caídas, comparativo trimestral |

## KPIs principales

- **Ganancia unitaria** = Precio FOB − (costo producción + flete)
- **ROI** = ganancia unitaria / costo total × 100
- **Riesgo** = probabilidad ML de margen bajo (0–100 %)
- **Escenario** = Alto / Medio / Bajo según riesgo

## Pruebas

```powershell
cd agrotech-backend
.\venv\Scripts\pip.exe install pytest
.\venv\Scripts\pytest tests/ -v
```

## Estado del sistema

`GET http://127.0.0.1:8000/system/status` — verifica DB, predicción, rentabilidad, reportes e IA.

El **Inicio** del frontend muestra el mismo estado y el flujo demo de 5 pasos.

Ver guía detallada: [GUIA_DEMO.md](./GUIA_DEMO.md)
