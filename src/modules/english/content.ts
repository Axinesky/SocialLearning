/*
 * AQA GCSE English Literature content for the English module.
 *
 * Keep exam material here, separate from the UI. Each lesson is one GcseText in
 * the LESSONS list, and the module renders a picker over them. To add a lesson,
 * copy the shape of an existing entry and give it a unique id.
 */

export interface AssessmentObjective {
  code: string;
  summary: string;
}

export interface GcseText {
  /** Unique id, used to select the lesson. */
  id: string;
  board: string;
  paper: string;
  play: string;
  scene: string;
  focusTheme: string;
  speaker: string;
  /** The extract shown to pupils. Faithful to the original text. */
  extract: string;
  /** AQA-style question. */
  question: string;
  /** What a strong answer should cover, in pupil-friendly language. */
  taskPoints: string[];
  themes: string[];
  /** Context points for AO3. */
  context: string[];
  /** Useful analytical terminology for AO2. */
  terminology: string[];
  objectives: AssessmentObjective[];
  /** Deliberate prompt so AI images stay on-tone, not generic. */
  scenePrompt: string;
}

// The three assessment objectives are the same across texts, so define once.
const AOS: AssessmentObjective[] = [
  {
    code: "AO1",
    summary:
      "Read, understand and respond to the text, using quotations to support your ideas.",
  },
  {
    code: "AO2",
    summary:
      "Analyse the language, form and structure the writer uses, with subject terminology.",
  },
  {
    code: "AO3",
    summary: "Show how the context the text was written in shapes its meaning.",
  },
];

// Shared Macbeth context (AO3), reused across the Macbeth lessons.
const MACBETH_CONTEXT = [
  "Written around 1606 for King James I, who believed in the Divine Right of Kings.",
  "James I was fascinated by witchcraft and wrote a book on it, so the witches would deeply unsettle a Jacobean audience.",
  "The Gunpowder Plot of 1605 made the murder of a king a very real and terrifying fear.",
  "Killing a king was seen as the ultimate sin against God's natural order.",
];

const MACBETH_THEMES = [
  "Ambition",
  "The Supernatural",
  "Guilt and Conscience",
  "Appearance vs Reality",
  "Kingship and Order",
];

