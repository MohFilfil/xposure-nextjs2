/**
 * Xposure landing page copy (Arabic + English).
 * Source: Xposure design doc, draft of 2026-09-15.
 *
 * Rules for whoever consumes this file:
 * - Do not add claims, numbers, logos or testimonials that are not here.
 * - Items under `goals` are TARGETS measured in the pilot, never achieved results.
 * - Wrap IDs and clause numbers (ECC-2:2024, 2-3-3-1) in <bdi> or dir="ltr" when rendering.
 */

export type Locale = "ar" | "en";

export interface LandingContent {
  nav: {
    brand: string;
    links: { id: string; label: string }[];
    demoCta: string;
    langToggle: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    badges: string[];
  };
  problem: {
    title: string;
    subtitle: string;
    stagesTitle: string;
    stages: { name: string; today: string; withXposure: string }[];
    painTitle: string;
    pains: { title: string; body: string }[];
  };
  how: {
    title: string;
    subtitle: string;
    steps: { title: string; body: string }[];
  };
  roles: {
    title: string;
    subtitle: string;
    items: { role: string; body: string }[];
  };
  trust: {
    title: string;
    subtitle: string;
    items: { title: string; body: string }[];
  };
  goals: {
    title: string;
    note: string;
    items: string[];
  };
  cta: {
    title: string;
    body: string;
    button: string;
  };
  footer: {
    tagline: string;
    context: string;
  };
}

