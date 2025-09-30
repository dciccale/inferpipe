export interface ModelOption {
  value: string;
  label: string;
  description?: string;
  capabilities?: {
    webSearch?: boolean;
    modality?: "text" | "speech-to-text" | "text-to-speech";
  };
}

export interface ModelGroup {
  label: string;
  options: ModelOption[];
}

export const DEFAULT_MODEL = "gpt-4o-mini";

export const MODEL_GROUPS: ModelGroup[] = [
  {
    label: "Reasoning",
    options: [
      {
        value: "gpt-4.1",
        label: "GPT-4.1",
        description: "Latest flagship reasoning model",
      },
      {
        value: "gpt-4.1-mini",
        label: "GPT-4.1 Mini",
        description: "Lightweight reasoning with lower cost",
      },
    ],
  },
  {
    label: "General Purpose",
    options: [
      {
        value: "gpt-4o",
        label: "GPT-4o",
        description: "Balanced quality for multimodal tasks",
      },
      {
        value: DEFAULT_MODEL,
        label: "GPT-4o Mini",
        description: "Fast, cost-effective general model",
      },
      {
        value: "gpt-4-turbo",
        label: "GPT-4 Turbo",
        description: "High-quality GPT-4 generation",
      },
      {
        value: "gpt-3.5-turbo",
        label: "GPT-3.5 Turbo",
        description: "Legacy fast model",
      },
    ],
  },
  {
    label: "Web Search",
    options: [
      {
        value: "gpt-4o-search-preview",
        label: "GPT-4o Search Preview",
        description: "Web-enabled GPT-4o preview",
        capabilities: { webSearch: true },
      },
      {
        value: "gpt-4o-mini-search-preview",
        label: "GPT-4o Mini Search Preview",
        description: "Web-enabled GPT-4o mini preview",
        capabilities: { webSearch: true },
      },
    ],
  },
  {
    label: "Speech & Audio",
    options: [
      {
        value: "gpt-4o-transcribe",
        label: "GPT-4o Transcribe",
        description: "High quality speech-to-text",
        capabilities: { modality: "speech-to-text" },
      },
      {
        value: "gpt-4o-mini-transcribe",
        label: "GPT-4o Mini Transcribe",
        description: "Fast speech-to-text",
        capabilities: { modality: "speech-to-text" },
      },
      {
        value: "gpt-4o-mini-tts",
        label: "GPT-4o Mini TTS",
        description: "Text-to-speech generation",
        capabilities: { modality: "text-to-speech" },
      },
    ],
  },
];

export const MODEL_METADATA = MODEL_GROUPS.flatMap(
  (group) => group.options,
).reduce<Record<string, ModelOption>>((acc, option) => {
  acc[option.value] = option;
  return acc;
}, {});
