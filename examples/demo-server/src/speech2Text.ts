import { GladiaSTT } from '@micdrop/gladia'
import { OpenaiSTT } from '@micdrop/openai'
import { MockSTT, FallbackSTT } from '@micdrop/server'

const speech2Text = {
  // Mock
  mock: () => new MockSTT(),

  // Gladia
  gladia: () =>
    new GladiaSTT({
      apiKey: process.env.GLADIA_API_KEY || '',
      settings: {
        realtime_processing: {
          custom_vocabulary: true,
          custom_vocabulary_config: {
            vocabulary: ['Micdrop'],
          },
        },
      },
    }),

  // OpenAI
  openai: () =>
    new OpenaiSTT({
      apiKey: process.env.OPENAI_API_KEY || '',
    }),

  // Fallback
  fallback: () =>
    new FallbackSTT({
      factories: [speech2Text.gladia, speech2Text.openai],
    }),
}

export default speech2Text