export const landingContent: Record<Locale, LandingContent> = {
  ar: {
    nav: {
      brand: "Xposure",
      links: [
        { id: "problem", label: "المشكلة" },
        { id: "how", label: "كيف يعمل" },
        { id: "roles", label: "لمن هو" },
        { id: "trust", label: "الثقة والأمان" },
      ],
      demoCta: "جرّب العرض التوضيحي",
      langToggle: "English",
    },
    hero: {
      eyebrow: "وكيل ذكي لإدارة الامتثال",
      title: "وكيل ذكي يرصد التغيرات التنظيمية ويُبقي منشأتك ممتثلة",
      subtitle:
        "يرصد الإصدارات الجديدة والمسودات، ويقارنها بنداً ببند، ويحدد المنتجات والعمليات والضوابط الداخلية المتأثرة، ثم يقترح الإجراءات مع توثيق كل نتيجة بنص المادة الأصلية. المختص هو من يقرر.",
      primaryCta: "جرّب العرض التوضيحي",
      secondaryCta: "شاهد كيف يعمل",
      badges: ["يعمل داخل المنشأة", "نماذج محلية", "اعتماد بشري لكل إجراء"],
    },
    problem: {
      title: "إدارة التغيير التنظيمي اليوم ما زالت يدوية",
      subtitle:
        "تتعدد الجهات والمصادر وصيغ النشر، ويعتمد تقدير الأثر على خبرة أفراد قليلين. النتيجة جهد متكرر واحتمال فوات تحديث مهم.",
      stagesTitle: "خمس مراحل، ومعظمها يدوي",
      stages: [
        {
          name: "الرصد",
          today: "زيارة مواقع الجهات دورياً، والنشرات البريدية، والمستشارين.",
          withXposure: "الوكيل يتابع المصادر باستمرار ويرصد المسودات.",
        },
        {
          name: "تقييم الانطباق",
          today: "اجتماعات بين الامتثال والأمن السيبراني والجودة.",
          withXposure: "الوكيل يقترح، والمختص يعتمد.",
        },
        {
          name: "تحليل الفجوات",
          today: "قراءة الإصدارين ومقارنتهما يدوياً ثم مطابقتهما مع سجل الضوابط.",
          withXposure: "مقارنة آلية بنداً ببند مع ربط بالضوابط الداخلية.",
        },
        {
          name: "التنفيذ",
          today: "توزيع المهام عبر البريد وتحديث السياسات والإجراءات.",
          withXposure: "مهام تُنشأ بعد الموافقة ومسندة لمالك.",
        },
        {
          name: "المتابعة والتدقيق",
          today: "أدلة متفرقة، وغالباً دون ربط واضح بين المتطلب والإجراء.",
          withXposure: "سجل تدقيق كامل وتذكيرات تلقائية.",
        },
      ],
      painTitle: "ما الذي يعيق الفرق اليوم",
      pains: [
        {
          title: "تعدد الجهات والمصادر",
          body: "جهد متكرر واحتمال فوات تحديث، بسبب تنوع صيغ النشر.",
        },
        {
          title: "اكتشاف المسودات متأخراً",
          body: "ضيق وقت التطبيق وفوات فرصة إبداء الرأي أثناء الاستطلاع.",
        },
        {
          title: "صعوبة معرفة ما تغيّر فعلياً",
          body: "إعادة الترقيم والدمج تجعل المقارنة اليدوية تأخذ أياماً.",
        },
        {
          title: "تقدير الأثر يعتمد على أفراد",
          body: "تباين التقديرات وضياع المعرفة عند انتقال الموظفين.",
        },
        {
          title: "ضعف التتبع",
          body: "صعوبة إثبات الامتثال بسلسلة كاملة من نص المادة حتى المهمة المغلقة.",
        },
        {
          title: "وثائق عربية وإنجليزية وملفات ممسوحة",
          body: "أخطاء في القراءة والمقارنة عند غياب معالجة مخصصة للعربية.",
        },
      ],
    },
    how: {
      title: "كيف يعمل Xposure",
      subtitle: "الوكيل يتولى العمل المتكرر، ويركّز المختص على القرار.",
      steps: [
        {
          title: "الرصد",
          body: "يفحص المصادر المعتمدة ويحفظ الملف كما نُشر مع بصمته.",
        },
        {
          title: "المقارنة",
          body: "يقسّم الوثيقة إلى بنود ويطابقها مع الإصدار السابق، ويستبعد التغييرات الشكلية.",
        },
        {
          title: "تحليل الأثر",
          body: "يبحث في سجلات المنتجات والعمليات والضوابط، ويقدّر الأولوية، ويصوغ التوصية.",
        },
        {
          title: "قرار المختص",
          body: "يراجع النص قبل وبعد والنص الأصلي ودرجة الثقة، ثم يعتمد أو يعدّل أو يرفض.",
        },
        {
          title: "المهمة والتدقيق",
          body: "بعد الاعتماد تُنشأ المهمة لمالكها، ويُسجَّل كل قرار مع سببه ومصدره.",
        },
      ],
    },
    roles: {
      title: "واجهة لكل دور",
      subtitle: "نظام واحد، وكل مستخدم يرى ما يخصه فقط.",
      items: [
        {
          role: "الإدارة العليا / مدير الأمن السيبراني",
          body: "ملخص تنفيذي، ودرجة الامتثال، والبنود الحرجة ومواعيد السريان.",
        },
        {
          role: "مسؤول الامتثال",
          body: "مراجعة التغييرات واعتماد التوصيات، وإدارة المصادر والمهام.",
        },
        {
          role: "مالك العملية أو المنتج",
          body: "المهام المسندة إليه والعمليات والمنتجات المتأثرة.",
        },
        {
          role: "المدقق",
          body: "قراءة فقط لسجل التدقيق والأدلة، مع ربط المتطلب بالإجراء.",
        },
        {
          role: "المشرف التقني",
          body: "صحة المصادر، وحالة الوكيل، وحالة النماذج المحلية.",
        },
      ],
    },
    trust: {
      title: "نموذج الثقة والصلاحيات",
      subtitle:
        "المنشأة لن تثق بالذكاء الاصطناعي ثقة كاملة من اليوم الأول، لذلك نحدد بوضوح ما يصل إليه الوكيل وما يستطيع فعله.",
      items: [
        {
          title: "نماذج محلية",
          body: "يعمل الذكاء الاصطناعي داخل المنشأة، دون الاعتماد على أدوات سحابية.",
        },
        {
          title: "قراءة افتراضياً",
          body: "أقل صلاحية ممكنة: القراءة هي الأصل، والكتابة استثناء بعد الموافقة.",
        },
        {
          title: "الوكيل يقترح والمختص يقرر",
          body: "لا يغيّر الوكيل ملفات المنشأة أو سياساتها، ولا يغلق مهمة، ولا يعتبر متطلباً مستوفى.",
        },
        {
          title: "لا خروج للبيانات",
          body: "مكوّن واحد فقط متصل بالإنترنت لجلب الوثائق العامة، ولا يرسل أي بيانات داخلية.",
        },
        {
          title: "كل شيء مسجّل",
          body: "كل قرار للوكيل أو المختص محفوظ مع سببه ومصدره واسم النموذج وإصداره.",
        },
      ],
    },
    goals: {
      title: "ما نستهدف قياسه",
      note: "أهداف نقيسها في التجربة، وليست نتائج محققة.",
      items: [
        "اكتشاف التغيير خلال ساعات بدل أسابيع.",
        "تقليل وقت قراءة الإصدارات ومقارنتها يدوياً.",
        "سجل جاهز للتدقيق يربط المتطلب بالإجراء.",
      ],
    },
    cta: {
      title: "شاهد الوكيل وهو يعمل",
      body: "جرّب سيناريو كاملاً: رصد إصدار جديد، ومراجعة التغيير الحرج، واعتماد التوصية، وإنشاء المهمة.",
      button: "جرّب العرض التوضيحي",
    },
    footer: {
      tagline: "Xposure — وكيل ذكي لرصد التغيرات التنظيمية وإدارة الامتثال",
      context: "فريق Xposure · هاكاثون AgentX · تحدي SAMI",
    },
  },

  en: {
    nav: {
      brand: "Xposure",
      links: [
        { id: "problem", label: "The problem" },
        { id: "how", label: "How it works" },
        { id: "roles", label: "Who it's for" },
        { id: "trust", label: "Trust & security" },
      ],
      demoCta: "Try the demo",
      langToggle: "العربية",
    },
    hero: {
      eyebrow: "AI agent for compliance management",
      title: "An AI agent that tracks regulatory changes and keeps your facility compliant",
      subtitle:
        "It monitors new releases and drafts, compares them clause by clause, identifies the affected products, processes and internal controls, and proposes actions, with every finding cited to the original text. The specialist makes the decision.",
      primaryCta: "Try the demo",
      secondaryCta: "See how it works",
      badges: ["Runs inside your facility", "Local models", "Human approval for every action"],
    },
    problem: {
      title: "Regulatory change management is still mostly manual",
      subtitle:
        "Regulators, sources and publishing formats vary, and impact assessment depends on the experience of a few people. The result is repeated effort and the risk of missing an update.",
      stagesTitle: "Five stages, mostly manual",
      stages: [
        {
          name: "Monitoring",
          today: "Periodically visiting regulator sites, email newsletters, consultants.",
          withXposure: "The agent monitors sources continuously and detects drafts.",
        },
        {
          name: "Applicability assessment",
          today: "Meetings between compliance, cybersecurity and quality.",
          withXposure: "The agent proposes, the specialist approves.",
        },
        {
          name: "Gap analysis",
          today: "Reading and comparing both versions by hand, then matching against the controls register.",
          withXposure: "Automated clause-by-clause comparison linked to internal controls.",
        },
        {
          name: "Implementation",
          today: "Assigning tasks by email and updating policies and procedures.",
          withXposure: "Tasks are created after approval and assigned to an owner.",
        },
        {
          name: "Follow-up and audit",
          today: "Scattered evidence, often with no clear link between requirement and action.",
          withXposure: "Full audit log and automatic reminders.",
        },
      ],
      painTitle: "What slows teams down today",
      pains: [
        {
          title: "Many regulators and sources",
          body: "Repeated effort and a risk of missing an update, because publishing formats differ.",
        },
        {
          title: "Drafts discovered late",
          body: "Less time to implement, and a missed chance to comment during consultation.",
        },
        {
          title: "Hard to see what really changed",
          body: "Renumbering and merged clauses turn manual comparison into days of work.",
        },
        {
          title: "Impact estimates depend on individuals",
          body: "Inconsistent estimates, and knowledge lost when staff move on.",
        },
        {
          title: "Weak traceability",
          body: "Hard to prove compliance with a full chain from the clause text to the closed task.",
        },
        {
          title: "Arabic, English and scanned documents",
          body: "Reading and comparison errors without dedicated Arabic processing.",
        },
      ],
    },
    how: {
      title: "How Xposure works",
      subtitle: "The agent handles the repetitive work. The specialist focuses on the decision.",
      steps: [
        {
          title: "Monitor",
          body: "Checks approved sources and stores the file as published, with its fingerprint.",
        },
        {
          title: "Compare",
          body: "Splits the document into clauses, matches them to the previous version, and filters out cosmetic changes.",
        },
        {
          title: "Assess impact",
          body: "Searches product, process and control records, estimates priority, and drafts the recommendation.",
        },
        {
          title: "Specialist decides",
          body: "Reviews before and after text, the original source and the confidence score, then approves, edits or rejects.",
        },
        {
          title: "Task and audit",
          body: "After approval the task is created for its owner, and every decision is logged with its reason and source.",
        },
      ],
    },
    roles: {
      title: "A view for every role",
      subtitle: "One system, and each user sees only what concerns them.",
      items: [
        {
          role: "Executive / CISO",
          body: "Executive summary, compliance score, critical items and effective dates.",
        },
        {
          role: "Compliance officer",
          body: "Reviews changes and approves recommendations, and manages sources and tasks.",
        },
        {
          role: "Process or product owner",
          body: "Assigned tasks and the affected processes and products.",
        },
        {
          role: "Auditor",
          body: "Read-only access to the audit log and evidence, linking each requirement to an action.",
        },
        {
          role: "Technical administrator",
          body: "Source health, agent status and local model status.",
        },
      ],
    },
    trust: {
      title: "Trust and permissions model",
      subtitle:
        "A facility will not fully trust AI from day one, so we define clearly what the agent can access and what it can do.",
      items: [
        {
          title: "Local models",
          body: "AI runs inside the facility, with no reliance on cloud tools.",
        },
        {
          title: "Read-only by default",
          body: "Least privilege: reading is the rule, writing is the exception and only after approval.",
        },
        {
          title: "The agent proposes, the specialist decides",
          body: "The agent never changes facility files or policies, never closes a task, and never marks a requirement as met.",
        },
        {
          title: "No data leaves",
          body: "Only one component touches the internet, to fetch public documents, and it sends no internal data.",
        },
        {
          title: "Everything is logged",
          body: "Every agent or specialist decision is stored with its reason, source, model name and version.",
        },
      ],
    },
    goals: {
      title: "What we aim to measure",
      note: "These are targets we measure in the pilot, not achieved results.",
      items: [
        "Detect changes within hours instead of weeks.",
        "Reduce the time spent reading and comparing versions manually.",
        "An audit-ready record linking each requirement to an action.",
      ],
    },
    cta: {
      title: "See the agent at work",
      body: "Try a full scenario: detect a new release, review the critical change, approve the recommendation, and create the task.",
      button: "Try the demo",
    },
    footer: {
      tagline: "Xposure — an AI agent for regulatory change monitoring and compliance management",
      context: "Team Xposure · AgentX Hackathon · SAMI Challenge",
    },
  },
};
