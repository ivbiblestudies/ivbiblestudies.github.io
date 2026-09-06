// Classic inductive-study prompts, grouped by the panel they belong to.
export const PROMPT_LIBRARY = {
  observations: {
    title: 'Observation prompts',
    groups: [
      {
        name: 'Terms & repetition',
        items: [
          'Are there repeated words or word families?',
          'What key terms carry the weight of the passage?',
          'Which words are unfamiliar or worth defining?',
          'Are there lists, pairs, or triads?',
        ],
      },
      {
        name: 'People & speech',
        items: [
          'Who is speaking, and to whom?',
          'Who are the main characters, and how are they described?',
          'What pronouns are used — who does "we", "you", "they" refer to?',
          'What does this reveal about God — Father, Son, or Spirit?',
        ],
      },
      {
        name: 'Structure & logic',
        items: [
          'What connecting words appear (therefore, but, so that, because)?',
          'Are there contrasts or comparisons?',
          'Is there cause and effect?',
          'What is the grammatical flow — commands, promises, statements?',
        ],
      },
      {
        name: 'Setting & atmosphere',
        items: [
          'What is the time, place, and occasion?',
          'What emotional tone does the passage carry?',
          'What Old Testament imagery or quotations appear?',
        ],
      },
    ],
  },
  questions: {
    title: 'Question prompts',
    groups: [
      {
        name: 'Interpretation',
        items: [
          'Why is this detail included?',
          'What did this mean to the original audience?',
          'What does the author assume the reader already knows?',
          'How does this paragraph advance the argument of the book?',
        ],
      },
      {
        name: 'Tension & difficulty',
        items: [
          'What surprises me or seems out of place?',
          'What appears to contradict something else in Scripture?',
          'What would I need to research to understand this fully?',
          'If I removed this verse, what would be lost?',
        ],
      },
      {
        name: 'Context',
        items: [
          'How does this connect to what comes immediately before and after?',
          'Where else does this theme appear in this book?',
          'How is this fulfilled or expanded elsewhere in the canon?',
        ],
      },
    ],
  },
  summary: {
    title: 'Summary prompts',
    groups: [
      {
        name: 'Distilling',
        items: [
          'State the main point of the passage in one sentence.',
          'Give the passage a title of five words or fewer.',
          'Outline the passage in two or three movements.',
          'What is the author trying to accomplish in the reader?',
        ],
      },
      {
        name: 'Theology',
        items: [
          'What does this teach about God?',
          'What does this teach about people?',
          'How does this passage point to the gospel?',
        ],
      },
    ],
  },
  application: {
    title: 'Application prompts',
    groups: [
      {
        name: 'Examine',
        items: [
          'Is there a promise to claim?',
          'Is there a command to obey?',
          'Is there a sin to confess or avoid?',
          'Is there an example to follow or avoid?',
        ],
      },
      {
        name: 'Respond',
        items: [
          'What one change would this passage make in my week?',
          'Who should I share this with, and how?',
          'What would prayer shaped by this passage sound like?',
          'What would obedience cost me here?',
        ],
      },
    ],
  },
}
