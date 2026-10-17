import type { Dict } from "./ar";

/**
 * English dictionary. Typed as `Dict`, so a key added to the Arabic file and
 * forgotten here fails the build rather than falling back silently at runtime.
 *
 * Register note: the Arabic copy addresses the reader directly and plainly.
 * The English keeps that voice — it is a translation of the product, not of a
 * marketing brochure.
 */
export const en: Dict = {
  meta: {
    title: "Xposure — Regulatory change monitoring and compliance management",
    description:
      "An AI agent that runs inside the facility: it watches for regulatory changes, analyses their impact, and manages compliance."
  },

  common: {
    appName: "Xposure",
    of: "of",
    day: "day",
    days: "days",
    change: "change",
    changes: "changes",
    item: "item",
    items: "items",
    task: "task",
    tasks: "tasks",
    entry: "entry",
    entries: "entries",
    all: "All",
    search: "Search…",
    loading: "Loading…",
    none: "—",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    export: "Export",
    open: "Open",
    back: "Back",
    next: "Next",
    previous: "Previous",
    today: "Today",
    reference: "Reference",
    noResults: "No matching results",
    noResultsHint: "Nothing matches the current filters. Widen the search or reset the filters.",
    resetFilters: "Reset filters",
    clearAll: "Clear all",
    filter: "Filter results",
    density: "Row density",
    comfortable: "Comfortable",
    compact: "Compact",
    skipToContent: "Skip to main content",
    mainNav: "Main navigation",
    openMenu: "Open menu",
    notifications: "Notifications",
    userMenu: "User menu",
    toLight: "Switch to light theme",
    toDark: "Switch to dark theme",
    searchAndCommands: "Search and quick commands",
    checkingSession: "Checking session…"
  },

  status: {
    new: "New",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected"
  },

  priority: {
    critical: "Critical",
    strategic: "Strategic",
    quick: "Quick action",
    watch: "Watch"
  },

  nav: {
    dashboard: "Dashboard",
    changes: "Changes",
    tasks: "Tasks",
    sources: "Regulatory sources",
    audit: "Audit log",
    integrations: "Integrations",
    deployment: "Deployment options",
    help: "User guide",
    settings: "Settings",
    groupWork: "Review",
    groupSystem: "System",
    awaitingReview: "awaiting review",
    openTasks: "open tasks",
    pendingApproval: "awaiting specialist approval",
    collapse: "Collapse sidebar",
    expand: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    agentOnline: "Agent online",
    isolatedCore: "Isolated core — no facility data leaves",
    localModels: "Models run locally · Qwen2.5 14B"
  },

  roles: {
    exec: {
      label: "Executive / CISO",
      scope:
        "Sees the whole picture: compliance score, critical issues, and upcoming effective dates. Does not decide individual clauses."
    },
    compliance: {
      label: "Compliance Officer",
      scope:
        "Reviews and decides every change: approve the recommendation and a task is created, or reject it with a written reason. This is the deciding role."
    },
    owner: {
      label: "Process / Product Owner",
      scope: "Sees only their own tasks and the processes and products those tasks touch — not the whole review queue."
    },
    auditor: {
      label: "Auditor — read only",
      scope:
        "Reads but never writes: the audit log, the evidence, and the reviewers' decisions. No approve or reject button on any screen."
    },
    admin: {
      label: "Technical Admin",
      scope:
        "Runs and watches the agent: source health, model status, adoption level and technical connections. Does not decide clause content."
    },
    titles: {
      exec: "Chief Information Security Officer",
      compliance: "Compliance Officer — review and approval rights",
      owner: "Information Security Manager — process owner",
      auditor: "Internal Auditor",
      admin: "Technical Systems Administrator"
    },
    names: {
      exec: "Sultan Almutairi",
      compliance: "Mohammed Alfilfil",
      owner: "Fahad Alotaibi",
      auditor: "Abdullah Alshamri",
      admin: "Yasser Alzahrani"
    }
  },

  login: {
    heading: "Choose a role to sign in",
    lede:
      "A demo with ready-made accounts — no password, no authentication. One application for every role; what differs is what each role sees and what it is allowed to do.",
    enter: "Sign in",
    recommended: "Full demo path",
    backToSite: "Back to the overview page",
    trustIsolation: "Isolated core — no facility data leaves",
    trustModels: "Models run locally · Qwen2.5 14B",
    trustAudit: "Every decision is written to an immutable audit log",
    switchRole: "Switch role (demo)",
    signOut: "Sign out"
  },

  agent: {
    title: "Agent activity",
    lastRun: "Last full cycle — ECC-2:2024 detected",
    running: "Scan in progress",
    inProgress: "running…",
    pausedNow: "Paused — waiting for you",
    runningChip: "Running",
    scanning: "Scanning sources",
    noteRunning: "Each stage is written to the audit log as it happens, with the model name and version.",
    noteIdle: "The agent always stops at the fifth stage. No automatic approval, and no clause closed without a human decision.",
    steps: {
      fetch: { label: "Fetch", detail: "Checks the authority's pages and stores the raw file exactly as published, with its hash." },
      compare: {
        label: "Compare",
        detail: "Compares the text against the last stored version; code strips cosmetic differences before the model sees them."
      },
      impact: {
        label: "Impact analysis",
        detail: "Links every substantive difference to the products, processes and controls it touches."
      },
      citation: {
        label: "Citation check",
        detail: "Code verifies that every quoted passage appears verbatim in the stored raw file."
      },
      await: {
        label: "Paused — awaiting a human decision",
        detail: "The agent neither approves nor closes a clause. The decision belongs to the compliance officer and is logged in their name."
      }
    }
  },

  scan: {
    action: "Scan now",
    runCycle: "Run a cycle now",
    done: "Scan complete. No new releases since ECC-2:2024 — and the agent is paused, waiting for your decision.",
    doneAdmin: "Cycle completed in 3.1 seconds. No new releases — the agent is paused awaiting a human decision.",
    doneSources: "Scan complete. The agent is paused at the fifth stage waiting for your decision — it approves nothing on its own."
  },

  dashboard: {
    agentLive: "Agent running — last scan",
    criticalAwaiting: "critical items awaiting your decision",
    criticalOpenHead: "critical items still undecided",
    awaitingNoCritical: "items awaiting your decision, none of them critical",
    allDecided: "items, all decided",
    startCritical: "Start with the critical item",
    startReview: "Start the review",
    complianceScore: "Compliance score",
    controlsMet: "Controls met",
    gapsOpen: "Open gaps",
    scoreFoot: "Controls actually met — not changes reviewed.",
    deadlineMap: "Effective-date map",
    deadlineSub: "The dates are not spread out — they are stacked. Each cluster is one wave of work.",
    impactUrgency: "Impact × urgency",
    impactUrgencySub: "Select any cell to see its changes",
    highImpact: "High impact",
    lowImpact: "Low impact",
    urgent: "Urgent",
    notUrgent: "Not urgent",
    reviewState: "Human review status",
    reviewStateSub: "No change is dismissed automatically",
    reviewStateFoot: "Marking a clause “not applicable” needs specialist approval and is logged in their name.",
    latestChanges: "Latest changes",
    latestChangesSub: "The five most recent items from the comparison engine",
    viewAll: "View all",
    noChanges: "No changes detected yet",
    noChangesHint: "Run a scan of the active sources to start detecting new releases and drafts.",
    metricChanges: "Substantive changes",
    metricChangesCtx: "Out of 47 detected differences; 35 cosmetic ones were stripped by code",
    metricCritical: "Open critical issues",
    metricCriticalCtx: "Undecided — out of 4 critical items detected",
    metricCriticalCtxNone: "Undecided — out of 4 critical items detected. None are left.",
    metricAwaiting: "Awaiting a human decision",
    metricAwaitingCtx: "The agent closes no clause on its own",
    metricDoneTasks: "Tasks completed",
    metricDoneTasksCtx: "Last completed: MFA rollout — first batch"
  },

  exec: {
    showCritical: "Show critical items",
    criticalOpen: "Open critical items",
    criticalOpenSub: "What the board is most likely to ask about first",
    criticalColumn: "Critical item",
    proposedOwner: "Proposed owner",
    upcoming: "Upcoming effective dates",
    decidedFact: "Decided",
    overdueTasks: "Overdue tasks",
    upcomingWaves: "Upcoming waves",
    daysToNearest: "Days to nearest effective date",
    viewAllChanges: "View all changes",
    noCriticalLeft: "No critical item is left undecided",
    noCriticalBody:
      "All four critical items have been decided, and each decision is logged in its owner's name. What remains is execution: the tasks they created.",
    noCriticalFoot: "The next new critical item will appear here as soon as the next scan detects it."
  },

  owner: {
    onlyMine: "Your tasks only — not the facility queue",
    openTasksHead: "open tasks in your name",
    allClosed: "tasks, all closed",
    openList: "Open my task list",
    myTasks: "My tasks",
    myTasksSub: "Ordered by nearest due date — select a task to open the change that caused it",
    affected: "What your work touches",
    affectedSub: "The assets your open tasks affect — not every asset in the facility",
    products: "Products",
    processes: "Processes",
    controls: "Internal controls",
    nothingAffected: "Nothing of this kind is affected",
    assetsFoot: "Sourced from facility records — last updated 2026-09-14.",
    linkedChanges: "Regulatory items that concern you",
    linkedChangesCtx: "The changes your tasks came from",
    noTasks: "No tasks in your name",
    noTasksHint:
      "Tasks are created after a specialist approves a recommendation on a regulatory change, and are assigned to the relevant process owner."
  },

  auditor: {
    immutable: "Immutable log — nothing is edited or deleted",
    readOnlyEverywhere: "Read only — no decision buttons on any screen",
    entriesHead: "entries in the audit log",
    lede:
      "Every entry carries who acted, what they did, and when — and for agent entries, the model name, its version, and the instruction set used. No entry is deleted or edited; a later change to a decision is written as a new entry above it.",
    openFull: "Open the full log",
    agentEntries: "Agent entries",
    humanEntries: "Human entries",
    undecided: "Undecided items",
    approvedMetric: "Recommendations approved",
    approvedCtx: "Each approval created a task in its owner's name",
    rejectedMetric: "Changes rejected",
    escalatedMetric: "Escalated to manual review",
    escalatedCtx: "Model confidence below the 70% threshold — never passes automatically",
    agentEntriesCtx: "Fetch, compare, impact analysis, citation check",
    latest: "Most recent entries",
    latestSub: "The latest six — in the same chronological order as the full log",
    allEntries: "All entries",
    exportNote: "The log exports in a format suitable for external review.",
    evidence: "Evidence",
    evidenceSub: "What proves the displayed text is what was actually published",
    rawFile: "Raw file",
    rawFileValue: "Stored as published · 2.4 MB",
    rawFileNote: "With a text hash compared on every scan",
    versionHash: "Version hash",
    versionHashNote: "ECC-2:2024 — detected 2026-09-17 06:12",
    model: "Model",
    modelNote: "Instructions v3 — runs inside the network",
    citationCheck: "Citation check",
    citationCheckNote: "Code verified every quoted passage verbatim against the raw file",
    evidenceFoot: "Not one line of text leaves the network, and no clause is approved except by a human decision logged in their name.",
    decisionState: "Decision status across changes",
    decisionStateSub: "What has been decided and what has not — with no way to change it from this screen",
    distribution: "Decision distribution",
    distributionSub: "Share of all substantive changes detected",
    approvedBar: "Approved",
    rejectedBar: "Rejected",
    undecidedBar: "Undecided",
    distributionFoot: "Every move between these states has an entry naming who made it and when.",
    withReason: "of them with a written reason in this session"
  },

  admin: {
    lastCycle: "Last cycle",
    pausedHead: "paused source needs your attention",
    healthyHead: "sources running without fault",
    uptimeLede: "The agent has been running for",
    uptimeLede2: "days without interruption, with an average cycle of",
    uptimeLede3: "seconds.",
    pausedNote: "is paused — it is not scanned until it is re-enabled.",
    allScanned: "Every active source was scanned in its last cycle.",
    manageSources: "Manage sources",
    queue: "Queue",
    pendingSources: "Pending source requests",
    escalated: "Escalated to manual review",
    activeSources: "Active sources",
    noPaused: "No source is paused",
    pausedCount: "paused",
    cycleSeconds: "Cycle time in seconds",
    cycleCtx: "From fetch to the pause awaiting a decision",
    memory: "Accelerator memory",
    belowThreshold: "Below the confidence threshold",
    belowThresholdCtx: "escalated to manual review",
    sourceHealth: "Source health",
    sourceHealthSub: "Last scan and scheduled frequency for each source",
    sourceHealthFoot: "Adding or enabling a source needs specialist approval and is written to the audit log.",
    sourcesPage: "Sources page",
    agentState: "Agent status",
    cycleRunning: "Cycle running now",
    lastFullCycle: "Last full cycle",
    agentNote: "The agent always stops at the fifth stage — no automatic approval, no clause closed.",
    modelState: "Model status",
    modelStateSub: "What gets named in every audit entry",
    modelName: "Model",
    quantization: "Quantization",
    instructions: "Instruction version",
    runtime: "Runs on",
    threshold: "Confidence threshold",
    modelFoot:
      "Changing the model or the instruction version is written to the audit log, and older entries keep the version they ran under.",
    isolation: "Isolation",
    isolationBody:
      "The core is isolated: no outbound port is open and the models run on facility hardware. Only the fetch stage reaches out, to publicly published authority pages, and it carries no internal data with it.",
    notScanned: "Not scanned yet"
  },

  changes: {
    title: "Changes",
    lede:
      "Every substantive difference between ECC-1:2018 and ECC-2:2024, ordered by priority. Cosmetic differences are stripped by code before the model sees them.",
    substantive: "substantive changes",
    searchLabel: "Search changes",
    searchPlaceholder: "Clause number, or a word from the title",
    status: "Status",
    priority: "Priority",
    agency: "Authority",
    allStatuses: "All statuses",
    allPriorities: "All priorities",
    allAgencies: "All authorities",
    colChange: "Change",
    colType: "Change type",
    colEffective: "Effective date",
    colConfidence: "Confidence",
    matching: "matching out of",
    detected: "detected",
    viewList: "List",
    viewWaves: "Waves",
    viewMode: "Change view mode",
    waveDue: "Changes effective on",
    waveAfter: "in",
    wavePassed: "effective since",
    waveAwaiting: "awaiting a decision",
    waveAllDecided: "All items decided",
    showing: "Showing",
    removeFilter: "Remove filter",
    listCaption: "Change list",
    latestCaption: "The five most recent changes detected"
  },

  detail: {
    back: "Back to changes",
    notFound: "Change not found",
    notFoundHint: "This change could not be found.",
    backToList: "Back to the list",
    clause: "Clause",
    effectiveIn: "Takes effect in",
    overdueBy: "Effective since",
    page: "page",
    textComparison: "Clause text comparison",
    previousVersion: "Previous version",
    newVersion: "New version",
    sourceText: "Original text in the document",
    citationMatches: "Citation verified",
    citationFoot: "Code verified this text appears verbatim in the stored raw file.",
    whyPriority: "Why this priority",
    whyFoot:
      "The score is computed by a fixed formula (change type, document status, time remaining, asset sensitivity and count). The model explains the reason only; it does not compute the score.",
    recommendation: "Proposed recommendation",
    proposedOwner: "Proposed owner",
    proposedDue: "Proposed due date",
    approved: "Recommendation approved",
    rejected: "Change rejected",
    by: "By",
    decidedAt: "Decided at",
    createdTask: "Task created",
    inOdoo: "in Odoo",
    reason: "Reason",
    decisionFoot:
      "The decision is recorded in the audit log and cannot be edited — any later change is logged as a new decision.",
    onApprove: "On approval:",
    onApproveBody1: "a task is created in Odoo for",
    onApproveBody2: "due",
    onApproveBody3: "and the decision is logged in your name. The agent modifies no policy or file in the facility.",
    approveAction: "Approve recommendation",
    requestAnalysis: "Request further analysis",
    rejectAction: "Reject",
    decidedOf: "Decided",
    reviewProgress: "Review progress",
    readOnly: "Read only",
    readOnlyBody1: "This item is shown to you for reading. The decision — approve or reject — belongs to the",
    readOnlyBody2: ", whose name is written beside it in the audit log.",
    readOnlyFoot:
      "You see exactly what the reviewer sees: the text before and after, the citation from the document, the reason for the priority, and the proposed recommendation — without decision buttons.",
    detailsCard: "Clause details",
    agency: "Authority",
    document: "Document",
    clauseNumber: "Clause number",
    changeType: "Change type",
    effectiveDate: "Effective date",
    remaining: "Remaining",
    detectedAt: "Detected at",
    affectedAssets: "Affected assets",
    productsLabel: "Products",
    processesLabel: "Processes",
    controlsLabel: "Internal controls",
    nothingAffected: "Nothing affected",
    assetsFoot: "Facility records last updated: 2026-09-14",
    rejectTitle: "Reject change",
    rejectWarning:
      "Rejecting means no action will be created for this change. The decision is logged in your name and cannot be deleted later.",
    rejectConfirm: "Confirm rejection",
    reasonLabel: "Reason for rejection (required)",
    reasonPlaceholder: "For example: already covered by internal procedure no. … with evidence attached.",
    reasonWritten: "The reason is logged in your name.",
    reasonMissing: "Reject stays disabled until you write a reason — no rejection without one.",
    analysisQueued: "sent back to the agent for further analysis. You will have the result in minutes.",
    approvedToast: "Recommendation approved and task created:",
    approvedToastFor: "for",
    nextIs: "Next:",
    nothingLeft: "Nothing is left awaiting your decision.",
    rejectedToast: "rejected. The reason was logged."
  },

  tasks: {
    title: "Tasks",
    lede:
      "Every task here came from an explicit specialist approval and is linked to the change that caused it. The agent neither closes a task nor marks a requirement as met.",
    openOf: "open tasks of",
    mineOnly: "My tasks only",
    odooSync: "Odoo sync — demo",
    openInOdoo: "Open in Odoo",
    odooToast: "The task system opens in a separate tab — a demo mock, with no live connection.",
    overdue: "Overdue",
    overdueCtx: "Past the proposed due date and still open",
    dueSoon: "Due within 45 days",
    dueSoonCtx: "Need scheduling this month",
    done: "Completed",
    doneCtx: "Closed by specialist approval, not by the agent",
    filterTasks: "Filter tasks",
    searchLabel: "Search tasks",
    searchPlaceholder: "Task title, or assignee",
    colTask: "Task",
    colOwner: "Assignee",
    colDue: "Due date",
    matching: "matching out of",
    inList: "in the list",
    clearFilters: "Clear filters",
    listCaption: "Task list",
    overdueBy: "overdue by",
    within: "in"
  },

  sources: {
    title: "Regulatory sources",
    lede:
      "The authorities the agent watches, how often, and when each was last scanned. Adding a source is a request that needs specialist approval — scanning does not start before it.",
    activeOf: "active sources of",
    pendingRequests: "requests awaiting specialist approval",
    addSource: "Add source",
    lastScan: "Last scan",
    frequency: "Scan frequency",
    trackedVersion: "Tracked version",
    notScanned: "Not scanned yet",
    changesFrom: "substantive changes from it",
    pause: "Pause",
    activate: "Enable",
    pausedToast: "Scanning paused for this source — the pause is logged in your name.",
    activateToast: "Enabling requested for this source. It starts with the next scheduled cycle.",
    requestedBy: "Requested by",
    requestedAt: "on",
    stateActive: "Active",
    statePaused: "Paused",
    statePending: "Awaiting specialist approval",
    stateSoon: "Configured, not enabled",
    permissions: "Agent permissions on sources",
    permRead: "Read authority pages and store the raw file",
    permAnalyze: "Compare and analyse inside the network",
    permAdd: "Add or enable a source",
    permWrite: "Modify any file or policy in the facility",
    allowed: "Allowed",
    needsApproval: "Specialist approval",
    denied: "Denied",
    permFoot: "Not one line of text leaves the network; fetching is read-only, from publicly published sources.",
    requestTitle: "Request a new regulatory source",
    requestWarning:
      "Adding is not immediate: the request is logged in your name and waits for specialist approval. Scanning does not start before it.",
    requestSend: "Send request for approval",
    requestNameLabel: "Authority name (required)",
    requestNamePlaceholder: "For example: General Authority for Industrial Security",
    requestDocsLabel: "Documents to track",
    requestDocsPlaceholder: "For example: technical regulation for high-hazard facilities",
    requestFreqLabel: "Proposed scan frequency",
    requestReady: "The request is logged with your name and the time.",
    requestBlocked: "Send stays disabled until you enter the authority name.",
    requestDone: "The source request was logged in your name in the audit log. It will not be scanned before specialist approval.",
    requestPendingResult: "Addition request awaiting specialist approval — not scanned before it.",
    requestNoDocs: "Documents not specified yet",
    freqDaily: "Daily · 05:00",
    freqWeekly: "Weekly · Sunday 05:00",
    freqMonthly: "Monthly · first of the month",
    proposed: "Proposed:"
  },

  audit: {
    title: "Audit log",
    lede:
      "Who did what and when, with the model name, its version, and the instructions used. The log cannot be edited or deleted.",
    immutableCount: "entries — immutable",
    includesModel: "Includes model name and version",
    exportLog: "Export log",
    exported: "The audit log was exported to the internal reports folder.",
    searchLabel: "Search the log",
    searchPlaceholder: "User name or action",
    signed: "Every entry is signed and tied to a user identity",
    noMatch: "No entry matches the current search term.",
    forWhom: "Who this page is for",
    forWhomBody:
      "For internal and external auditors before anyone else: this is where “who decided, when, and on what basis?” is answered without digging through email or meeting minutes.",
    whatIsRecorded: "What is recorded",
    whatIsRecordedBody:
      "Every action with an effect: who performed it, the time to the second, and what changed. Each agent entry also carries the model name, its version, and the instruction set it ran under.",
    immutability: "Why it cannot be edited",
    immutabilityBody:
      "An entry is never deleted or rewritten. Changing an earlier decision writes a new entry above it, so the sequence stays whole and the first decision stays visible."
  },

  settings: {
    title: "Settings",
    lede: "User settings and display preferences. What you change here applies to your account only.",
    tabProfile: "Profile",
    tabPrefs: "Preferences",
    userData: "User details",
    name: "Name",
    role: "Role",
    email: "Internal email",
    profileFoot: "Roles are managed by the system administrator; the switcher in the top bar is a demo tool only.",
    themeAndLang: "Theme and language",
    uiTheme: "Interface theme",
    toLight: "Switch to light",
    toDark: "Switch to dark",
    uiLang: "Interface language",
    langNote: "Switching the language flips the whole interface direction (RTL/LTR) and is saved in this browser.",
    adoptionLevel: "Adoption level",
    adoptionFoot: "Raising the level needs the security officer's approval and is written to the audit log.",
    level0: "Level 0 — standalone",
    level0Detail: "The agent works from uploaded files with no technical integration.",
    level1: "Level 1 — read connectors",
    level1Detail: "Read-only access to product and control records through a limited service account.",
    level2: "Level 2 — act on approval",
    level2Detail: "Creates tasks and updates their status after specialist approval.",
    demoData: "Demo data",
    demoDataSub: "Decisions are stored in this browser only",
    demoDataBody1: "Decided",
    demoDataBody2: "of",
    demoDataBody3:
      "changes. In a real deployment these decisions are written to the database and the audit log, and are never erased.",
    resetDemo: "Reset demo data",
    resetNote: "Clears decisions and created tasks from this browser only.",
    resetDone: "Demo data was reset to its initial state.",
    savePrefs: "Save preferences",
    saveNote: "Applied immediately, to this user only.",
    saved: "Preferences saved."
  },

  shortcuts: {
    title: "Keyboard shortcuts",
    general: "General",
    navigation: "Navigation",
    inReview: "Inside a change review screen",
    palette: "Command palette — search and navigation",
    openSearch: "Open search directly",
    showList: "Show this list",
    toggleTheme: "Toggle between dark and light",
    closeAny: "Close any open panel or dialog",
    nextChange: "Next change in the list",
    prevChange: "Previous change in the list",
    foot: "Every shortcut here has a visible equivalent — shortcuts shorten the path, they are never the only door.",
    chordHint: "then d/c/t/a/s — or any other key to cancel"
  },

  palette: {
    placeholder: "Search for a clause, a task, or a command…",
    navGroup: "Navigation",
    actionsGroup: "Actions",
    changesGroup: "Changes",
    tasksGroup: "Tasks",
    recentGroup: "Recent",
    empty: "No results",
    toOpen: "to open",
    toNavigate: "to navigate"
  },

  widgets: {
    noPreviousClause: "No corresponding clause in the previous version — this is an entirely new requirement.",
    noInnerDiff: "No differences inside the clause text itself.",
    additions: "added",
    removals: "removed",
    confidence: "Model confidence",
    confidenceHigh: "The recommendation can be approved directly.",
    confidenceMid: "A closer review is advised before approval.",
    threshold: "threshold",
    escalated: "Escalated to manual review",
    rowDensity: "Table row density",
    queueNav: "Navigate between changes",
    prevItem: "Previous change",
    nextItem: "Next change",
    clusterLegend: "Circle size = number of changes due on the same day",
    dueSameDay: "due on the same day",
    topPriority: "highest",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },

  site: {
    navProblem: "The problem",
    navCompare: "The comparison",
    navHow: "How it works",
    navRoles: "Roles",
    navTrust: "Trust model",
    navEnter: "Enter the demo",
    heroLine1: "We catch control changes",
    heroLine2: "before the auditor does.",
    heroLede:
      "An agent that runs inside your network, compares every new release of the National Cybersecurity Authority's controls against the version you comply with, and puts the difference in front of you in its own words.",
    heroCta: "Enter the demo",
    heroCtaQuiet: "See the comparison",
    problemTitle: "The release is published. You find out late.",
    problemLede:
      "Nobody neglects compliance on purpose. But tracking a document that changes every few years is manual work without end — and this is what it costs today.",
    problemFoot: "The result is always the same: the difference is found late, so months of work are demanded in weeks.",
    pains: [
      {
        q: "When was the new release issued?",
        a: "It appears on the authority's site with no notice to you, and is usually discovered from an auditor's question or a peer at another facility."
      },
      {
        q: "What actually changed?",
        a: "Comparing two documents of hundreds of pages line by line, where most differences are numbering and formatting that consume time and change not one obligation."
      },
      {
        q: "Who here is affected?",
        a: "The link between a clause, a product, a process and an internal control lives in people's heads and scattered spreadsheets — and leaves when they do."
      },
      {
        q: "Who decided, and on what text?",
        a: "The decision is taken in a meeting or an email, so nothing remains to say when it was made, which text it rested on, and what evidence will be produced later."
      },
      {
        q: "When does it take effect?",
        a: "Effective dates are stacked on a few days, and are not seen as one wave of work until weeks before they fall due."
      }
    ],
    compareTitle: "Pick a clause. This is what changed in it.",
    compareLede1: "Five of the twelve clauses that changed between",
    compareLede2: "and",
    compareLede3: "The text below is the authority's own wording, not a summary of it.",
    clause: "Clause",
    newVersion: "New version",
    previousVersion: "Previous version",
    noPrevious: "No corresponding clause — this is an entirely new requirement.",
    citationNote1: "effective",
    citationNote2: "code verified this text appears verbatim in",
    citationNote3: "page",
    countsTitle: "Forty-seven differences. Twelve of them concern you.",
    count47: "textual differences between the two versions, found by the comparison engine.",
    count35: "cosmetic differences stripped by code before the text reached the model.",
    count12: "substantive changes that need a specialist's decision in their name.",
    tilesHead1: "Twelve clauses",
    tilesHead2: "changed substantively",
    tilesBetween: "between",
    tilesAnd: "and",
    tilesMore: "more. Open the full list",
    wavesTitle: "Your deadlines are not spread out. They are stacked.",
    wavesLede:
      "Twelve clauses fall due on just three dates. Seven of them on the same day — and that is one wave of work, not seven deadlines.",
    waveOne: "one clause due",
    waveTwo: "two clauses due",
    waveMany: "clauses due",
    waveSameDay: "on this day",
    waveMore: "more",
    howTitle: "Five stages. The last one is a stop.",
    howLede:
      "The agent goes through the same stages in every cycle and always stops at the fifth: it approves no clause, marks no requirement as met, and modifies not one file in the facility.",
    stage: "Stage",
    stageOf: "of",
    stage1: "Fetch",
    stage1Body:
      "It checks the authorities' pages every morning at five and stores the raw file exactly as published, with its hash. No new release passes without the time it was detected being logged.",
    stage2: "Compare",
    stage2Body:
      "Code strips the cosmetic differences — numbering, formatting and whitespace — before the text reaches the model, so no human judgement is spent on a comma.",
    stage3: "Impact analysis",
    stage3Body:
      "Every substantive difference is linked to what it actually touches: the products, the process lines, and the internal controls that correspond to it — so the decision is never taken on bare text.",
    stage4: "Citation check",
    stage4Body:
      "Code — not the model — verifies that every quoted passage appears verbatim in the stored raw file. What was not published is not displayed.",
    stage5: "Then you decide",
    stage5Body:
      "The agent stops here and waits. Approval creates a task in its owner's name with its due date; rejection needs a written reason — and both are written in your name in a log that cannot be edited.",
    rolesTitle: "Five roles. A screen for each question.",
    rolesLede:
      "Not five systems and not five copies: one application that shows each role what concerns it and withholds what it does not hold. Approval rights sit with one role — and that is what gives the audit log meaning.",
    roleCards: [
      {
        name: "Compliance Officer",
        question: "“What is waiting on my decision today?”",
        sees: "The whole review queue: the text before and after, the affected assets, and the recommendation. Approval and rejection rights are theirs alone."
      },
      {
        name: "Executive / CISO",
        question: "“Where do we stand, and what might embarrass us?”",
        sees: "Compliance score, open critical items, and upcoming effective dates — with no daily queue and no decision buttons."
      },
      {
        name: "Process or product owner",
        question: "“What is required of me?”",
        sees: "Their own tasks ordered by nearest due date, and the products and processes their execution will affect."
      },
      {
        name: "Auditor",
        question: "“Who decided, when, and on what evidence?”",
        sees: "The full log and its attached evidence, without a single edit right — and no approve button on any screen."
      },
      {
        name: "Technical Admin",
        question: "“Is the agent working as it should?”",
        sees: "The health of every source, the cycle time, and the running model with its version and instruction set — with no access to clause content."
      }
    ],
    trustEyebrow: "Trust model",
    trustTitle: "Not one line of text leaves your network.",
    trustLede1: "The models run on your own hardware:",
    trustLede2: "locally. No key to an external provider, and no copy of your documents on a server you do not own.",
    trustPoints: [
      "Local models: the model runs on facility hardware, with no external provider key and no cloud call.",
      "Read-only by default: the agent modifies no file and no policy, and any write permission is granted explicitly and logged.",
      "Human approval before any effect: no task is created and no clause closed except by a specialist decision logged in their name.",
      "Nothing leaves the facility: documents, records and decisions stay inside the perimeter; only the fetch stage reaches out, to what was published openly.",
      "An audit log that cannot be edited or deleted, where changing a decision is written as a new decision above it.",
      "The model explains the reason for a priority but does not compute its score; the score is a fixed formula that can be reviewed."
    ],
    datacenterAlt: "Rows of server cabinets inside a data centre, seen from the cooling aisle.",
    datacenterCaption: "A data centre: an illustration of the runtime environment, not a customer facility.",
    skylineAlt: "The Riyadh skyline just before dawn.",
    boardAlt: "A printed circuit board: the design schematic on one side of the image and the manufactured board on the other.",
    boardCaption: "A printed circuit board: a picture of the world of assets these controls govern.",
    riyadhAlt: "The towers of the King Abdullah Financial District in Riyadh at night.",
    assetsTitle: "A clause becomes a list of assets.",
    assetsBody:
      "Every change is tied to what it actually touches inside the facility: the products, the process lines, and the internal controls that correspond to it. The decision is not taken on bare text, but on what will change on the ground.",
    assetsNote1: "From the encryption clause",
    assetsNote2: ": three products, two processes, and two internal controls.",
    ctaTitle: "Enter the demo as the role that concerns you.",
    ctaLede:
      "Five ready-made accounts, one per role, with no password: sign in as the compliance officer to see the whole flow, or as the auditor to see the same screen without a single decision button.",
    ctaQuiet: "Request a demo on your own controls",
    footerLine: "Regulatory change monitoring and compliance management, inside the facility.",
    footerEnter: "Enter the demo",
    credits: "Images:",
    creditsBy: "by",
    creditsPublicDomain: "public domain",
    creditsVia: "via Wikimedia Commons.",
    mailSubject: "Demo request — Xposure",
    mailBody: "Facility:\nControls we comply with:\nNumber of clauses tracked:\n\nPreferred contact:"
  },

  integrations: {
    title: "Integrations",
    lede:
      "Every technical connection between Xposure and the facility's systems: what it reads, what it writes, and under which permission. No connection is enabled without approval, and no write permission is granted implicitly.",
    connected: "Connected",
    readOnly: "Read only",
    writeOnApproval: "Writes after specialist approval",
    notConnected: "Not connected",
    planned: "Planned",
    permissionLevel: "Permission level",
    lastSync: "Last sync",
    scope: "Scope",
    whatItReads: "What it reads",
    whatItWrites: "What it writes",
    nothing: "Nothing",
    testConnection: "Test connection",
    tested: "Connection healthy. Response time 240 ms.",
    exportNow: "Export now",
    exported: "The file was exported to the internal reports folder.",
    requestConnection: "Request this connection",
    requested: "The request was logged in your name. The connection does not start before specialist approval.",
    grcTitle: "Why this page exists",
    grcBody:
      "Xposure does not replace an existing GRC system — it feeds it: detected clauses, decisions and tasks are exported in standard formats or written straight into the existing system under a limited, logged permission.",
    oscalTitle: "OSCAL export",
    oscalScope: "Control catalogue and decisions in OSCAL 1.1.2 (JSON)",
    oscalReads: "Controls, detected changes, and review decisions",
    oscalWrites: "An export file in the internal reports folder — it writes to no system",
    odooTitle: "Odoo — task system",
    odooScope: "The “Regulatory compliance” project and its tasks",
    odooReads: "Task status, due dates and owners",
    odooWrites: "Creates a task after explicit approval and updates its status — it never closes a task",
    grcConnTitle: "Enterprise GRC system",
    grcConnScope: "Internal control register and risk matrix",
    grcConnReads: "The current control register, to map it against detected clauses",
    grcConnWrites: "Updates control status after specialist approval — planned, not yet enabled",
    ldapTitle: "Identity directory (LDAP)",
    ldapScope: "Users and roles",
    ldapReads: "Identity, role and organisational group",
    ldapWrites: "Nothing — read only",
    foot: "Every write is logged in the audit log in the name of whoever approved it, never in the agent's name."
  },

  deployment: {
    title: "Deployment options",
    lede:
      "Where Xposure runs, and who owns the hardware and the data in each option. The choice is technical and regulatory, not commercial — what differs is the network boundary, not the feature list.",
    sameProduct: "The same product in every option: the features are identical; only where it runs differs.",
    onPremTitle: "On-premises",
    onPremBody:
      "Runs on facility hardware inside its network, with no outbound port open except to fetch publicly published documents. The default for defence facilities and sensitive entities.",
    onPremPoints: [
      "Data, models and logs all stay inside the perimeter",
      "Only the fetch stage reaches out, to public authority pages",
      "Updates arrive as a signed package the technical admin approves"
    ],
    localCloudTitle: "Local cloud",
    localCloudBody:
      "Runs in an in-Kingdom cloud with an approved provider, in a tenant dedicated to the facility. Suits those without a data centre who must still meet data-classification rules.",
    localCloudPoints: [
      "An isolated tenant per facility, with no shared compute",
      "The models run in that same tenant, not behind an external API",
      "Data residency stays in-Kingdom and is documented in the hosting contract"
    ],
    groupTitle: "Multi-company group",
    groupBody:
      "One instance serving several companies in a group, each with its own data, users and audit log, plus a consolidated group-level view.",
    groupPoints: [
      "Each company's data is isolated from the others inside the same instance",
      "Regulatory sources are shared where they match and separated where they differ",
      "A group-level compliance report plus one per company"
    ],
    requirementsTitle: "What it takes to run",
    req1: "A server with at least one GPU accelerator (48GB) for the local models",
    req2: "A PostgreSQL database and storage for the raw files",
    req3: "A service account with limited read access to product and control systems",
    req4: "Outbound access to regulatory authority pages only",
    noPricing:
      "No prices and no subscriptions on this page: choosing between these options is a technical and regulatory decision that precedes any commercial conversation."
  },

  help: {
    title: "User guide",
    lede: "Two minutes, not a manual: what you do on this screen, and what you do not.",
    yourRole: "Your role",
    dailyFlow: "Your daily flow",
    whereToStart: "Where to start",
    rules: "Rules that hold for every role",
    rule1: "The agent always stops at the fifth stage: it approves no clause, closes none, and modifies no file.",
    rule2: "Every decision is written to the audit log with its author and time, and is never deleted or edited.",
    rule3: "Rejection needs a written reason; approval creates a task with a named owner and a due date.",
    rule4: "Facility data never leaves the network, and the models run on its own hardware.",
    shortcuts: "Shortcuts that shorten the path",
    shortcutsNote: "Press ? on any screen to see every shortcut.",
    stepsFor: {
      compliance: [
        "Open the dashboard: the headline says how many items await your decision, and which is due soonest.",
        "Press “Start with the critical item” to open the review screen on the first undecided clause.",
        "Read the text before and after, then the citation from the document, then the affected assets.",
        "Approve the recommendation and a task is created in its owner's name, or reject it with a written reason.",
        "After a decision the system moves to the next item automatically — j and k move you by hand."
      ],
      exec: [
        "Open the dashboard: the compliance score and open critical items lead it.",
        "Review the effective-date map: the dates are stacked, and each cluster is one wave of work.",
        "Open any critical item to read its text and impact — the decision on it belongs to the compliance officer.",
        "Watch the overdue tasks: they are the only measure of execution rather than review."
      ],
      owner: [
        "Open the dashboard: your tasks, ordered by nearest due date.",
        "Select any task to open the regulatory clause that caused it and read why it exists.",
        "Review “what your work touches”: the products and processes your tasks will affect.",
        "Close the task in Odoo — the agent does not close it for you and does not mark it done."
      ],
      auditor: [
        "Open the dashboard: the entry count, and agent entries separated from human ones.",
        "Open the full audit log and search by user name or clause id.",
        "Review the evidence panel: the raw file and its hash, the model name and version.",
        "Open any clause to read it — you will find no approve or reject button on any screen."
      ],
      admin: [
        "Open the dashboard: source health, model status and cycle time.",
        "Review paused or pending sources, and enable what the specialist has approved.",
        "Run a manual cycle when needed and watch the five stages through to the stop.",
        "Check the model status and instruction version — they are what gets written into every audit entry."
      ]
    }
  },

  toast: {
    notifications: "You have 4 critical issues awaiting your decision.",
    oscalExported: "The OSCAL file was exported to the internal reports folder."
  }
};
