import {
  ChatOpenAI,
  ChatOpenAIFields,
  type ChatOpenAICallOptions,
} from '@langchain/openai';
import { z } from 'zod';

const storage = chrome.storage.sync;
const CONFIGURATION_STORAGE_KEY = 'openAI';

let model: ChatOpenAI<ChatOpenAICallOptions> | null = null;

export async function getModel(customConfiguration?: ChatOpenAIFields) {
  if (!model) {
    const configuration = await getOpenAIModelConfiguration(
      customConfiguration
    );

    model = new ChatOpenAI(configuration);
  }

  return model;
}

const DEFAULT_CONFIGURATION: Pick<
  ChatOpenAIFields,
  'modelName' | 'temperature'
> = {
  modelName: 'gpt-3.5-turbo-0125',
  temperature: 0,
};

async function getOpenAIModelConfiguration(
  customConfiguration?: ChatOpenAIFields
) {
  if (customConfiguration) {
    validateConfiguration(customConfiguration);

    console.debug(
      'OpenAI model configuration from the parameters:',
      customConfiguration
    );

    return customConfiguration;
  }

  const configuration: ChatOpenAIFields = {
    ...DEFAULT_CONFIGURATION,
    ...(customConfiguration
      ? customConfiguration
      : (await storage.get(CONFIGURATION_STORAGE_KEY))[
          CONFIGURATION_STORAGE_KEY
        ] ?? {}),
  };

  validateConfiguration(configuration);

  console.debug(
    'OpenAI model configuration from the Chrome storage:',
    customConfiguration
  );

  storage.onChanged.addListener(async (changes) => {
    if (!changes[CONFIGURATION_STORAGE_KEY]) return;

    validateConfiguration(
      changes[CONFIGURATION_STORAGE_KEY] as ChatOpenAIFields
    );

    model = await getModel();

    console.debug(
      'OpenAI model configuration has been updated:',
      changes[CONFIGURATION_STORAGE_KEY]
    );
  });

  return configuration;
}

const chatOpenAICallOptionsSchema = z.object({
  apiKey: z.string({ message: 'API key is required' }),
  modelName: z.string({ message: 'Model name is required' }),
  temperature: z
    .number()
    .min(0, { message: 'The minimum temperature is 0' })
    .max(1, { message: 'The maximum temperature is 1' })
    .optional()
    .default(0),
});

function validateConfiguration(configuration: ChatOpenAIFields): void | never {
  try {
    chatOpenAICallOptionsSchema.parse(configuration);
  } catch (error) {
    if (error instanceof z.ZodError) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon48.png',
        title: 'Configuration validation failed',
        message: error.issues[0].message,
      });

      throw new Error(
        `Configuration validation failed: ${error.issues[0].message}`
      );
    }

    throw error;
  }
}

export function setOpenAIModelConfiguration(configuration: ChatOpenAIFields) {
  chatOpenAICallOptionsSchema.parse(configuration);

  return storage.set({
    [CONFIGURATION_STORAGE_KEY]: configuration,
  });
}
