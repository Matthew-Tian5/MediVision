

import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SourceType, TranslatedContent } from '../types';

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          dosage: { type: Type.STRING },
          frequency: { type: Type.STRING },
          instructions: { type: Type.STRING },
          source: { 
            type: Type.STRING, 
            enum: [SourceType.HOSPITAL, SourceType.HOME] 
          },
          category: {
            type: Type.STRING,
            enum: ['OTC', 'Rx'],
            description: "Classify as 'OTC' if available over-the-counter, or 'Rx' if prescription is required."
          },
          reasoning: { 
            type: Type.STRING,
            description: "Short explanation of why this frequency/dosage was detected. Quote the text from the image if possible. E.g. 'Label says BID'." 
          }
        },
        required: ["id", "name", "dosage", "frequency", "source", "category", "reasoning"]
      }
    },
    schedule: {
      type: Type.OBJECT,
      properties: {
        morning: { type: Type.ARRAY, items: { type: Type.STRING } },
        noon: { type: Type.ARRAY, items: { type: Type.STRING } },
        evening: { type: Type.ARRAY, items: { type: Type.STRING } },
        bedtime: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["morning", "noon", "evening", "bedtime"]
    },
    warnings: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          relatedMedicationIds: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "The IDs of the medications involved in this warning."
          }
        },
        required: ["description", "relatedMedicationIds"]
      },
      description: "List potential drug interactions, duplications, or timing warnings."
    }
  },
  required: ["medications", "schedule", "warnings"]
};

export const analyzeMedicationImages = async (
  images: { base64: string, mimeType: string }[]
): Promise<AnalysisResult> => {

  const prompt = `
  You are an expert Clinical Pharmacist and AI Assistant.
  
  I will provide you with images of Hospital Discharge Summaries, Prescription Lists, or Medication Labels (bottles).

  YOUR MISSION:
  Perform "Medication Reconciliation" by analyzing the text in the provided images.

  STEP-BY-STEP INSTRUCTIONS:
  
  1. **EXTRACT**: 
     - Read the images carefully. Extract all medication names, dosages, frequencies, and instructions.
     - If an image is a Bottle Label: Focus on the "Directions" or "Dosage" section. Ignore long ingredient lists unless they clarify the active drug name.
     - If an image is a Discharge Summary: Pay attention to "New Prescriptions" vs "Discontinue" lists.

  2. **MERGE & DEDUPLICATE**:
     - If the same medication appears in multiple images, merge them into a single entry.
     - If there is a conflict (e.g., Bottle says 10mg, Summary says 20mg), use the Discharge Summary (Doctor's order) as the source of truth, but flag it in the 'reasoning'.

  3. **GENERATE SCHEDULE**:
     - Create a daily schedule (Morning, Noon, Evening, Bedtime) including ALL active medications.
     - Rules: "QD" = Morning; "BID" = Morning + Evening; "TID" = Morning + Noon + Evening; "HS" = Bedtime.

  4. **SAFETY ANALYSIS (Critical)**:
     - Check for **Drug-Drug Interactions** between identified medications.
     - Check for **Duplications** (e.g., "Advil" and "Ibuprofen" are the same).
     - If any issues are found, add them to the "warnings" array with clear descriptions.

  OUTPUT FORMAT:
  Return strictly valid JSON matching the Schema provided. Do not include markdown formatting.
`;

  // Prepare parts
  const parts: any[] = [{ text: prompt }];
  
  images.forEach(img => {
    parts.push({
      inlineData: {
        mimeType: img.mimeType,
        data: img.base64
      }
    });
  });

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.1 
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateDoctorIcon = async (): Promise<string | null> => {
  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'A cute, minimalistic 3D cartoon doctor icon. Friendly face, wearing a white coat and stethoscope. Soft studio lighting, Apple emoji style aesthetic, white background.',
          },
        ],
      },
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Failed to generate icon:", error);
    return null;
  }
}

// --- Translation Service ---

const translationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    medications: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          dosage: { type: Type.STRING },
          frequency: { type: Type.STRING },
          instructions: { type: Type.STRING },
          source: { type: Type.STRING, enum: [SourceType.HOSPITAL, SourceType.HOME] },
          category: { type: Type.STRING, enum: ['OTC', 'Rx'] },
          reasoning: { type: Type.STRING }
        },
        required: ["id", "name", "dosage", "frequency", "instructions", "source", "category"]
      }
    },
    warnings: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          relatedMedicationIds: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["description", "relatedMedicationIds"]
      }
    },
    labels: {
      type: Type.OBJECT,
      properties: {
        reportTitle: { type: Type.STRING },
        reportSubtitle: { type: Type.STRING },
        scheduleNameLabel: { type: Type.STRING },
        dateLabel: { type: Type.STRING },
        clinicalAlertsTitle: { type: Type.STRING },
        morning: { type: Type.STRING },
        morningTime: { type: Type.STRING },
        noon: { type: Type.STRING },
        noonTime: { type: Type.STRING },
        evening: { type: Type.STRING },
        eveningTime: { type: Type.STRING },
        night: { type: Type.STRING },
        nightTime: { type: Type.STRING },
        tableMedication: { type: Type.STRING },
        tableType: { type: Type.STRING },
        tableInstructions: { type: Type.STRING },
        tableAdministered: { type: Type.STRING },
        disclaimer: { type: Type.STRING },
        signature: { type: Type.STRING },
        labelOTC: { type: Type.STRING },
        labelRx: { type: Type.STRING },
      },
      required: [
        "reportTitle", "reportSubtitle", "scheduleNameLabel", "dateLabel", 
        "clinicalAlertsTitle", "morning", "morningTime", "noon", "noonTime", 
        "evening", "eveningTime", "night", "nightTime", "tableMedication", 
        "tableType", "tableInstructions", "tableAdministered", "disclaimer", "signature",
        "labelOTC", "labelRx"
      ]
    }
  },
  required: ["medications", "warnings", "labels"]
};

export const translateSchedule = async (
  data: AnalysisResult,
  targetLanguage: string
): Promise<TranslatedContent> => {
  const prompt = `
    Translate the provided medication schedule data and UI labels into ${targetLanguage}.
    
    INSTRUCTIONS:
    1. Medications: Translate 'instructions', 'frequency', and 'reasoning'. Keep 'id' IDENTICAL to the input. Keep 'name' and 'dosage' mostly as is, but transliterate if appropriate for the target language (e.g. Chinese).
    2. Warnings: Translate the 'description'.
    3. Labels: Translate all the UI label fields in the 'labels' object to ${targetLanguage}.
    
    Data to translate:
    ${JSON.stringify({ medications: data.medications, warnings: data.warnings })}
  `;

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: translationSchema,
        temperature: 0.1
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as TranslatedContent;

  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};
