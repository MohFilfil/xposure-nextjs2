import type { AuditEntry, DiffSegment, RegChange, Source, Task } from "./types";

/**
 * English rendering of the demo content.
 *
 * The Arabic in `data.ts` is the original: these clauses are illustrative
 * wordings of Arabic NCA controls, so the English here is a working
 * translation for an English-speaking reviewer, not an official text. The
 * citation panel says so on screen.
 *
 * Keyed by id, and merged over the Arabic record at read time, so any field
 * left out simply falls back to the original rather than disappearing.
 */

type ChangeEn = Partial<
  Pick<
    RegChange,
    | "title"
    | "agency"
    | "why"
    | "recommendation"
    | "owner"
    | "products"
    | "processes"
    | "controls"
    | "previous"
    | "current"
    | "citation"
    | "rejectReason"
    | "decidedBy"
  >
> & { type?: string };

const seg = (text: string, kind?: DiffSegment["kind"]): DiffSegment => (kind ? { text, kind } : { text });

const NCA = "National Cybersecurity Authority";

/** Change-type labels, translated separately because the Arabic type is a union of literals. */
export const CHANGE_TYPE_EN: Record<string, string> = {
  "متطلب جديد": "New requirement",
  "تشديد": "Tightened",
  "توضيح": "Clarification",
  "إلغاء": "Merged / removed"
};

