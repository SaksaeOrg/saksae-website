/**
 * Traductions anglaises — utilisées uniquement au build.
 *
 * Le français est la source et vit dans index.html ; ce fichier porte la
 * contrepartie anglaise de chaque clé `data-i18n`, `data-i18n-html` et
 * `data-i18n-label`. `deploy.mjs` les applique pour produire docs/en/index.html.
 *
 * Rien de tout cela n'est envoyé au navigateur : les deux pages sont servies
 * déjà traduites. Les rares chaînes composées à l'exécution (compteurs, prix,
 * totaux du calculateur) vivent dans js/main.js.
 */
export const strings = {
  'a11y.skip': 'Skip to content',

  'nav.platform': 'Platform',
  'nav.tools': 'AI Tools',
  'nav.pricing': 'Pricing',

  'hero.headline':
    'The #1 AI Business platform<br /><span class="text-[#A1A1AA]">for Freelancers &amp; SMEs</span>',
  'hero.sub1':
    'SAKSAE is a Business Execution platform that centralizes your tools,<br class="hidden md:block" />analyzes your operations and revenue data, and turns them into actions.',
  'hero.sub2': 'Drive your business, detect priorities, take action with SAKSAE.',
  'hero.pop.revenue': 'Revenue',
  'hero.pop.operation': 'Operation',
  'hero.pop.a1': 'Client follow-up',
  'hero.pop.a2': 'Upsell detected',
  'hero.pop.a3': 'Playbook triggered',
  'hero.pop.a4': 'Brief prepared',

  'cta.demo': 'Schedule a demo',
  'cta.requestDemo': 'Request a demo',
  'cta.title': 'Ready to transform your business and take action with SAKSAE?',

  'platform.tag': '[01] Unified Platform',
  'platform.title': 'A powerful and simple platform, powered by AI.',
  'platform.desc':
    'SAKSAE brings your teams together on the same platform. Each tool is powerful, but the real magic happens when you use them together. Reduce fragmentation and trigger the right actions at the right time.',
  'platform.tabs.services': 'Services',
  'platform.tabs.produits': 'Products',
  'platform.tabs.finance': 'Admin &amp; Finance',
  'platform.tabs.equipe': 'Team',

  'onb.tag': '[02] Smart Onboarding',
  'onb.title': 'Go from your data to your<br />first actions in just<br />a few clicks.',
  'onb.desc':
    'SAKSAE automatically imports your scattered data and connects to your existing tools to build your platform.',
  'onb.s0.name': 'Import',
  'onb.s0.title': 'Import your data',
  'onb.s0.desc': 'CSV, Excel, API, direct connections',
  'onb.s1.name': 'Sync',
  'onb.s1.title': 'Sync your tools',
  'onb.s1.desc': 'Email, calendar, existing CRM',
  'onb.s2.name': 'Enrichment',
  'onb.s2.title': 'AI Enrichment',
  'onb.s2.desc': 'Data completed automatically',
  'onb.s2.processing': 'AI processing...',
  'onb.s2.enriching': 'Enriching data',
  'onb.s3.name': 'AI Mapping',
  'onb.s3.title': 'Smart structure',
  'onb.s3.desc': 'Organization detected by AI',
  'onb.s3.detected': 'Structure detected ✓',

  'tools.tag': '[03] AI Tools',
  'tools.title': 'All your tools. One execution intelligence.',
  'tools.desc':
    'SAKSAE replaces your scattered tools and transforms every interaction into an actionable signal. Save time and optimize your revenue with more useful actions: follow up, invoice, prepare, sign, prioritize, delegate, track.',
  'tools.features': 'Key features:',

  'tools.reunion.name': 'AI Meeting',
  'tools.reunion.title': 'Your meetings become intelligent',
  'tools.reunion.desc':
    'Automatic transcription, AI summaries and actions generated instantly after each meeting.',
  'tools.reunion.f1': 'Real-time transcription',
  'tools.reunion.f2': 'Automatic summary',
  'tools.reunion.f3': 'AI-detected actions',
  'tools.reunion.f4': 'Calendar integration',
  'tools.reunion.v1': 'Live',
  'tools.reunion.v2': 'Action detected',
  'tools.reunion.v3': 'Send Q2 budget → Marie (Friday)',
  'tools.reunion.v4': 'AI Summary',
  'tools.reunion.v5': '3 decisions made, 2 actions assigned',

  'tools.projet.name': 'Project',
  'tools.projet.title': 'Manage projects with AI',
  'tools.projet.desc': 'Smart planning, automated tracking and proactive alerts on your projects.',
  'tools.projet.f1': 'Integrated Kanban &amp; Gantt',
  'tools.projet.f2': 'Automatic time tracking',
  'tools.projet.f3': 'Smart alerts',
  'tools.projet.f4': 'Automated reports',

  'tools.calendrier.name': 'Calendar',
  'tools.calendrier.title': 'A calendar that thinks for you',
  'tools.calendrier.desc': 'Smart scheduling that optimizes your time and anticipates your needs.',
  'tools.calendrier.f1': 'Automatic scheduling',
  'tools.calendrier.f2': 'Conflict detection',
  'tools.calendrier.f3': 'AI suggestions',
  'tools.calendrier.f4': 'Multi-calendar sync',
  'tools.calendrier.v1': 'Today',

  'tools.playbook.name': 'Playbook',
  'tools.playbook.title': 'Automate your business processes',
  'tools.playbook.desc':
    'Create intelligent workflows that run automatically according to your rules.',
  'tools.playbook.f1': 'Pre-configured templates',
  'tools.playbook.f2': 'Smart triggers',
  'tools.playbook.f3': 'Automated actions',
  'tools.playbook.f4': 'Real-time tracking',
  'tools.playbook.v1': 'Active Playbook',
  'tools.playbook.v2': 'Next step',
  'tools.playbook.v3': 'Final validation and team notification',

  'tools.paie.name': 'Payslip',
  'tools.paie.title': 'Simplified and automated payroll',
  'tools.paie.desc':
    'Automatic payslip generation with compliant calculations and secure delivery.',
  'tools.paie.f1': 'Automatic calculations',
  'tools.paie.f2': 'Legal compliance',
  'tools.paie.f3': 'Secure delivery',
  'tools.paie.f4': 'Integrated archiving',
  'tools.paie.v1': 'Status',
  'tools.paie.v2': '12 payslips generated this month',

  'tools.contrats.name': 'Contracts',
  'tools.contrats.title': 'Smart contract management',
  'tools.contrats.desc': 'Create, track and renew your contracts with automatic alerts.',
  'tools.contrats.f1': 'Customizable templates',
  'tools.contrats.f2': 'Deadline tracking',
  'tools.contrats.f3': 'Renewal alerts',
  'tools.contrats.f4': 'Automatic versioning',
  'tools.contrats.v1': 'Alert',
  'tools.contrats.v2': '2 contracts to renew this week',

  'tools.signatures.name': 'E-signatures',
  'tools.signatures.title': 'Sign in one click',
  'tools.signatures.desc': 'Legal electronic signature integrated directly into your workflows.',
  'tools.signatures.f1': 'eIDAS legal signature',
  'tools.signatures.f2': 'Multi-signers',
  'tools.signatures.f3': 'Automatic reminders',
  'tools.signatures.f4': 'Complete audit trail',
  'tools.signatures.v1': 'Last signed contract',
  'tools.signatures.v2': 'NexGen — 2h ago',

  'calc.open': 'Calculate your scattered tools savings',
  'calc.select': 'Select the tools you currently use:',
  'calc.current': 'Your current tools',
  'calc.savings': 'Monthly savings',
  'calc.note':
    'Beyond the savings achieved with SAKSAE, these scattered tools create fragmented data, with no actionable or revenue value. SAKSAE unifies everything into one intelligent platform to create impactful actions.',

  'ai.tag': '[04] Artificial Intelligence',
  'ai.title': 'Business AI Agents that<br />transform your data<br />into actions.',
  'ai.desc':
    'Every day, SAKSAE analyzes your revenue, clients, projects, finances and operations to identify high-impact actions. AI proposes concrete, prioritized actions linked to business impact.',
  'ai.revenue': 'Revenue',
  'ai.operational': 'Operational',
  'ai.emailReady': 'Email ready to send',
  'ai.subject': 'Subject:',
  'ai.send': 'Send',
  'ai.edit': 'Edit',
  'ai.executed': 'Action executed',
  'ai.confirm': 'Confirm',
  'ai.details': 'View details',
  'ai.priority.high': 'High',

  'ai.r1.action': 'Client follow-up sent',
  'ai.r1.context': 'Quote #1234 unanswered for 5d',
  'ai.r1.time': '3 min ago',
  'ai.r1.detail':
    'Quote #1234 sent to TechVision on April 5 received no response. AI detected a churn risk and prepared a personalized follow-up.',
  'ai.r1.subject': 'Follow-up: Your SAKSAE Quote #1234',
  'ai.r1.preview':
    "Hello Mr. Durand,\n\nI'm reaching out regarding our proposal from April 5. Would you like to discuss it this week?\n\nBest regards,\nChristophe",

  'ai.r2.action': 'Upsell detected',
  'ai.r2.context': 'CloudNine eligible for Enterprise Pack',
  'ai.r2.time': '25 min ago',
  'ai.r2.detail':
    'CloudNine is using 90% of current capacity and added 12 users this month. AI recommends an upgrade proposal to Enterprise Pack.',
  'ai.r2.subject': 'Upgrade to Enterprise — Special Offer',
  'ai.r2.preview':
    "Hello Sophie,\n\nYour SAKSAE usage has grown significantly! We'd like to offer you a migration to the Enterprise Pack with 20% off the first quarter.\n\nBest regards,\nChristophe",

  'ai.o1.action': 'Meeting brief prepared',
  'ai.o1.context': 'Acme Corp call in 30 min',
  'ai.o1.detail':
    'AI analyzed the last 3 exchanges with Acme Corp, previous meeting notes and deal status to prepare a complete brief.',
  'ai.o1.task':
    '2-page brief generated with key points, anticipated objections and pricing proposal. Shared to your calendar.',

  'ai.o2.action': 'Playbook triggered',
  'ai.o2.context': 'New client onboarding NexGen',
  'ai.o2.detail':
    'NexGen just signed. The onboarding playbook triggered automatically: project creation, welcome pack, kickoff scheduling.',
  'ai.o2.task':
    'Project created in Management. Welcome email sent. Kickoff call scheduled Apr 14 at 10am.',

  'pricing.tag': '[05] Pricing',
  'pricing.title': 'Simple and transparent.',
  'pricing.desc': 'All tools included. No hidden fees.',
  'pricing.monthly': 'Monthly',
  'pricing.annual': 'Annual',
  'pricing.saveNote': 'Save 20% with annual billing',
  'pricing.mo': 'mo',
  'pricing.popular': 'Popular',
  'pricing.contactTeam': 'Contact team',

  'pricing.p1.name': 'Freelancer',
  'pricing.p1.target': '1 user',
  'pricing.p1.desc': 'To manage your clients, missions and revenue solo.',
  'pricing.p1.f2': 'Missions, products &amp; profitability',
  'pricing.p1.f4': 'Essential HR',
  'pricing.p1.f5': 'AI Actions &amp; business alerts',
  'pricing.p1.f6': 'Essential dashboards',

  'pricing.p2.name': 'Team',
  'pricing.p2.target': '2 to 9 users',
  'pricing.p2.desc':
    'To structure the commercial, operational and financial execution of a small business.',
  'pricing.p2.f1': 'Everything in Freelancer',
  'pricing.p2.f2': 'CRM clients &amp; prospects',
  'pricing.p2.f3': 'Missions, deliverables, time &amp; profitability',
  'pricing.p2.f4': 'AI Meetings',
  'pricing.p2.f8': 'Priority support',

  'pricing.p3.name': 'Growth',
  'pricing.p3.target': '10 to 20 users',
  'pricing.p3.desc':
    'To manage a services SME with visibility on revenue, profitability, team and cash.',
  'pricing.p3.f1': 'Everything in Team',
  'pricing.p3.f2': 'Advanced dashboards',
  'pricing.p3.f3': 'Profitability per client, mission &amp; collaborator',
  'pricing.p3.f4': 'Internal workflows',
  'pricing.p3.f5': 'Contracts &amp; e-signature',
  'pricing.p3.f6': 'Sales objectives',
  'pricing.p3.f7': 'Cash management, invoicing &amp; follow-ups',
  'pricing.p3.f8': 'Advanced permissions',

  'pricing.p4.name': 'Enterprise',
  'pricing.p4.target': '20+ users',
  'pricing.p4.desc': 'To connect your teams, data and decisions at organizational scale.',
  'pricing.p4.f1': 'Everything in Growth',
  'pricing.p4.f2': 'Multi-entity',
  'pricing.p4.f3': 'Advanced integrations',
  'pricing.p4.f4': 'Custom automations',
  'pricing.p4.f5': 'Executive reporting',
  'pricing.p4.f6': 'Data governance',
  'pricing.p4.f8': 'Dedicated support',

  'testimonial.q1': '"When I first opened SAKSAE,',
  'testimonial.q2': 'I instantly got the feeling this was',
  'testimonial.q3': 'the next generation of business."',

  // Libellés des maquettes décoratives (aria-label, voir data-i18n-label)
  'mock.sidebar':
    'Preview of SAKSAE navigation: CRM, services, products, management, finance, team and AI centres',
  'mock.platform.crm':
    'Preview of the SAKSAE interface: dashboard with revenue, pipeline value, client and staff counts',
  'mock.platform.services':
    'Preview of the SAKSAE interface: list of missions with client, dates and status',
  'mock.platform.produits':
    'Preview of the SAKSAE interface: catalogue of six products with type, stock and price',
  'mock.platform.management':
    'Preview of the SAKSAE interface: project kanban split into To do, In progress and Done',
  'mock.platform.finance':
    'Preview of the SAKSAE interface: invoicing overview with receipts, overdue invoices and recent invoices',
  'mock.platform.equipe':
    'Preview of the SAKSAE interface: list of team members with role, department and status',
  'mock.tools.reunion':
    'Illustration: meeting transcript, detected action and AI-generated summary',
  'mock.tools.projet':
    'Illustration: project progress by phase, from research to testing',
  'mock.tools.calendrier':
    'Illustration: a day of four meetings, two of them prepared by AI',
  'mock.tools.playbook':
    'Illustration: playbook in progress, three of four steps complete',
  'mock.tools.paie':
    'Illustration: payslips with automatic calculations, compliance and secure delivery',
  'mock.tools.contrats': 'Illustration: contract management with a renewal alert',
  'mock.tools.signatures': 'Illustration: electronic signature and last signed contract',
  'mock.onb.0': 'Illustration: four data sources to import and a progress bar',
  'mock.onb.1':
    'Illustration: three connected tools — Gmail, Google Calendar and contacts',
  'mock.onb.2':
    'Illustration: enrichment in progress, 2,847 contacts and 423 companies',
  'mock.onb.3':
    'Illustration: four matches detected between your data and SAKSAE modules',

  'footer.tagline': 'The AI Business Execution platform for Freelancers and SMEs.',
  'footer.product': 'Product',
  'footer.company': 'Company',
  'footer.finance': 'Finance',
  'footer.rights': 'All rights reserved.',
};

/** Métadonnées du <head>, qui ne peuvent pas porter d'attribut data-i18n. */
export const head = {
  title: 'SAKSAE — The AI Business Execution platform',
  description:
    "SAKSAE centralizes your tools, analyzes your operations and revenue data, and turns them into actions. The AI Business Execution platform for Freelancers and SMEs.",
  ogTitle: 'SAKSAE — The AI Business Execution platform',
  ogDescription:
    "Centralize your tools, spot your priorities, take action. For freelancers and small businesses.",
  /** Bandeau de l'image sociale. */
  ogTag: 'AI Business Execution',
  ogImageAlt: 'SAKSAE — The #1 AI Business platform for Freelancers & SMEs',
};

/** Libellés des données structurées (les noms de formules viennent de `strings`). */
export const jsonld = {
  billingAnnual: 'Annual billing',
  billingMonthly: 'Monthly billing',
  billingFrom: 'Monthly billing, from',
};
