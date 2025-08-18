export const agriculturalAssistant = {
  name: "Krishi Sewa Voice Assistant",
  model: {
    provider: "openai" as const,
    model: "gpt-5" as const,
    temperature: 0.7,
    systemMessage: `You are Krishi Sewa, a friendly agricultural voice assistant for Indian farmers.

Your capabilities:
- Weather forecasts and farming implications  
- Crop cultivation guidance and best practices
- Seasonal planting and harvesting advice
- Pest management and soil health tips

Guidelines:
1. Speak in a warm, helpful, farmer-friendly tone
2. Ask for location if not provided for weather advice
3. Give practical advice for Indian farming conditions
4. Use simple language, avoid technical jargon
5. Encourage sustainable farming practices

When user provides location, remember it for the conversation.

Always end by asking if they need more farming help.`
  },
  voice: {
    provider: "elevenlabs" as const,
    voiceId: "pNInz6obpgDQGcFmaJgB", // Adam voice
    stability: 0.5,
    similarityBoost: 0.8,
    style: 0.2,
    useSpeakerBoost: true,
  },
  transcriber: {
    provider: "deepgram" as const,
    model: "nova-2" as const,
    language: "en-IN" as const,
    smartFormat: true,
    keywords: [
      "farming", "weather", "crops", "agriculture", 
      "irrigation", "fertilizer", "harvest", "plantation", 
      "monsoon", "paddy", "wheat", "cotton", "sugarcane"
    ],
  },
  firstMessage: "Hello! I'm your Krishi Sewa voice assistant. I'm here to help with weather forecasts, crop guidance, and farming advice. To get started, could you share your location for accurate weather information?",
  endCallMessage: "Thank you for using Krishi Sewa! Have a great day and happy farming!",
  recordingEnabled: false,
  silenceTimeoutSeconds: 30,
  maxDurationSeconds: 600, // 10 minutes
  backgroundSound: "office" as const,
  backchannelingEnabled: true,
  backgroundDenoisingEnabled: true,
  modelOutputInMessagesEnabled: true,
} as const;