export const LESSONS: GcseText[] = [
  {
    id: "macbeth-ambition",
    board: "AQA",
    paper: "Paper 1, Section A",
    play: "Macbeth",
    scene: "Act 1, Scene 3",
    focusTheme: "Ambition",
    speaker: "Macbeth",
    extract: `This supernatural soliciting
Cannot be ill, cannot be good. If ill,
Why hath it given me earnest of success,
Commencing in a truth? I am Thane of Cawdor.
If good, why do I yield to that suggestion
Whose horrid image doth unfix my hair
And make my seated heart knock at my ribs,
Against the use of nature?`,
    question:
      "Starting with this moment in the play, explore how Shakespeare presents Macbeth's ambition.",
    taskPoints: [
      "How Shakespeare presents ambition in this extract",
      "How Shakespeare presents ambition in the play as a whole",
    ],
    themes: MACBETH_THEMES,
    context: MACBETH_CONTEXT,
    terminology: [
      "soliloquy",
      "aside",
      "antithesis",
      "foreshadowing",
      "iambic pentameter",
      "imagery",
    ],
    objectives: AOS,
    scenePrompt:
      "A lone medieval Scottish warlord in a dark fur-trimmed cloak standing on a " +
      "windswept highland moor at dusk, swirling mist over purple heather, a brooding " +
      "look of troubled ambition on his face, distant stormy sky, cinematic dramatic " +
      "lighting, atmospheric painterly storybook illustration, richly detailed, moody " +
      "muted colour palette",
  },
  {
    id: "macbeth-guilt",
    board: "AQA",
    paper: "Paper 1, Section A",
    play: "Macbeth",
    scene: "Act 2, Scene 2",
    focusTheme: "Guilt",
    speaker: "Macbeth",
    extract: `Will all great Neptune's ocean wash this blood
Clean from my hand? No, this my hand will rather
The multitudinous seas incarnadine,
Making the green one red.`,
    question:
      "Starting with this moment in the play, explore how Shakespeare presents guilt.",
    taskPoints: [
      "How Shakespeare presents guilt in this extract",
      "How Shakespeare presents guilt in the play as a whole",
    ],
    themes: MACBETH_THEMES,
    context: MACBETH_CONTEXT,
    terminology: [
      "metaphor",
      "hyperbole",
      "imagery",
      "symbolism",
      "soliloquy",
      "iambic pentameter",
    ],
    objectives: AOS,
    scenePrompt:
      "A haunted medieval Scottish king staring in horror at his blood-stained hands, " +
      "alone in a candlelit stone castle chamber at night, deep shadows and flickering " +
      "candlelight, anguish and dread on his face, cinematic chiaroscuro lighting, " +
      "atmospheric painterly storybook illustration, richly detailed, dark moody colour palette",
  },
  {
    id: "macbeth-supernatural",
    board: "AQA",
    paper: "Paper 1, Section A",
    play: "Macbeth",
    scene: "Act 2, Scene 1",
    focusTheme: "The Supernatural",
    speaker: "Macbeth",
    extract: `Is this a dagger which I see before me,
The handle toward my hand? Come, let me clutch thee.
I have thee not, and yet I see thee still.
Art thou not, fatal vision, sensible
To feeling as to sight? Or art thou but
A dagger of the mind, a false creation,
Proceeding from the heat-oppressed brain?`,
    question:
      "Starting with this moment in the play, explore how Shakespeare presents the supernatural.",
    taskPoints: [
      "How Shakespeare presents the supernatural in this extract",
      "How Shakespeare presents the supernatural in the play as a whole",
    ],
    themes: MACBETH_THEMES,
    context: MACBETH_CONTEXT,
    terminology: [
      "soliloquy",
      "personification",
      "imagery",
      "rhetorical question",
      "foreshadowing",
      "iambic pentameter",
    ],
    objectives: AOS,
    scenePrompt:
      "A ghostly glowing dagger floating in mid-air in a dark medieval stone castle " +
      "corridor at night, a shadowy cloaked figure reaching toward it, eerie supernatural " +
      "blue glow, drifting mist and deep shadows, cinematic dramatic lighting, atmospheric " +
      "painterly storybook illustration, richly detailed, haunting moody colour palette",
  },
  {
    id: "inspector-responsibility",
    board: "AQA",
    paper: "Paper 2, Section A",
    play: "An Inspector Calls",
    scene: "Act 3",
    focusTheme: "Responsibility",
    speaker: "Inspector Goole",
    extract: `We don't live alone. We are members of one body.
We are responsible for each other. And I tell you
that the time will soon come when, if men will not
learn that lesson, then they will be taught it in fire
and blood and anguish.`,
    question:
      "How does Priestley present ideas about responsibility in An Inspector Calls? Use this speech as your starting point.",
    taskPoints: [
      "How Priestley presents responsibility in this speech",
      "How Priestley presents responsibility in the play as a whole",
    ],
    themes: ["Responsibility", "Social class", "Age", "Gender", "Socialism"],
    context: [
      "Written by J.B. Priestley in 1945, but set in 1912, just before the First World War.",
      "Priestley was a socialist who believed in collective responsibility over selfish capitalism.",
      "The 1912 setting lets the audience, with hindsight, see the characters' mistakes and the wars to come.",
      "The rigid Edwardian class system and the gap between rich and poor drive the play's message.",
    ],
    terminology: [
      "dramatic irony",
      "morality play",
      "foreshadowing",
      "stage directions",
      "mouthpiece",
      "dramatic monologue",
    ],
    objectives: AOS,
    scenePrompt:
      "An opulent Edwardian dining room in 1912, a stern detective in a dark overcoat " +
      "confronting a wealthy family in formal evening dress around a candlelit dinner " +
      "table, tense uneasy atmosphere, warm lamplight and long shadows, cinematic dramatic " +
      "lighting, atmospheric painterly storybook illustration, richly detailed, period drama, muted palette",
  },
];

export function getLesson(id: string | undefined): GcseText | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** System instruction that makes Gemini mark like a supportive AQA examiner. */
export const EXAMINER_SYSTEM =
  "You are a supportive AQA GCSE English Literature examiner marking a Year 11 " +
  "pupil's paragraph. Give short, encouraging, specific feedback in British " +
  "English. Comment on AO1 (a clear personal response supported by quotations), " +
  "AO2 (analysis of the writer's language, form and structure with correct " +
  "terminology) and AO3 (the historical or social context). Give one clear " +
  "target to improve. Keep it under 120 words and never rewrite the answer for them.";