export const CHANGES_EN: Record<string, ChangeEn> = {
  "CH-2401": {
    title: "Encryption of data in transit and at rest",
    agency: NCA,
    type: CHANGE_TYPE_EN["تشديد"],
    previous: [
      seg("The organisation shall apply "),
      seg("appropriate", "del"),
      seg(" encryption mechanisms to protect sensitive data in transit and at rest.")
    ],
    current: [
      seg("The organisation shall apply encryption mechanisms "),
      seg("conforming to nationally approved standards (AES-256 or stronger, and TLS 1.3)", "add"),
      seg(" to protect sensitive data in transit and at rest"),
      seg(", with periodic review of the approved algorithm matrix", "add"),
      seg(".")
    ],
    products: ["TC-7 tactical communications unit", "MC-3 portable mission computer", "FG-2 field data gateway"],
    processes: ["Transferring test results from the lab", "Archiving product designs"],
    controls: ["ECC 2-3-3 — Data encryption", "ECC 2-8-1 — Database security"],
    citation: [
      "Control 2-3-3-1: The organisation shall apply encryption mechanisms ",
      "conforming to nationally approved standards (AES-256 or stronger, and TLS 1.3)",
      " to protect sensitive data in transit and at rest, with periodic review of the approved algorithm matrix."
    ],
    why: "The obligation level changed (from “appropriate” to a named standard), the effective date is 104 days out, and 3 sensitive products are affected.",
    recommendation:
      "Inventory every system still using AES-128 or TLS 1.2, update the encryption policy and the approved algorithm matrix, then retest the transport channels before the effective date.",
    owner: "Fahad Alotaibi — Information Security Manager"
  },

  "CH-2402": {
    title: "Cybersecurity for industrial control systems (OT/ICS)",
    agency: NCA,
    type: CHANGE_TYPE_EN["متطلب جديد"],
    previous: [],
    current: [
      seg(
        "The organisation shall establish documented cybersecurity requirements for industrial control systems, covering logical separation from the corporate network, remote access management, and a documented reference architecture for the industrial network.",
        "add"
      )
    ],
    products: ["AL-1 automated assembly line", "RT-4 radar test bench"],
    processes: ["Automated manufacturing", "Final acceptance testing", "Preventive maintenance"],
    controls: ["No matching internal control — gap"],
    citation: [
      "Control 2-13-1: ",
      "The organisation shall establish documented cybersecurity requirements for industrial control systems",
      ", covering logical separation from the corporate network, remote access management, and a documented reference architecture for the industrial network."
    ],
    why: "An entire scope with no coverage in the internal control register, touching a production line already in service.",
    recommendation:
      "Open a sub-project for the OT scope: build the reference architecture, document the remote access points, and add 6 new controls to the internal register.",
    owner: "Noura Alharbi — Industrial Operations Manager"
  },

  "CH-2403": {
    title: "Remediation window for high-severity vulnerabilities",
    agency: NCA,
    type: CHANGE_TYPE_EN["تشديد"],
    previous: [
      seg("High-severity vulnerabilities shall be remediated within "),
      seg("thirty (30) days", "del"),
      seg(" of discovery.")
    ],
    current: [
      seg("High-severity vulnerabilities shall be remediated within "),
      seg("seven (7) days", "add"),
      seg(" of discovery"),
      seg(", and critical vulnerabilities within (72) hours", "add"),
      seg(".")
    ],
    products: ["FG-2 field data gateway", "MC-3 portable mission computer"],
    processes: ["Patch management", "Periodic vulnerability scanning"],
    controls: ["ECC 2-10-2 — Vulnerability management"],
    citation: [
      "Control 2-10-2: High-severity vulnerabilities shall be remediated within ",
      "seven (7) days",
      " of discovery, and critical vulnerabilities within (72) hours."
    ],
    why: "Cutting the window to a quarter of its length forces a change to the current service level agreement and to the monthly patch cycle.",
    recommendation:
      "Amend the internal SLA from 30 days to 7, move from a monthly to a weekly patch cycle, and open an emergency track for critical vulnerabilities.",
    owner: "Fahad Alotaibi — Information Security Manager"
  },

  "CH-2404": {
    title: "Third-party cybersecurity",
    agency: NCA,
    type: CHANGE_TYPE_EN["تشديد"],
    previous: [
      seg("Cybersecurity requirements shall be included in contracts with "),
      seg("relevant", "del"),
      seg(" third parties.")
    ],
    current: [
      seg("Cybersecurity requirements shall be included in contracts with "),
      seg(
        "all third parties, with a prior cybersecurity assessment of every supplier holding access to data or systems, and a documented annual review",
        "add"
      ),
      seg(".")
    ],
    products: [],
    processes: ["Supply chain management", "Supplier contracting", "Managed service provider management"],
    controls: ["ECC 4-1-2 — Third parties", "ECC 4-1-3 — Contracting"],
    citation: [
      "Control 4-1-3: Cybersecurity requirements shall be included in contracts with ",
      "all third parties, with a prior cybersecurity assessment of every supplier holding access to data or systems",
      ", and a documented annual review."
    ],
    why: "Widening the scope from “relevant” to “all” raises the number of suppliers in scope from 14 to 63.",
    recommendation:
      "Prepare a single contractual annex for cybersecurity requirements, classify the 63 suppliers by access level, and start the assessment with those holding direct access.",
    owner: "Sarah Alqahtani — Procurement Manager"
  },

  "CH-2405": {
    title: "Cloud computing and hosting cybersecurity",
    agency: NCA,
    type: CHANGE_TYPE_EN["توضيح"],
    previous: [
      seg("Cybersecurity responsibilities between the organisation and the "),
      seg("cloud", "del"),
      seg(" service provider shall be defined.")
    ],
    current: [
      seg("Cybersecurity responsibilities between the organisation and the cloud service provider shall be defined "),
      seg("in a shared responsibility matrix approved by both parties", "add"),
      seg(".")
    ],
    products: [],
    processes: ["Test environment hosting", "Cloud backup"],
    controls: ["ECC 2-15-1 — Cloud computing"],
    citation: [
      "Control 2-15-1: Cybersecurity responsibilities between the organisation and the cloud service provider shall be defined ",
      "in a shared responsibility matrix approved by both parties",
      "."
    ],
    why: "A formal clarification, but it requires a new auditable document; the effort is small and the date is near.",
    recommendation:
      "Draw up the shared responsibility matrix with the current provider, have both parties approve it, and attach it to the audit file.",
    owner: "Fahad Alotaibi — Information Security Manager"
  },

  "CH-2406": {
    title: "Asset inventory control merged into information asset management",
    agency: NCA,
    type: CHANGE_TYPE_EN["إلغاء"],
    previous: [
      seg("2-2-1 An inventory of information and technology assets shall be documented. "),
      seg("2-2-2 The inventory shall be updated at least annually.", "del")
    ],
    current: [
      seg("2-2-1 An inventory of information and technology assets shall be documented "),
      seg("and updated at least annually", "add"),
      seg(".")
    ],
    products: [],
    processes: ["Annual asset inventory"],
    controls: ["ECC 2-2-1 — Asset inventory", "ECC 2-2-2 — Inventory update (merged)"],
    citation: [
      "Control 2-2-1: An inventory of information and technology assets shall be documented ",
      "and updated at least annually",
      "."
    ],
    why: "Two clauses merged with no change to the actual requirement; the impact is limited to numbering in the internal control register.",
    recommendation:
      "Update the numbering in the internal control register and map the two former controls onto one, with no change to the operating procedure.",
    owner: "Reem Aldosari — Compliance Officer"
  },

  "CH-2407": {
    title: "Multi-factor authentication for remote access",
    agency: NCA,
    type: CHANGE_TYPE_EN["تشديد"],
    previous: [
      seg("Multi-factor authentication shall be applied to "),
      seg("accounts with important and sensitive privileges", "del"),
      seg(".")
    ],
    current: [
      seg("Multi-factor authentication shall be applied to "),
      seg("all remote access accounts without exception, and to every account with administrative privileges", "add"),
      seg(".")
    ],
    products: ["MC-3 portable mission computer"],
    processes: ["Remote access for engineers", "Remote supplier maintenance"],
    controls: ["ECC 2-6-2 — Identity and access management"],
    citation: [
      "Control 2-6-2: Multi-factor authentication shall be applied to ",
      "all remote access accounts without exception",
      ", and to every account with administrative privileges."
    ],
    why: "Removing the exceptions raises the number of accounts in scope from 38 to 214.",
    recommendation:
      "Roll multi-factor authentication out to all remote access accounts in three batches, starting with supplier accounts.",
    owner: "Fahad Alotaibi — Information Security Manager",
    decidedBy: "Fahad Alotaibi"
  },

  "CH-2408": {
    title: "Cyber resilience within business continuity management",
    agency: NCA,
    type: CHANGE_TYPE_EN["توضيح"],
    previous: [
      seg("Cyber resilience requirements shall be included in the "),
      seg("business continuity plan", "del"),
      seg(".")
    ],
    current: [
      seg("Cyber resilience requirements shall be included in the "),
      seg("business continuity plan, and tested annually as part of continuity exercises", "add"),
      seg(".")
    ],
    products: [],
    processes: ["Annual business continuity exercise"],
    controls: ["ECC 3-1-1 — Cyber resilience"],
    citation: [
      "Control 3-1-1: Cyber resilience requirements shall be included in the business continuity plan, ",
      "and tested annually as part of continuity exercises",
      "."
    ],
    why: "The annual exercise already exists; what is required is documenting its cyber portion.",
    recommendation:
      "Add a documented cyber scenario to the next annual continuity exercise and keep the exercise report as audit evidence.",
    owner: "Reem Aldosari — Compliance Officer",
    decidedBy: "Reem Aldosari"
  },

  "CH-2409": {
    title: "Software supply chain security and software bill of materials (SBOM)",
    agency: NCA,
    type: CHANGE_TYPE_EN["متطلب جديد"],
    previous: [],
    current: [
      seg(
        "The organisation shall document the software components used in sensitive systems and verify their sources before adoption.",
        "add"
      )
    ],
    products: ["MC-3 portable mission computer", "FG-2 field data gateway"],
    processes: ["Embedded software development", "Open-source library approval"],
    controls: ["ECC 2-12-1 — Application security (partial coverage)"],
    citation: [
      "Control 2-12-3: ",
      "The organisation shall document the software components used in sensitive systems",
      " and verify their sources before adoption."
    ],
    why: "The wording is general and names neither a format for the bill of materials nor a frequency; it may overlap with existing control 2-12-1.",
    recommendation:
      "Manual review required: first determine whether existing control 2-12-1 already covers part of the requirement before opening a new control.",
    owner: "Not yet assigned"
  },

  "CH-2410": {
    title: "Cybersecurity roles and responsibilities",
    agency: NCA,
    type: CHANGE_TYPE_EN["توضيح"],
    previous: [
      seg("Cybersecurity roles and responsibilities shall be defined "),
      seg("and approved by the authorised official", "del"),
      seg(".")
    ],
    current: [
      seg("Cybersecurity roles and responsibilities shall be defined "),
      seg("and approved by the head of the organisation or their delegate", "add"),
      seg(".")
    ],
    products: [],
    processes: ["Approval of the organisational structure"],
    controls: ["ECC 1-3-1 — Roles and responsibilities"],
    citation: [
      "Control 1-3-1: Cybersecurity roles and responsibilities shall be defined ",
      "and approved by the head of the organisation or their delegate",
      "."
    ],
    why: "The approving authority changed; the content did not.",
    recommendation: "Have the existing roles and responsibilities document re-approved by the head of the organisation.",
    owner: "Reem Aldosari — Compliance Officer",
    decidedBy: "Reem Aldosari",
    rejectReason:
      "The document has been approved by the head of the organisation since 2025-04, so no action is needed. Rejected with the approval copy attached as evidence."
  },

  "CH-2411": {
    title: "Network segmentation between the corporate and operational environments",
    agency: NCA,
    type: CHANGE_TYPE_EN["متطلب جديد"],
    previous: [],
    current: [
      seg(
        "Operational environment networks shall be logically separated from corporate networks in a documented manner, with the crossing channels between them controlled.",
        "add"
      )
    ],
    products: ["AL-1 automated assembly line", "RT-4 radar test bench"],
    processes: ["Automated manufacturing", "Production monitoring"],
    controls: ["ECC 2-5-1 — Network security (partial coverage)"],
    citation: [
      "Control 2-5-4: ",
      "Operational environment networks shall be logically separated from corporate networks in a documented manner",
      ", with the crossing channels between them controlled."
    ],
    why: "It requires redesigning the plant network; the impact is high but the deadline leaves room to plan.",
    recommendation:
      "Put the network segmentation project into the 2027 plan, and start by surveying the current architecture and documenting the existing crossing channels.",
    owner: "Noura Alharbi — Industrial Operations Manager"
  },

  "CH-2412": {
    title: "Backup restoration testing",
    agency: NCA,
    type: CHANGE_TYPE_EN["تشديد"],
    previous: [
      seg("Backup restoration shall be tested "),
      seg("periodically", "del"),
      seg(".")
    ],
    current: [
      seg("Backup restoration shall be tested "),
      seg("at least once every three months, with the result of each test documented", "add"),
      seg(".")
    ],
    products: [],
    processes: ["Cloud backup", "Production environment restoration"],
    controls: ["ECC 2-9-2 — Backups"],
    citation: [
      "Control 2-9-2: Backup restoration shall be tested ",
      "at least once every three months",
      ", with the result of each test documented."
    ],
    why: "Turning “periodically” into a named interval requires a fixed schedule and a record of results.",
    recommendation: "Schedule a fixed quarterly restoration test and create a single template for documenting each result.",
    owner: "Fahad Alotaibi — Information Security Manager"
  }
};

