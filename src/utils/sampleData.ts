import { PodcastEntry } from "../types/podcast";

export const samplePodcasts: PodcastEntry[] = [
  {
    id: "pod-001",
    title: "Building Habits That Stick",
    podcastName: "The Growth Mindset",
    creator: "Alex Chen",
    guestName: "James Clear",
    sourceLink: "https://www.youtube.com/watch?v=example1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: "2026-01-24",
    durationMinutes: 45,
    rating: 5,
    tags: ["habits", "productivity", "psychology"],
    yourNotes: "Great introduction to habit stacking. Will apply the 2-minute rule.",
    summary: {
      keyTakeaways: [
        "Start with tiny habits (2-minute version) rather than ambitious goals",
        "Habit stacking: attach new habits to existing routines",
        "Environment design is more important than willpower",
      ],
      mainTopic:
        "How to build sustainable habits by starting small and leveraging existing routines.",
      coreInsights: [
        "The 2-minute rule works because it removes the friction of starting. Most people overestimate what they can do in a day but underestimate what they can do in a year. By focusing on tiny habits, you compound small wins into significant change.",
      ],
      actionableAdvice: [
        "Pick one habit you want to build and find an existing habit to stack it with",
        "Make the new habit ridiculously small (2 minutes) for the first month",
      ],
      resourcesMentioned: [
        {
          title: "Atomic Habits by James Clear",
          link: "https://jamesclear.com/atomic-habits",
        },
        {
          title: "Habit tracker template",
          link: null,
        },
      ],
    },
  },
  {
    id: "pod-002",
    title: "The Future of AI and AGI",
    podcastName: "The AI Podcast",
    creator: "Lex Fridman",
    guestName: "Demis Hassabis",
    sourceLink: "https://www.youtube.com/watch?v=example2",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: "2026-01-21",
    durationMinutes: 75,
    rating: 4,
    tags: ["AI", "deep learning", "future", "AGI", "neuroscience"],
    yourNotes:
      "Fascinating perspective on combining neuroscience with deep learning.",
    summary: {
      keyTakeaways: [
        "AGI might require insights from neuroscience, not just scaling compute",
        "Current AI systems lack genuine understanding and reasoning",
        "Synthetic data and self-play are becoming critical for training",
        "The next breakthroughs likely come from interdisciplinary approaches",
      ],
      mainTopic:
        "Exploring the path to AGI through neuroscience-inspired AI, current limitations of deep learning, and future directions for AI research.",
      coreInsights: [
        "Deep learning has achieved remarkable feats, but it's fundamentally different from human intelligence. Current models pattern-match at scale without true reasoning. The podcast discussed how AlphaFold solved protein folding by combining physics priors with deep learning—suggesting hybrid approaches might unlock the next frontier.",
        "Neuroscience provides blueprints we haven't fully exploited. The human brain is incredibly efficient, solving complex tasks with far less energy than our models require. Understanding principles like hierarchical processing, attention, and memory consolidation could inform more efficient AI architectures.",
        "Self-play and synthetic data are game-changers for training. Rather than relying solely on human-labeled data, systems can generate their own training signal. This approach enabled AlphaZero to master chess and Go without human games, suggesting it could scale to other domains.",
      ],
      actionableAdvice: [
        "If working in AI, consider how biology and physics priors can constrain your model architecture",
        "Watch for research combining multiple modalities (vision, language, reasoning) as that's likely where breakthroughs happen",
      ],
      resourcesMentioned: [
        {
          title: "AlphaFold research paper",
          link: "https://deepmind.google/research/",
        },
        {
          title: "Lex Fridman's podcast",
          link: "https://www.youtube.com/@lexfridman",
        },
      ],
    },
  },
  {
    id: "pod-003",
    title: "European Football: Tactics, Transfer Market & Club Culture",
    podcastName: "Football Breakdown",
    creator: "Marco Rossini",
    guestName: "Fabrizio Romano",
    sourceLink: "https://www.youtube.com/watch?v=example3",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    publishedAt: "2026-01-18",
    durationMinutes: 120,
    rating: 4,
    tags: [
      "football",
      "real madrid",
      "tactics",
      "transfer market",
      "european league",
    ],
    yourNotes:
      "Excellent deep-dive into Real Madrid's system and why they keep winning.",
    summary: {
      keyTakeaways: [
        "Real Madrid's success comes from tactical flexibility, not individual talent alone",
        "The transfer market rewards patience and long-term club building",
        "Modern football requires both defensive stability and creative attacking",
        "Mbappé's integration is still ongoing; positional adjustments continue",
        "European clubs are investing heavily in young talent and academy development",
      ],
      mainTopic:
        "In-depth analysis of European football's current landscape, focusing on tactical evolution, transfer market dynamics, and Real Madrid's sustained success despite recent changes.",
      coreInsights: [
        "Real Madrid's defensive structure has been their underrated foundation. While everyone talks about Ronaldo and Benzema's goals, the podcast highlighted how their midfield pressing and zonal defensive coverage forces opponents into mistakes. They don't just defend reactively; they control possession and positioning to prevent dangerous situations. This philosophy extends to their rotation strategy—they sacrifice occasional individual performances for system consistency.",
        "Mbappé's transfer raised expectations, but integration takes time. The discussion covered how Mbappé's positioning is still evolving relative to Vinicius Jr. and Rodrygo. His direct running style complements their possession-based approach, but chemistry requires training time. Recent matches show improvement; the guest noted how Mbappé is starting to make better decisions rather than forcing plays.",
        "The transfer market has shifted toward young talent and long-term planning. Clubs no longer chase aging superstars; instead, they invest in 20-22 year olds with resale value and development potential. Real Madrid's strategy exemplifies this—they acquired Mbappé young, invested in Vinicius Jr. before he peaked, and built depth. This approach reduces risk and maximizes asset value.",
        "Tactical evolution is forcing positional flexibility. Gone are the days of static #9s or fixed wingers. Modern forwards drop deep, fullbacks push high into midfield, and midfielders must defend and create. The podcast analyzed how Real Madrid uses this fluidity to overwhelm opponents—when Benzema drops deep, it creates space for wingers; when fullbacks push up, it compresses the field defensively.",
        "European league parity has increased, which paradoxically strengthens top clubs. With mid-table teams improving tactically and athletically, there's less room for error. This means champions must maintain consistency and depth. Real Madrid's bench quality is underrated; they can rotate without dropping points, which smaller clubs can't do.",
      ],
      actionableAdvice: [
        "If you're a coach, study how Real Madrid's midfield pressing works—it's not random aggression but coordinated triggers based on opponent positioning",
        "For fantasy football players, watch positional flexibility trends; players in fluid systems score more points across games",
        "If analyzing football transfers, factor in system fit, not just individual talent—a 90-rated player in the wrong system underperforms",
      ],
      resourcesMentioned: [
        {
          title: "Fabrizio Romano on transfers",
          link: "https://www.instagram.com/fabrizioromano/",
        },
        {
          title: "Real Madrid's official YouTube channel",
          link: "https://www.youtube.com/@realmadrid",
        },
        {
          title: "Statsbomb tactical analysis",
          link: "https://statsbomb.com/",
        },
      ],
    },
  },
];
