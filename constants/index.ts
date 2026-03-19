export const subjects = [
  "maths",
  "language",
  "science",
  "history",
  "coding",
  "economics",
];

export const subjectsColors = {
  science: "#E5D0FF",
  maths: "#FFDA6E",
  language: "#BDE7FF",
  coding: "#FFC8E4",
  history: "#FFECC8",
  economics: "#C8FFDF",
};

export const voices = {
  male: { casual: "2BJW5coyhAzSr8STdHbE", formal: "c6SfcYrb2t09NHXiT80T" },
  female: { casual: "ZIlrSGI4jZqobxRKprJz", formal: "sarah" },
};

export const recentSessions = [
  {
    id: "1",
    subject: "science",
    name: "Neura the Brainy Explorer",
    topic: "Neural Network of the Brain",
    duration: 45,
    color: "#E5D0FF",
  },
  {
    id: "2",
    subject: "maths",
    name: "Countsy the Number Wizard",
    topic: "Derivatives & Integrals",
    duration: 30,
    color: "#FFDA6E",
  },
  {
    id: "3",
    subject: "language",
    name: "Verba the Vocabulary Builder",
    topic: "English Literature",
    duration: 30,
    color: "#BDE7FF",
  },
  {
    id: "4",
    subject: "coding",
    name: "Codey the Logic Hacker",
    topic: "Intro to If-Else Statements",
    duration: 45,
    color: "#FFC8E4",
  },
  {
    id: "5",
    subject: "history",
    name: "Memo, the Memory Keeper",
    topic: "World Wars: Causes & Consequences",
    duration: 15,
    color: "#FFECC8",
  },
  {
    id: "6",
    subject: "economics",
    name: "The Market Maestro",
    topic: "The Basics of Supply & Demand",
    duration: 10,
    color: "#C8FFDF",
  },
];

/**
 * 10 default AI tutors available to all users.
 * Each has a fixed UUID so session history can reference them.
 * Diverse across subject, voice (male/female), style (formal/casual), and duration.
 */
export const DEFAULT_COMPANIONS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Neura the Brainy Explorer",
    subject: "science",
    topic:
      "Dive deep into the wonders of the nervous system — learn how neurons fire, how signals travel through the brain, and the science behind how we think, feel, and react.",
    voice: "female",
    style: "formal",
    duration: 45,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Countsy the Number Wizard",
    subject: "maths",
    topic:
      "Master the fundamentals of calculus — from understanding limits and derivatives to solving integrals. Perfect for exam prep and building a rock-solid math foundation.",
    voice: "male",
    style: "casual",
    duration: 30,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Verba the Vocabulary Builder",
    subject: "language",
    topic:
      "Explore classic and modern English literature — analyse themes, characters, and writing styles from Shakespeare to contemporary authors, boosting both comprehension and vocabulary.",
    voice: "female",
    style: "casual",
    duration: 30,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    name: "Codey the Logic Hacker",
    subject: "coding",
    topic:
      "Learn the building blocks of programming — understand if-else logic, loops, and control flow with hands-on examples in Python and JavaScript that make coding click.",
    voice: "male",
    style: "formal",
    duration: 45,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    name: "Memo the Memory Keeper",
    subject: "history",
    topic:
      "Uncover the causes, key events, and lasting consequences of World War I and II — from alliances and treaties to the social changes that reshaped the modern world.",
    voice: "male",
    style: "casual",
    duration: 15,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    name: "The Market Maestro",
    subject: "economics",
    topic:
      "Understand how markets work — explore supply and demand curves, equilibrium pricing, and real-world examples of how economies respond to change.",
    voice: "female",
    style: "formal",
    duration: 20,
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    name: "Newton the Force Guide",
    subject: "science",
    topic:
      "Break down Newton's three laws of motion with real-world scenarios — from car crashes to roller coasters. Build intuition for forces, momentum, and the physics of everyday life.",
    voice: "male",
    style: "formal",
    duration: 30,
  },
  {
    id: "00000000-0000-0000-0000-000000000008",
    name: "Algy the Equation Solver",
    subject: "maths",
    topic:
      "Conquer algebra from linear equations to quadratics — learn step-by-step problem solving, factoring techniques, and graphing methods that make algebra intuitive and fun.",
    voice: "female",
    style: "casual",
    duration: 25,
  },
  {
    id: "00000000-0000-0000-0000-000000000009",
    name: "Pixel the Web Builder",
    subject: "coding",
    topic:
      "Build your first website from scratch — learn HTML structure, CSS styling, and responsive design principles. Go from blank page to a polished, mobile-friendly site.",
    voice: "female",
    style: "formal",
    duration: 40,
  },
  {
    id: "00000000-0000-0000-0000-00000000000a",
    name: "Penny the Finance Coach",
    subject: "economics",
    topic:
      "Learn personal finance essentials — budgeting, saving strategies, compound interest, and smart investing basics that set you up for long-term financial success.",
    voice: "male",
    style: "casual",
    duration: 20,
  },
];

/** Set of default companion IDs for quick lookup. */
export const DEFAULT_COMPANION_IDS = new Set(
  DEFAULT_COMPANIONS.map((c) => c.id)
);