export const TASKS_EN: Record<string, Partial<Pick<Task, "title" | "owner">>> = {
  "T-118": { title: "Update the encryption policy and the approved algorithm matrix", owner: "Fahad Alotaibi" },
  "T-119": { title: "Roll out multi-factor authentication — first batch (suppliers)", owner: "Fahad Alotaibi" },
  "T-120": { title: "Draw up the shared responsibility matrix with the service provider", owner: "Reem Aldosari" },
  "T-121": { title: "Add a cyber scenario to the annual continuity exercise", owner: "Reem Aldosari" },
  "T-122": { title: "Amend the service level agreement for vulnerability remediation", owner: "Fahad Alotaibi" },
  "T-123": { title: "Classify suppliers by access level (63 suppliers)", owner: "Sarah Alqahtani" },
  "T-124": { title: "Schedule a quarterly restoration test", owner: "Fahad Alotaibi" },
  "T-125": { title: "Update control register numbering after merging 2-2-1 and 2-2-2", owner: "Reem Aldosari" },
  "T-126": { title: "Survey the current plant network architecture", owner: "Noura Alharbi" }
};

/** Audit rows are matched by timestamp + Arabic text, so order changes cannot silently mismatch. */
export const AUDIT_EN: Record<string, Pick<AuditEntry, "what" | "who">> = {
  "2026-09-17 06:12|0": {
    what: "New release detected: ECC-2:2024 — text hash f3a9c1…",
    who: "Agent · scheduled scan"
  },
  "2026-09-17 06:12|1": {
    what: "Raw file stored exactly as published (2.4 MB) with its hash",
    who: "Fetch component"
  },
  "2026-09-17 06:13|0": {
    what: "47 differences found between the two versions; 35 cosmetic ones stripped by code",
    who: "Comparison engine"
  },
  "2026-09-17 06:16|0": {
    what: "Impact analysis completed for 12 substantive changes — Qwen2.5 14B, instructions v3",
    who: "Agent"
  },
  "2026-09-17 06:16|1": {
    what: "CH-2409 escalated to manual review (confidence 67%, below threshold)",
    who: "Agent"
  },
  "2026-09-17 08:41|0": {
    what: "Recommendation on CH-2407 approved and task T-119 created in Odoo",
    who: "Fahad Alotaibi"
  },
  "2026-09-17 09:02|0": {
    what: "CH-2410 rejected with a written reason and the previous approval attached",
    who: "Reem Aldosari"
  },
  "2026-09-17 09:15|0": {
    what: "Recommendation on CH-2408 approved and task T-121 created",
    who: "Reem Aldosari"
  },
  "2026-09-18 05:00|0": {
    what: "Scheduled source scan — no new releases",
    who: "Agent · scheduled scan"
  }
};

