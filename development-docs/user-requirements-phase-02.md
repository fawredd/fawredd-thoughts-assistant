# PROMPT DE MEJORA: IMPLEMENTACIÓN DE MEMORIA HÍBRIDA (RAG + ESTADO NARRATIVO)

## OBJETIVO
Evolucionar la aplicación actual para incluir memoria episódica (RAG) y una línea de tiempo coherente, manteniendo la privacidad mediante el manejo de datos encriptados.

## 1. INFRAESTRUCTURA DE MEMORIA (RAG)
- **Vector Storage:** Configurar `pgvector` en la base de datos Neon existente.
- **Esquema Drizzle:** Modificar la tabla `entries` para incluir una columna `embedding` de tipo `vector(768)` (optimizado para Gemini embeddings).
- **Flujo de Privacidad:** - Los datos se almacenan encriptados en reposo. 
  - El proceso de "Embedding" debe ocurrir en el Server Action tras la desencriptación momentánea de la entrada actual para su indexación.

## 2. ACTUALIZACIÓN DEL ESQUEMA DEL ESTADO (ZOD)
Extender el `userStateSchema` para incluir coherencia temporal:
```typescript
const userStateSchema = z.object({
  // ... campos previos (problems, objectives, happyMoments, etc.)
  narrativeSummary: z.string().describe("Resumen de la evolución emocional y vital del usuario a lo largo del tiempo."),
  timelineContext: z.object({
    currentPhase: z.string().describe("Etapa actual definida por el usuario o detectada (ej: 'Post-mudanza', 'Crisis laboral')."),
    lastMilestone: z.string().describe("El hito más reciente e importante detectado.")
  }),
  continuityNotes: z.string().describe("Notas técnicas para que el psicólogo mantenga el hilo de la sesión anterior.")
});
```

## 3. PIPELINE DE PROCESAMIENTO (SERVER ACTION)
El equipo de agentes debe refactorizar la acción principal siguiendo este orden lógico:

1.  **Ingesta:** Recibir la entrada, desencriptar la clave de usuario necesaria.
2.  **Recuperación (RAG):** - Generar el embedding de la entrada actual usando `sdk-ai` (`embed` function).
    - Consultar en la DB las 3 entradas pasadas más relevantes semánticamente.
3.  **Arquitecto de Estado (Update):**
    - Enviar al modelo: [Estado Anterior] + [Nuevos Fragmentos RAG] + [Entrada Actual].
    - El modelo debe devolver el objeto JSON actualizado con la nueva `narrativeSummary`.
4.  **Psicólogo (Response):**
    - Generar respuesta usando el **Nuevo Estado** generado en el paso 3.
    - El prompt del psicólogo debe priorizar la "Continuidad Narrativa" para no sonar repetitivo.
5.  **Cierre:** Encriptar la nueva entrada y el nuevo estado antes de persistir en Neon.

## 4. INSTRUCCIONES ESPECÍFICAS PARA AGENTES
- **Eficiencia de Tokens:** Asegurar que los fragmentos recuperados por RAG no excedan los 500 tokens en total.
- **Tratamiento de Datos:** Toda lógica de desencriptación debe ser efímera y ocurrir únicamente en memoria dentro del Server Action (Node.js runtime). Nunca exponer datos planos en logs o cliente.
- **UI:** Añadir un indicador visual de "Contexto Recuperado" o "Línea de Tiempo" en el dashboard para que el usuario vea su evolución narrativa.
-- **UI:** Utilizar el componente Sonner de Shadcn (toaster y toast) para mensajes al usuario sobre carga de datos y errores genericos.
- **AI:** para embeddings utilizar el modelo `gemini-embedding-001`. Este es un ejemplo parcial en javascript de uso que hay que adaptar a este proyecto y sirve solo como referencia:
```
import { GoogleGenAI } from "@google/genai";
// npm i compute-cosine-similarity
import * as cosineSimilarity from "compute-cosine-similarity";

async function main() {
    const ai = new GoogleGenAI({});

    const texts = [
        "What is the meaning of life?",
        "What is the purpose of existence?",
        "How do I bake a cake?",
    ];

    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: texts,
        config: { taskType: 'SEMANTIC_SIMILARITY' },
    });

    const embeddings = response.embeddings.map(e => e.values);
````
---

**Nota técnica:** Utilizar `cosine_distance` para la búsqueda vectorial en Drizzle.

---

**IMPORTANTE:**
- Crear nueva rama git "development" para esta implementacion