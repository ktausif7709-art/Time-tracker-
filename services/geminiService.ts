
import { GoogleGenAI, Type } from "@google/genai";
import { TimeEntry, Project } from "../types";

export const getProductivityInsights = async (entries: TimeEntry[], projects: Project[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const entriesSummary = entries.map(e => {
    const p = projects.find(proj => proj.id === e.projectId);
    const t = p?.tasks.find(task => task.id === e.taskId);
    return `${e.date}: Spent ${e.hours}h on ${p?.name} - ${t?.name}. Note: ${e.notes}`;
  }).join('\n');

  const prompt = `Analyze the following time logs and provide a concise productivity summary and one actionable tip for improvement. Keep it professional but encouraging.
  
  Logs:
  ${entriesSummary}
  
  Format: JSON with "summary" (string) and "tip" (string) fields.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tip: { type: Type.STRING }
          },
          required: ["summary", "tip"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("AI Insights Error:", error);
    return {
      summary: "I couldn't analyze your data right now. Keep tracking to see patterns!",
      tip: "Consistency is key to understanding where your time goes."
    };
  }
};
