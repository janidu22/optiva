import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    q: "Is Optivita only for weight loss?",
    a: "Not at all. Optivita is a full lifestyle transformation platform. Whether you want to lose weight, build muscle, quit smoking, reduce alcohol, build better habits, or simply become more self-aware through journaling — Optivita supports it all with structured checkpoints over months and years.",
  },
  {
    q: "Can I customize meal plans every week?",
    a: "Yes! You create a new meal plan each week with full control over breakfast, lunch, dinner, and snacks. Each item can include calories, protein, carbs, and fat. You can also copy last week's plan as a starting point.",
  },
  {
    q: "How do milestone checkpoints work?",
    a: "When you create your program, you set checkpoints at intervals like 3 months, 6 months, 1 year, 2 years, etc. Each checkpoint has a target weight and status (upcoming, achieved, or missed). As you log your weight daily, Optivita evaluates your progress against these milestones.",
  },
  {
    q: "Does it support smoking and alcohol tracking?",
    a: "Yes. The smoking tracker lets you log daily cigarette count and cravings (1–10 scale), and shows smoke-free streaks. The alcohol tracker logs drink type, units, and volume, and shows alcohol-free streaks. Both include analytics to help you see trends over time.",
  },
  {
    q: "Is my data private and secure?",
    a: "Absolutely. All your data is stored securely and is only accessible to you. We use industry-standard authentication with JWT tokens, and your data is never shared with third parties. You have full control over your information.",
  },
  {
    q: "Can I use Optivita long-term (years)?",
    a: "That's exactly what Optivita is designed for. Unlike short-term diet apps, Optivita is built for multi-year transformation journeys. Set checkpoints spanning months to years, and track your evolution over time with comprehensive analytics and trend data.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Everything you need to know before starting your mission.
          </p>
        </div>

        {/* Accordion */}
        <Accordion type="single" collapsible className="w-full space-y-2">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl border px-5 data-[state=open]:bg-muted/30"
            >
              <AccordionTrigger className="text-left text-sm font-semibold hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