export const SOURCES_EN: Record<string, Partial<Pick<Source, "name" | "docs" | "frequency" | "lastResult">>> = {
  "SRC-NCA": {
    name: "National Cybersecurity Authority",
    docs: "Essential Cybersecurity Controls (ECC) and their appendices",
    frequency: "Daily · 05:00",
    lastResult: "No new release since ECC-2:2024 was detected on 2026-09-17."
  },
  "SRC-SASO": {
    name: "Saudi Standards, Metrology and Quality Organization",
    docs: "Technical regulations and conformity rules",
    frequency: "Weekly · Sunday 05:00",
    lastResult: "Configured in the system but not yet enabled — needs a technical administrator to switch it on."
  },
  "SRC-NCEC": {
    name: "National Center for Environmental Compliance",
    docs: "Environmental requirements for industrial facilities",
    frequency: "Monthly · first of the month",
    lastResult: "Configured in the system but not yet enabled."
  },
  "SRC-CST": {
    name: "Communications, Space and Technology Commission",
    docs: "Wireless device approval and technical specifications",
    frequency: "Weekly · Thursday 05:00",
    lastResult:
      "Paused at the technical administrator's request — the publication page structure changed and the fetch component is being updated."
  },
  "SRC-GAMI": {
    name: "General Authority for Military Industries",
    docs: "Licensing and local content requirements for defence industries",
    frequency: "Proposed: weekly · Sunday 05:00",
    lastResult: "Addition request awaiting specialist approval — not scanned before it."
  }
};

export const COMPANY_EN = "Defence Electronics Group (fictional company, for demonstration)";

export const AGENT_STATUS_EN = {
  runtime: "Inside the network — no external connection",
  host: "xpo-core-01 · server room B"
};

/** Owner names as they appear on tasks, so an owner filter matches in both languages. */
export const OWNER_NAMES_EN: Record<string, string> = {
  "فهد العتيبي": "Fahad Alotaibi",
  "ريم الدوسري": "Reem Aldosari",
  "سارة القحطاني": "Sarah Alqahtani",
  "نورة الحربي": "Noura Alharbi",
  "محمد الفلفل": "Mohammed Alfilfil",
  "سلطان المطيري": "Sultan Almutairi",
  "عبدالله الشمري": "Abdullah Alshamri",
  "ياسر الزهراني": "Yasser Alzahrani",
  "غير مُسند بعد": "Not yet assigned"
};
