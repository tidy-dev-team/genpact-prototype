// ── Work Feed ─────────────────────────────────────────────────────────────────
const workFeedData = [
  { id: '2947-5839', type: 'case', customer: 'Amazon.com Inc.',  stage: 'Invoice Retrieval', tasks: 4, status: 'intervention', priority: 'High',   created: 'May 14, 2026 · 09:41', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '4/6', stageDesc: 'Retrieving invoice documents from vendor portals',      assists: [{label:'Credentials',count:2},{label:'Authorize'},{label:'Compare'}],   team: 'Analytics Team',  assignTo: 'Sarah Johnson'  },
  { id: '2947-3214', type: 'case', customer: 'Walmart Inc.',      stage: 'AP Matching',       tasks: 3, status: 'running',      priority: 'High',   created: 'May 14, 2026 · 11:05', category: 'Price Discrepancy',caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '2/5', stageDesc: 'Matching invoices against AP ledger records',            assists: [{label:'Captcha'}],                                                     team: 'Deductions Team', assignTo: 'Ahmed Arah'     },
  { id: '3212-2345', type: 'case', customer: 'Coca-Cola',         stage: 'Document Review',   tasks: 6, status: 'running',      priority: 'High',   created: 'May 13, 2026 · 14:22', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '3/7', stageDesc: 'Processing and reviewing document batch',               assists: [{label:'Credentials'},{label:'Compare'},{label:'Authorize'}],           team: 'OCR Team',        assignTo: 'Michael Nguyen' },
  { id: '1233-9845', type: 'case', customer: 'Amazon.com Inc.',  stage: 'OCR Processing',    tasks: 1, status: 'running',      priority: 'High',   created: 'May 13, 2026 · 16:48', category: 'Tax/Freight',      caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '4/4', stageDesc: 'Running OCR batch on document queue',                  assists: [{label:'Credentials'},{label:'Comparison'}],                           team: 'OCR Team',        assignTo: 'Priya Nair'    },
  { id: '2337-3312', type: 'case', customer: 'Walmart Inc.',      stage: 'Classification',    tasks: 4, status: 'running',      priority: 'Medium', created: 'May 12, 2026 · 08:30', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '2/6', stageDesc: 'Classifying documents using AI pipeline',               assists: [{label:'Authorize'},{label:'Credentials'}],                             team: 'Analytics Team',  assignTo: 'David Kim'     },
  { id: '5675-5443', type: 'case', customer: 'Coca-Cola',         stage: 'Invoice Retrieval', tasks: 5, status: 'running',      priority: 'Low',    created: 'May 12, 2026 · 10:15', category: 'Price Discrepancy',caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '3/5', stageDesc: 'Retrieving supplementary vendor invoices',              assists: [{label:'Captcha'}],                                                     team: 'Disputes Team',   assignTo: 'Sarah Johnson' },
  { id: '2947-5432', type: 'case', customer: 'Amazon.com Inc.',  stage: 'Document Signing',  tasks: 2, status: 'running',      priority: 'Low',    created: 'May 11, 2026 · 13:00', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '1/6', stageDesc: 'Preparing documents for digital signing',              assists: [{label:'Compare'},{label:'Credentials'}],                               team: 'Compliance Team', assignTo: 'Ahmed Arah'    },
  { id: '4821-1093', type: 'case', customer: 'Walmart Inc.',      stage: 'Comparison',        tasks: 3, status: 'awaiting',     priority: 'Medium', created: 'May 11, 2026 · 15:33', category: 'RTV',              caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '2/5', stageDesc: 'Comparing datasets for cross-portal analysis',         assists: [{label:'Credentials'},{label:'Compare'}],                               team: 'Analytics Team',  assignTo: null            },
  { id: '7734-2201', type: 'case', customer: 'Coca-Cola',         stage: 'AP Review',         tasks: 1, status: 'running',      priority: 'Low',    created: 'May 10, 2026 · 09:20', category: 'Duplicate Billing',caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '3/4', stageDesc: 'Finalizing AP review and preparing submission',         assists: [{label:'Credentials'}],                                                 team: 'Deductions Team', assignTo: 'Michael Nguyen'},
  { id: '6612-8845', type: 'case', customer: 'Amazon.com Inc.',  stage: 'Invoice Retrieval', tasks: 7, status: 'running',      priority: 'High',   created: 'May 10, 2026 · 11:44', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '2/6', stageDesc: 'Large invoice retrieval across vendor portals',        assists: [{label:'Credentials',count:4},{label:'Captcha',count:3}],               team: 'OCR Team',        assignTo: 'Priya Nair'    },
  { id: '3301-7729', type: 'case', customer: 'Walmart Inc.',      stage: 'Document Review',   tasks: 2, status: 'running',      priority: 'Medium', created: 'May 09, 2026 · 14:10', category: 'Price Discrepancy',caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '4/7', stageDesc: 'Quality checking document review batch',               assists: [{label:'Credentials',count:2}],                                         team: 'Analytics Team',  assignTo: 'David Kim'     },
  { id: '9102-4456', type: 'case', customer: 'Coca-Cola',         stage: 'OCR Processing',    tasks: 4, status: 'running',      priority: 'Medium', created: 'May 09, 2026 · 16:55', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '2/4', stageDesc: 'OCR batch processing and validation',                  assists: [{label:'Credentials',count:2},{label:'Authorize',count:2}],             team: 'OCR Team',        assignTo: null            },
  { id: '8803-1124', type: 'case', customer: 'Amazon.com Inc.',  stage: 'Classification',    tasks: 1, status: 'running',      priority: 'Low',    created: 'May 08, 2026 · 08:05', category: 'Tax/Freight',      caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '1/6', stageDesc: 'Running classification batch on document queue',       assists: [{label:'Credentials'}],                                                 team: 'Disputes Team',   assignTo: 'Sarah Johnson' },
  { id: '5541-0032', type: 'case', customer: 'Walmart Inc.',      stage: 'AP Matching',       tasks: 5, status: 'running',      priority: 'High',   created: 'May 08, 2026 · 10:30', category: 'OS&D',             caseType: 'Multiple Validation', subtype: 'No Casualties', stageSteps: '3/5', stageDesc: 'Reconciling invoices against purchase order records', assists: [{label:'Credentials',count:3},{label:'Compare',count:2}],               team: 'Compliance Team', assignTo: 'Ahmed Arah'    },
];

// General tasks — agent assistance requests, not tied to any case
const generalTasksData = [
  { id: 'TASK-001', type: 'task', agent: 'Retriever Agent', agentIcon: 'cloud_download',
    need: 'Login credentials', needIcon: 'key',
    summary: 'Blocked on 3 vendor portals — credentials required to continue retrieval',
    items: ['Global-Tech supplier portal', 'Apex Solutions login', 'DocuVault Pro access'],
    priority: 'High', status: 'failed', createdAt: '2h ago', team: 'Analytics Team',  assignTo: 'Sarah Johnson'  },
  { id: 'TASK-002', type: 'task', agent: 'Retriever Agent', agentIcon: 'cloud_download',
    need: 'Access permission', needIcon: 'lock_open',
    summary: 'Insufficient permissions to read from 2 internal shared drives',
    items: ['Finance / Q1 Invoices (read access)', 'Procurement / PO Archive (read access)'],
    priority: 'High', status: 'failed', createdAt: '3h ago', team: 'Deductions Team', assignTo: 'Ahmed Arah'     },
  { id: 'TASK-003', type: 'task', agent: 'Classifier Agent', agentIcon: 'category',
    need: 'Classification rule', needIcon: 'rule',
    summary: 'Encountered 2 unknown document types with no matching classification rule',
    items: ['Document type: "Customs Declaration Form"', 'Document type: "Multi-party Invoice"'],
    priority: 'Medium', status: 'failed', createdAt: '4h ago', team: 'OCR Team',       assignTo: 'Michael Nguyen'},
  { id: 'TASK-004', type: 'task', agent: 'Classifier Agent', agentIcon: 'category',
    need: 'Human review', needIcon: 'rate_review',
    summary: 'Confidence below threshold on 5 documents — human labelling required',
    items: ['INV-2024-0098 (42% confidence)', 'INV-2024-0102 (38%)', 'PO-887 (29%)', '+ 2 more'],
    priority: 'Medium', status: 'pending', createdAt: '5h ago', team: 'OCR Team',       assignTo: 'Priya Nair'   },
  { id: 'TASK-005', type: 'task', agent: 'Signer Agent', agentIcon: 'draw',
    need: 'Re-authentication', needIcon: 'login',
    summary: 'DocuSign integration token expired — re-auth needed to resume signing queue',
    items: ['DocuSign OAuth token expired', '7 documents awaiting signature'],
    priority: 'High', status: 'failed', createdAt: '6h ago', team: 'Compliance Team', assignTo: 'David Kim'     },
  { id: 'TASK-006', type: 'task', agent: 'Comparer Agent', agentIcon: 'compare',
    need: 'Manual decision', needIcon: 'help',
    summary: 'Detected potential duplicate invoices that require human judgement to resolve',
    items: ['Invoice #2024-441 vs #2024-398 (94% similarity)', 'Invoice #2024-512 vs #2024-489 (88%)'],
    priority: 'Low', status: 'pending', createdAt: '1d ago', team: 'Disputes Team',  assignTo: null            },
];
let activeWorkFeedCase = '2947-5839';

// Per-case Casey stream content (thoughts + final output shown in the AI panel)
const workFeedCaseyContent = {
  '2947-5839': {
    thoughts: [
      'Processed 13/16 documents for this audit.',
      'Retrieved Cloud Services, Hardware, Office Supplies, and Logistics invoices — indexed and parsed.',
      'Global-tech portal requires active session token — pausing retrieval.',
    ],
    output: 'Please provide the login credentials for Global-Tech or manually upload the PDF. Once I have access, I\'ll close the case immediately.',
    contextCards: `
      <div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:7px;border:1px solid #3a3a3a;background:#242424">
        <div style="flex:1"><div style="font-size:12px;font-weight:600;color:#e0e0e0">Invoice #2024-003</div><div style="font-size:10px;color:#666;margin-top:2px">Required: Credential Login · Global-tech</div></div>
        <span data-invoice="2024-003" style="padding:2px 7px;border-radius:10px;background:#7f1d1d;color:#fca5a5;font-size:10px;font-weight:600;white-space:nowrap;flex-shrink:0">Missing</span>
      </div>
      <div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:7px;border:1px solid #3a3a3a;background:#242424">
        <div style="flex:1"><div style="font-size:12px;font-weight:600;color:#e0e0e0">Invoice #2024-0243</div><div style="font-size:10px;color:#666;margin-top:2px">Required: 2FA · Apex Solutions</div></div>
        <span data-invoice="2024-0243" style="padding:2px 7px;border-radius:10px;background:#7f1d1d;color:#fca5a5;font-size:10px;font-weight:600;white-space:nowrap;flex-shrink:0">Missing</span>
      </div>
      <div style="display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:7px;border:1px solid #3a3a3a;background:#242424">
        <div style="flex:1"><div style="font-size:12px;font-weight:600;color:#e0e0e0">Invoice #4574-456</div><div style="font-size:10px;color:#666;margin-top:2px">Required: CAPTCHA · BridgePay</div></div>
        <span data-invoice="4574-456" style="padding:2px 7px;border-radius:10px;background:#7f1d1d;color:#fca5a5;font-size:10px;font-weight:600;white-space:nowrap;flex-shrink:0">Missing</span>
      </div>`,
  },
  '2947-3214': {
    thoughts: [
      'Reconciling AP ledger against 3 vendor statements.',
      'DataBridge, FinanceHub, and TradeFlow all require active session tokens to pull ledger data.',
      'Portal sessions expired — pausing AP matching.',
    ],
    output: 'Three AP system portals require active credentials before I can continue the reconciliation. Please review and approve each login request.',
  },
  '3212-2345': {
    thoughts: [
      'Loaded 23 documents into the review queue.',
      '4 portal access tokens expired — cannot retrieve new document batches.',
      'Customer data incomplete on 2 active submissions — drafting outreach emails.',
    ],
    output: 'I need portal credentials renewed to continue document retrieval, and two customer emails are ready for your approval before I send them.',
  },
  '1233-9845': {
    thoughts: [
      'Submitted 40 documents to the OCR processing queue.',
      'OmniScan Pro session token expired mid-batch.',
      'Pausing queue — awaiting credential refresh.',
    ],
    output: 'OmniScan Pro session expired and needs re-authentication to continue the OCR batch. Please approve the login.',
  },
  '2337-3312': {
    thoughts: [
      'Running classification pipeline on 150 documents.',
      'TaxoFlow and DocClass AI credentials both expired mid-run.',
      'Review portals also blocked — fresh tokens needed for sign-off.',
    ],
    output: 'Four classification system portals need active credentials. I\'ve paused processing until you approve access.',
  },
  '5675-5443': {
    thoughts: [
      'Pulling invoices from 5 vendor portals.',
      'VendorLink, InvoiceHub, and BillTrack hit authentication walls on the first pass.',
      'PayRoute and NetPayroll also require credential refresh for supplementary invoice data.',
    ],
    output: 'Five vendor portals require updated credentials before I can continue invoice retrieval. Please work through the approval queue.',
  },
  '2947-5432': {
    thoughts: [
      'Documents packaged and ready for digital signing.',
      'DocuSign Pro and eSignHub both require re-authentication before accepting submissions.',
      'Signing workflow paused.',
    ],
    output: 'Two signing platform sessions need to be refreshed before I can submit documents for signature. Please approve both.',
  },
  '4821-1093': {
    thoughts: [
      'Preparing comparison datasets from 3 data portals.',
      'DataMatch AI, CompareIQ, and ValidateHub all require active session tokens.',
      'Cannot run the comparison analysis without data access.',
    ],
    output: 'Three data portal credentials need approval before I can run the comparison analysis.',
  },
  '7734-2201': {
    thoughts: [
      'AP review complete — all line items reconciled and validated.',
      'Preparing to push results to APDirect for final approval.',
      'APDirect session token invalidated since last login — pausing submission.',
    ],
    output: 'APDirect needs a fresh login before I can submit the completed AP review. One approval and I\'m done.',
  },
  '6612-8845': {
    thoughts: [
      'Large invoice retrieval batch — 7 vendor portals in scope.',
      '4 primary vendor portals returned authentication errors.',
      '3 payment portals also require fresh credentials for remittance data.',
    ],
    output: 'Seven portals need credentials across two tabs — four vendor portals and three payment systems. Work through each to unblock retrieval.',
  },
  '3301-7729': {
    thoughts: [
      'Review queue loaded — 18 documents pending quality check.',
      'DocReview AI and ReviewNet both require credential refresh to fetch the next batch.',
    ],
    output: 'Two document review systems need their credentials renewed. Please approve both to resume quality checking.',
  },
  '9102-4456': {
    thoughts: [
      'OCR batch paused — 2 scanner systems expired mid-run.',
      'Extracted data cannot be validated without access to the reference portals.',
      '4 authentication requests pending across scanner and validation tabs.',
    ],
    output: 'Two OCR scanner systems and two validation portals need credentials before I can continue processing and verifying the batch.',
  },
  '8803-1124': {
    thoughts: [
      'Classification batch queued — 67 documents ready.',
      'AutoClass Pro requires a fresh session before it will accept the job.',
    ],
    output: 'AutoClass Pro needs re-authentication to accept the classification batch. One quick approval and I can continue.',
  },
  '5541-0032': {
    thoughts: [
      'AP matching batch in progress — comparing invoices against PO records.',
      'MatchPro, ReconcileAI, and LedgerSync all need valid tokens to proceed.',
      'PayableHub and InvoiceMatch also require credentials to push matched results.',
    ],
    output: 'Three matching engines and two AP portals need credentials before I can complete this reconciliation batch.',
  },
};

// Task definitions per case — cases without an entry show empty state
const workFeedTasks = {
  '2947-5839': [
    { id: 'invoice', label: 'Invoice retrieval', count: 3, type: 'auth-credential', icon: 'receipt_long',
      heading: 'Intervention Required: Authentication Needed',
      desc: 'Casey has paused invoice retrieval because vendor portals require active credentials. Review and approve or reject each request below.',
      cards: [
        { vendorLabel: 'Global-tech', vendorKey: 'Global-tech', invoiceId: '2024-003',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'GT',
          desc: 'Allow Genpact to use your username and password with Global-tech on your behalf',
          fields: [{ label: 'Username', type: 'email', value: 'George1985@Walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }],
          investigation: { trigger: 'Session timed out — re-authentication required', reason: 'The Retriever agent authenticated and began navigating the Global-tech invoice portal. After 12 minutes the portal invalidated the session and displayed a "Session Expired" popup, blocking further document access.', agentStep: 'Step 4 of 7 — Fetching invoice download list', screenshotType: 'session-timeout', screenshotMeta: { vendor: 'Global-tech', url: 'portal.global-tech.com/invoices' } } },
        { vendorLabel: 'Apex Solutions', vendorKey: 'Apex Solutions', invoiceId: '2024-0243',
          authType: '2FA authentication', dstClass: 'as', dstInitials: 'AS',
          desc: 'You received an email that provides a 6-digit code you can enter below', otp: true,
          investigation: { trigger: '2FA challenge triggered after credentials accepted', reason: 'The Retriever agent submitted stored Apex Solutions credentials. The portal accepted them but immediately required a 6-digit one-time code sent to the registered email before granting access.', agentStep: 'Step 2 of 5 — Completing portal authentication', screenshotType: '2fa', screenshotMeta: { vendor: 'Apex Solutions', url: 'app.apexsolutions.io/verify' } } },
        { vendorLabel: 'BridgePay', vendorKey: 'BridgePay', invoiceId: '4574-456',
          authType: 'CAPTCHA verification', dstClass: 'bp', dstInitials: 'BP',
          desc: 'BridgePay requires a CAPTCHA to confirm you are not a robot before proceeding', captcha: true,
          investigation: { trigger: 'CAPTCHA wall detected on initial portal access', reason: 'BridgePay detected an automated access pattern from the Retriever agent and presented an image-based CAPTCHA challenge before allowing login. The agent cannot solve image CAPTCHAs autonomously.', agentStep: 'Step 1 of 6 — Initial portal access', screenshotType: 'captcha', screenshotMeta: { vendor: 'BridgePay', url: 'bridgepay.net/login' } } },
      ] },
    { id: 'comparison', label: 'Payment auth.', count: 1, type: 'comparison', icon: 'payments' },
  ],

  '2947-3214': [
    { id: 'ap-portals', label: 'AP portals', count: 3, type: 'auth-credential', icon: 'account_balance',
      heading: 'Intervention Required: AP System Access Needed',
      desc: 'Casey has paused AP matching because three portal systems require active credentials to pull ledger data.',
      cards: [
        { vendorLabel: 'DataBridge Systems', vendorKey: 'DataBridge', invoiceId: 'AP-8812-003',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'DB',
          desc: 'Allow Genpact to access DataBridge on your behalf to pull AP ledger entries',
          fields: [{ label: 'Username', type: 'email', value: 'ap.ops@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'FinanceHub Pro', vendorKey: 'FinanceHub', invoiceId: 'AP-8812-004',
          authType: '2FA authentication', dstClass: 'as', dstInitials: 'FH',
          desc: 'FinanceHub sent a 6-digit code to your registered email — enter it below', otp: true },
        { vendorLabel: 'TradeFlow Connect', vendorKey: 'TradeFlow', invoiceId: 'AP-8812-005',
          authType: 'CAPTCHA verification', dstClass: 'bp', dstInitials: 'TC',
          desc: 'TradeFlow Connect requires human verification before granting API access', captcha: true },
      ] },
  ],

  '3212-2345': [
    { id: 'portal-access', label: 'Portal access', count: 4, type: 'auth-credential', icon: 'folder_open',
      heading: 'Intervention Required: Document Portal Access',
      desc: 'Casey needs access to four document portals to retrieve files for review. Approve each credential request to continue.',
      cards: [
        { vendorLabel: 'DocuVault Pro', vendorKey: 'DocuVault', invoiceId: 'DOC-3301-01',
          authType: 'Account login', dstClass: 'c4', dstInitials: 'DV',
          desc: 'Allow Genpact to access DocuVault Pro on your behalf to retrieve document bundles',
          fields: [{ label: 'Username', type: 'email', value: 'docs@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'FileBridge', vendorKey: 'FileBridge', invoiceId: 'DOC-3301-02',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'FB',
          desc: 'Allow Genpact to log into FileBridge to download contract attachments',
          fields: [{ label: 'Email', type: 'email', value: 'filebridge@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'CloudDocs', vendorKey: 'CloudDocs', invoiceId: 'DOC-3301-03',
          authType: '2FA authentication', dstClass: 'c5', dstInitials: 'CD',
          desc: 'CloudDocs sent a verification code to your registered mobile number', otp: true },
        { vendorLabel: 'SecureSign', vendorKey: 'SecureSign', invoiceId: 'DOC-3301-04',
          authType: 'CAPTCHA verification', dstClass: 'c6', dstInitials: 'SS',
          desc: 'SecureSign requires CAPTCHA verification before granting document access', captcha: true },
      ] },
    { id: 'customer-emails', label: 'Customer emails', count: 2, type: 'email-approval', icon: 'mail',
      heading: 'Review Required: Outbound Customer Emails',
      desc: 'The Communicator has drafted emails to customers with missing data. Review each email, make any edits, then approve to send.',
      emails: [
        { customerName: 'Michael Torres', customerEmail: 'm.torres@corpclient.com',
          avatarInitials: 'MT', avatarColor: 'ea1', caseRef: '3212-2345',
          subject: 'Action Required: Missing Information — Case #3212-2345',
          missingFields: ['PO Reference Number', 'Vendor contact email', 'Invoice approval date'],
          bodyText: `Dear Michael,

I'm reaching out regarding your pending case #3212-2345 currently in Document Review.

While processing your submission, we were unable to locate the following required items:
  · PO Reference Number
  · Vendor contact email
  · Invoice approval date

Could you please provide the above information at your earliest convenience? Once received, our team can resume processing without further delay.

If you have any questions, please don't hesitate to reply to this message.

Best regards,
Casey
Genpact Document Processing` },
        { customerName: 'Sarah Chen', customerEmail: 's.chen@corpclient.com',
          avatarInitials: 'SC', avatarColor: 'ea2', caseRef: '3212-2345',
          subject: 'Follow-up: Outstanding Documents — Case #3212-2345',
          missingFields: ['Authorized signatory signature', 'Cost center code'],
          bodyText: `Dear Sarah,

Following up on case #3212-2345 — your document submission is currently on hold pending review.

The following details are still outstanding:
  · Authorized signatory signature
  · Cost center allocation code

To avoid any delays, please submit the missing information by replying to this email or uploading directly to the portal.

Thank you for your prompt attention.

Best regards,
Casey
Genpact Document Processing` },
      ] },
  ],

  '1233-9845': [
    { id: 'ocr-system', label: 'OCR system', count: 1, type: 'auth-credential', icon: 'document_scanner',
      heading: 'Intervention Required: OCR Platform Login',
      desc: 'Casey needs to submit documents for OCR processing but OmniScan Pro is requesting fresh authentication.',
      cards: [
        { vendorLabel: 'OmniScan Pro', vendorKey: 'OmniScan', invoiceId: 'OCR-5521-01',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'OS',
          desc: 'Allow Genpact to access OmniScan Pro to submit documents for optical character recognition',
          fields: [{ label: 'Username', type: 'email', value: 'ocr.ops@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
      ] },
  ],

  '2337-3312': [
    { id: 'classifier-access', label: 'Classifier access', count: 2, type: 'auth-credential', icon: 'category',
      heading: 'Intervention Required: Classification System Login',
      desc: 'Casey has paused document classification because two systems need valid credentials to proceed.',
      cards: [
        { vendorLabel: 'TaxoFlow', vendorKey: 'TaxoFlow', invoiceId: 'CLS-7741-01',
          authType: 'Account login', dstClass: 'c4', dstInitials: 'TX',
          desc: 'Allow Genpact to access TaxoFlow to apply classification rules to pending documents',
          fields: [{ label: 'Username', type: 'email', value: 'classify@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'DocClass AI', vendorKey: 'DocClass', invoiceId: 'CLS-7741-02',
          authType: '2FA authentication', dstClass: 'as', dstInitials: 'DC',
          desc: 'DocClass AI sent a 6-digit verification code to your registered email', otp: true },
      ] },
    { id: 'review-portal', label: 'Review portal', count: 2, type: 'auth-credential', icon: 'rate_review',
      heading: 'Intervention Required: Review Portal Authentication',
      desc: 'Casey needs human sign-off on classification outputs but the review portals require fresh credentials.',
      cards: [
        { vendorLabel: 'ReviewSphere', vendorKey: 'ReviewSphere', invoiceId: 'CLS-7741-03',
          authType: 'Account login', dstClass: 'c6', dstInitials: 'RS',
          desc: 'Allow Genpact to log into ReviewSphere to submit classification results for review',
          fields: [{ label: 'Email', type: 'email', value: 'review@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'ApprovalHub', vendorKey: 'ApprovalHub', invoiceId: 'CLS-7741-04',
          authType: 'CAPTCHA verification', dstClass: 'bp', dstInitials: 'AH',
          desc: 'ApprovalHub requires CAPTCHA verification before accepting classification submissions', captcha: true },
      ] },
  ],

  '5675-5443': [
    { id: 'vendor-portals', label: 'Vendor portals', count: 3, type: 'auth-credential', icon: 'receipt_long',
      heading: 'Intervention Required: Vendor Portal Authentication',
      desc: 'Casey has paused invoice retrieval — three vendor portals require active credentials before documents can be fetched.',
      cards: [
        { vendorLabel: 'VendorLink Pro', vendorKey: 'VendorLink', invoiceId: 'INV-6612-01',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'VL',
          desc: 'Allow Genpact to access VendorLink Pro on your behalf to retrieve outstanding invoices',
          fields: [{ label: 'Username', type: 'email', value: 'vendor@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'InvoiceHub', vendorKey: 'InvoiceHub', invoiceId: 'INV-6612-02',
          authType: '2FA authentication', dstClass: 'c5', dstInitials: 'IH',
          desc: 'InvoiceHub sent a 6-digit code to your registered phone number', otp: true },
        { vendorLabel: 'BillTrack', vendorKey: 'BillTrack', invoiceId: 'INV-6612-03',
          authType: 'CAPTCHA verification', dstClass: 'c6', dstInitials: 'BT',
          desc: 'BillTrack requires CAPTCHA verification to protect against automated access', captcha: true },
      ] },
    { id: 'secondary-portals', label: 'Secondary portals', count: 2, type: 'auth-credential', icon: 'cloud_download',
      heading: 'Intervention Required: Secondary Portal Login',
      desc: 'Two additional invoice sources need credentials — these cover supplementary line items not found in primary portals.',
      cards: [
        { vendorLabel: 'PayRoute', vendorKey: 'PayRoute', invoiceId: 'INV-6612-04',
          authType: 'Account login', dstClass: 'as', dstInitials: 'PR',
          desc: 'Allow Genpact to access PayRoute to pull supplementary invoice records',
          fields: [{ label: 'Username', type: 'email', value: 'payroute@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'NetPayroll', vendorKey: 'NetPayroll', invoiceId: 'INV-6612-05',
          authType: 'Account login', dstClass: 'c7', dstInitials: 'NP',
          desc: 'Allow Genpact to retrieve reimbursable invoices from NetPayroll on your behalf',
          fields: [{ label: 'Email', type: 'email', value: 'netpayroll@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
      ] },
  ],

  '2947-5432': [
    { id: 'signing-portals', label: 'Signing portals', count: 2, type: 'auth-credential', icon: 'draw',
      heading: 'Intervention Required: Document Signing Authentication',
      desc: 'Casey needs to submit documents for digital signing but both signing platforms require active credentials.',
      cards: [
        { vendorLabel: 'DocuSign Pro', vendorKey: 'DocuSign', invoiceId: 'SGN-4490-01',
          authType: 'Account login', dstClass: 'c4', dstInitials: 'DS',
          desc: 'Allow Genpact to submit documents for signing via DocuSign Pro on your behalf',
          fields: [{ label: 'Email', type: 'email', value: 'signing@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'eSignHub', vendorKey: 'eSignHub', invoiceId: 'SGN-4490-02',
          authType: '2FA authentication', dstClass: 'gt', dstInitials: 'EH',
          desc: 'eSignHub sent a verification code to your registered email address', otp: true },
      ] },
  ],

  '4821-1093': [
    { id: 'data-portals', label: 'Data portals', count: 3, type: 'auth-credential', icon: 'compare_arrows',
      heading: 'Intervention Required: Comparison Tool Access',
      desc: 'Casey needs credentials for three data portals to pull comparison datasets before running the match.',
      cards: [
        { vendorLabel: 'DataMatch AI', vendorKey: 'DataMatch', invoiceId: 'CMP-2211-01',
          authType: 'Account login', dstClass: 'c6', dstInitials: 'DM',
          desc: 'Allow Genpact to access DataMatch AI to retrieve invoice comparison datasets',
          fields: [{ label: 'Username', type: 'email', value: 'datamatch@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'CompareIQ', vendorKey: 'CompareIQ', invoiceId: 'CMP-2211-02',
          authType: '2FA authentication', dstClass: 'as', dstInitials: 'CI',
          desc: 'CompareIQ has sent a 6-digit one-time code to your registered email', otp: true },
        { vendorLabel: 'ValidateHub', vendorKey: 'ValidateHub', invoiceId: 'CMP-2211-03',
          authType: 'CAPTCHA verification', dstClass: 'bp', dstInitials: 'VH',
          desc: 'ValidateHub requires CAPTCHA verification before exposing comparison APIs', captcha: true },
      ] },
  ],

  '7734-2201': [
    { id: 'ap-review-system', label: 'AP review', count: 1, type: 'auth-credential', icon: 'manage_search',
      heading: 'Intervention Required: AP Review System Login',
      desc: 'Casey is ready to push the AP review output but APDirect has invalidated the session token — fresh login required.',
      cards: [
        { vendorLabel: 'APDirect', vendorKey: 'APDirect', invoiceId: 'APR-9901-01',
          authType: 'Account login', dstClass: 'c8', dstInitials: 'AD',
          desc: 'Allow Genpact to access APDirect to submit the completed AP review for approval',
          fields: [{ label: 'Username', type: 'email', value: 'ap.review@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
      ] },
  ],

  '6612-8845': [
    { id: 'vendor-portals', label: 'Vendor portals', count: 4, type: 'auth-credential', icon: 'receipt_long',
      heading: 'Intervention Required: Vendor Portal Authentication',
      desc: 'Casey has encountered authentication walls on four vendor portals during invoice retrieval. Approve each request to continue.',
      cards: [
        { vendorLabel: 'MegaTrade', vendorKey: 'MegaTrade', invoiceId: 'INV-8845-01',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'MT',
          desc: 'Allow Genpact to access MegaTrade portal to download outstanding invoices',
          fields: [{ label: 'Username', type: 'email', value: 'megatrade@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'SkyVendor', vendorKey: 'SkyVendor', invoiceId: 'INV-8845-02',
          authType: 'Account login', dstClass: 'c4', dstInitials: 'SV',
          desc: 'Allow Genpact to retrieve invoices from SkyVendor on your behalf',
          fields: [{ label: 'Email', type: 'email', value: 'skyvendor@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'CorpSupply', vendorKey: 'CorpSupply', invoiceId: 'INV-8845-03',
          authType: '2FA authentication', dstClass: 'as', dstInitials: 'CS',
          desc: 'CorpSupply sent a 6-digit one-time code to your registered email address', otp: true },
        { vendorLabel: 'GlobalSource', vendorKey: 'GlobalSource', invoiceId: 'INV-8845-04',
          authType: 'CAPTCHA verification', dstClass: 'c5', dstInitials: 'GS',
          desc: 'GlobalSource requires CAPTCHA verification before granting invoice access', captcha: true },
      ] },
    { id: 'payment-portals', label: 'Payment portals', count: 3, type: 'auth-credential', icon: 'payments',
      heading: 'Intervention Required: Payment System Authentication',
      desc: 'Three payment clearance portals require valid credentials before Casey can pull remittance data.',
      cards: [
        { vendorLabel: 'PayStream', vendorKey: 'PayStream', invoiceId: 'INV-8845-05',
          authType: 'Account login', dstClass: 'bp', dstInitials: 'PS',
          desc: 'Allow Genpact to access PayStream to retrieve remittance confirmations',
          fields: [{ label: 'Username', type: 'email', value: 'paystream@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'ClearPay', vendorKey: 'ClearPay', invoiceId: 'INV-8845-06',
          authType: '2FA authentication', dstClass: 'c6', dstInitials: 'CP',
          desc: 'ClearPay has sent a 6-digit code to your mobile number ending in 4821', otp: true },
        { vendorLabel: 'NetSettle', vendorKey: 'NetSettle', invoiceId: 'INV-8845-07',
          authType: 'Account login', dstClass: 'c7', dstInitials: 'NS',
          desc: 'Allow Genpact to access NetSettle to confirm payment clearance status',
          fields: [{ label: 'Email', type: 'email', value: 'netsettle@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
      ] },
  ],

  '3301-7729': [
    { id: 'review-system', label: 'Review system', count: 2, type: 'auth-credential', icon: 'rate_review',
      heading: 'Intervention Required: Document Review System Login',
      desc: 'Casey needs access to two review systems to load pending documents for quality checking.',
      cards: [
        { vendorLabel: 'DocReview AI', vendorKey: 'DocReview', invoiceId: 'REV-5533-01',
          authType: 'Account login', dstClass: 'c4', dstInitials: 'DR',
          desc: 'Allow Genpact to access DocReview AI to retrieve documents queued for quality review',
          fields: [{ label: 'Username', type: 'email', value: 'docreview@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'ReviewNet', vendorKey: 'ReviewNet', invoiceId: 'REV-5533-02',
          authType: '2FA authentication', dstClass: 'as', dstInitials: 'RN',
          desc: 'ReviewNet sent a 6-digit verification code to your registered email', otp: true },
      ] },
  ],

  '9102-4456': [
    { id: 'scanner-systems', label: 'Scanner systems', count: 2, type: 'auth-credential', icon: 'document_scanner',
      heading: 'Intervention Required: OCR Scanner Login',
      desc: 'Two OCR scanner systems have expired session tokens — fresh authentication is needed to resume processing.',
      cards: [
        { vendorLabel: 'ScanTech Pro', vendorKey: 'ScanTech', invoiceId: 'OCR-3312-01',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'ST',
          desc: 'Allow Genpact to access ScanTech Pro to submit document batches for OCR processing',
          fields: [{ label: 'Username', type: 'email', value: 'scantech@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'OcrDirect', vendorKey: 'OcrDirect', invoiceId: 'OCR-3312-02',
          authType: '2FA authentication', dstClass: 'c5', dstInitials: 'OD',
          desc: 'OcrDirect has sent a verification code to your registered email address', otp: true },
      ] },
    { id: 'validation-portals', label: 'Validation portals', count: 2, type: 'auth-credential', icon: 'verified',
      heading: 'Intervention Required: OCR Validation Portal Authentication',
      desc: 'Casey needs to validate extracted OCR data against two reference portals — both require fresh credentials.',
      cards: [
        { vendorLabel: 'DataVerify', vendorKey: 'DataVerify', invoiceId: 'OCR-3312-03',
          authType: 'Account login', dstClass: 'c6', dstInitials: 'DV',
          desc: 'Allow Genpact to access DataVerify to cross-check OCR output against source records',
          fields: [{ label: 'Email', type: 'email', value: 'dataverify@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'CheckPoint AI', vendorKey: 'CheckPoint', invoiceId: 'OCR-3312-04',
          authType: 'CAPTCHA verification', dstClass: 'bp', dstInitials: 'CK',
          desc: 'CheckPoint AI requires CAPTCHA verification before accepting validation requests', captcha: true },
      ] },
  ],

  '8803-1124': [
    { id: 'classifier', label: 'Classifier', count: 1, type: 'auth-credential', icon: 'category',
      heading: 'Intervention Required: Classification Engine Login',
      desc: 'Casey is ready to run the classification batch but AutoClass Pro requires fresh authentication before accepting jobs.',
      cards: [
        { vendorLabel: 'AutoClass Pro', vendorKey: 'AutoClass', invoiceId: 'CLS-6621-01',
          authType: 'Account login', dstClass: 'c4', dstInitials: 'AC',
          desc: 'Allow Genpact to access AutoClass Pro to submit documents for automated classification',
          fields: [{ label: 'Username', type: 'email', value: 'autoclass@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
      ] },
  ],

  '5541-0032': [
    { id: 'matching-engines', label: 'Matching engines', count: 3, type: 'auth-credential', icon: 'join_inner',
      heading: 'Intervention Required: AP Matching Engine Access',
      desc: 'Casey has stalled on AP matching — three reconciliation engines need valid credentials to pull ledger data.',
      cards: [
        { vendorLabel: 'MatchPro', vendorKey: 'MatchPro', invoiceId: 'APM-1120-01',
          authType: 'Account login', dstClass: 'gt', dstInitials: 'MP',
          desc: 'Allow Genpact to access MatchPro to run invoice-to-PO reconciliation',
          fields: [{ label: 'Username', type: 'email', value: 'matchpro@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'ReconcileAI', vendorKey: 'ReconcileAI', invoiceId: 'APM-1120-02',
          authType: '2FA authentication', dstClass: 'c5', dstInitials: 'RA',
          desc: 'ReconcileAI has sent a 6-digit code to your registered email address', otp: true },
        { vendorLabel: 'LedgerSync', vendorKey: 'LedgerSync', invoiceId: 'APM-1120-03',
          authType: 'CAPTCHA verification', dstClass: 'bp', dstInitials: 'LS',
          desc: 'LedgerSync requires CAPTCHA verification before accepting reconciliation requests', captcha: true },
      ] },
    { id: 'ap-portals', label: 'AP portals', count: 2, type: 'auth-credential', icon: 'account_balance',
      heading: 'Intervention Required: AP Portal Authentication',
      desc: 'Two accounts-payable portals need fresh login tokens before Casey can push matched invoices for approval.',
      cards: [
        { vendorLabel: 'PayableHub', vendorKey: 'PayableHub', invoiceId: 'APM-1120-04',
          authType: 'Account login', dstClass: 'c6', dstInitials: 'PH',
          desc: 'Allow Genpact to access PayableHub to submit matched invoices to the AP approval queue',
          fields: [{ label: 'Email', type: 'email', value: 'payables@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
        { vendorLabel: 'InvoiceMatch', vendorKey: 'InvoiceMatch', invoiceId: 'APM-1120-05',
          authType: 'Account login', dstClass: 'c8', dstInitials: 'IM',
          desc: 'Allow Genpact to access InvoiceMatch to finalize AP matching for this batch',
          fields: [{ label: 'Username', type: 'email', value: 'invoicematch@walmart.com' }, { label: 'Password', type: 'password', value: 'password123' }] },
      ] },
  ],
};
// Tracks which task tab is active per case (populated lazily)
const activeWorkFeedTask = {};

// ─── Deductions Solution Data ────────────────────────────────────────────────
const _deductionWfData = [
  // Eyeball stage (OCR needs human verification)
  { id: 'DED-00124', type: 'case', retailer: 'Walmart Inc.', deductionType: 'OS&D',
    invoiceNo: 'INV-84821', poNo: 'PO-293017', claimDate: '03/15/2024',
    stage: 'Eyeball Review', tasks: 2, status: 'intervention', priority: 'High',
    amount: '$12,450.00', stageSteps: '2/4', subtitle: 'Walmart Inc. · OS&D',
    customerSign: true, carrierSign: true, stc: false, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'OCR data extracted — human verification required', assists: [{label:'Eyeball',count:2}],
    team: 'Deductions Team', assignTo: 'Emily Foster' },
  { id: 'DED-00109', type: 'case', retailer: 'Amazon Retail', deductionType: 'Price Discrepancy',
    invoiceNo: 'INV-72941', poNo: 'PO-881203', claimDate: '03/22/2024',
    stage: 'Eyeball Review', tasks: 1, status: 'intervention', priority: 'High',
    amount: '$5,870.50', stageSteps: '2/4', subtitle: 'Amazon Retail · Price Discrepancy',
    customerSign: true, carrierSign: false, stc: false, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Invoice extraction needs review before validation', assists: [{label:'Eyeball',count:1}],
    team: 'Deductions Team', assignTo: 'Marcus Webb' },
  { id: 'DED-00082', type: 'case', retailer: 'Safeway Inc.', deductionType: 'Tax/Freight Mismatch',
    invoiceNo: 'INV-66120', poNo: 'PO-773910', claimDate: '04/01/2024',
    stage: 'Eyeball Review', tasks: 3, status: 'intervention', priority: 'Medium',
    amount: '$9,250.00', stageSteps: '2/4', subtitle: 'Safeway Inc. · Tax/Freight Mismatch',
    customerSign: false, carrierSign: true, stc: false, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'POD and invoice OCR require verification', assists: [{label:'Eyeball',count:3}],
    team: 'Disputes Team', assignTo: 'Ahmed Arah' },
  // Deduction Validation stage
  { id: 'DED-00118', type: 'case', retailer: 'Target Corporation', deductionType: 'OS&D',
    invoiceNo: 'INV-79302', poNo: 'PO-187445', claimDate: '03/18/2024',
    stage: 'Deduction Validation', tasks: 1, status: 'intervention', priority: 'High',
    amount: '$8,230.50', stageSteps: '3/4', subtitle: 'Target Corporation · OS&D',
    customerSign: true, carrierSign: true, stc: true, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Analyst review required for final determination', assists: [{label:'Validate',count:1}],
    team: 'Deductions Team', assignTo: 'Ben Septer' },
  { id: 'DED-00105', type: 'case', retailer: 'Home Depot', deductionType: 'OS&D',
    invoiceNo: 'INV-71882', poNo: 'PO-229048', claimDate: '03/28/2024',
    stage: 'Deduction Validation', tasks: 1, status: 'intervention', priority: 'High',
    amount: '$19,450.00', stageSteps: '3/4', subtitle: 'Home Depot · OS&D',
    customerSign: true, carrierSign: false, stc: true, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Shortage analysis ready for analyst determination', assists: [{label:'Validate',count:1}],
    team: 'Deductions Team', assignTo: 'Sarah Johnson' },
  { id: 'DED-00088', type: 'case', retailer: 'Publix Super Markets', deductionType: 'Price Discrepancy',
    invoiceNo: 'INV-64509', poNo: 'PO-559820', claimDate: '03/30/2024',
    stage: 'Deduction Validation', tasks: 1, status: 'intervention', priority: 'Medium',
    amount: '$14,100.00', stageSteps: '3/4', subtitle: 'Publix Super Markets · Price Discrepancy',
    customerSign: false, carrierSign: false, stc: true, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Pricing discrepancy validation pending analyst review', assists: [{label:'Validate',count:1}],
    team: 'Disputes Team', assignTo: 'Ben Septer' },
  // Billback stage (approved — notification ready to send)
  { id: 'DED-00113', type: 'case', retailer: 'Costco Wholesale', deductionType: 'OS&D',
    invoiceNo: 'INV-75844', poNo: 'PO-412093', claimDate: '03/20/2024',
    stage: 'Credit Memo / Billback', tasks: 1, status: 'intervention', priority: 'High',
    amount: '$31,200.00', stageSteps: '4/4', subtitle: 'Costco Wholesale · OS&D',
    customerSign: true, carrierSign: true, stc: true, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Deduction approved — credit memo ready to send', assists: [{label:'Credit Memo',count:1}],
    team: 'Deductions Team', assignTo: 'Priya Nair' },
  { id: 'DED-00094', type: 'case', retailer: 'CVS Health', deductionType: 'Duplicate Billing',
    invoiceNo: 'INV-68831', poNo: 'PO-348820', claimDate: '03/25/2024',
    stage: 'Credit Memo / Billback', tasks: 1, status: 'intervention', priority: 'Medium',
    amount: '$6,790.00', stageSteps: '4/4', subtitle: 'CVS Health · Duplicate Billing',
    customerSign: true, carrierSign: true, stc: false, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Approved deduction ready for client notification', assists: [{label:'Credit Memo',count:1}],
    team: 'Compliance Team', assignTo: 'David Kim' },
  { id: 'DED-00076', type: 'case', retailer: "Sam's Club", deductionType: 'RTV',
    invoiceNo: 'INV-59902', poNo: 'PO-280043', claimDate: '04/05/2024',
    stage: 'Credit Memo / Billback', tasks: 1, status: 'awaiting', priority: 'Low',
    amount: '$22,630.00', stageSteps: '4/4', subtitle: "Sam's Club · RTV",
    customerSign: false, carrierSign: true, stc: false, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Awaiting final sign-off before credit memo is sent', assists: [{label:'Credit Memo',count:1}],
    team: 'Disputes Team', assignTo: 'Michael Nguyen' },
  // Document Collection (automated, no HITL yet)
  { id: 'DED-00099', type: 'case', retailer: 'Kroger Co.', deductionType: 'Wrong Product',
    invoiceNo: 'INV-70129', poNo: 'PO-301982', claimDate: '03/26/2024',
    stage: 'Document Collection', tasks: 0, status: 'running', priority: 'Medium',
    amount: '$3,420.00', stageSteps: '1/4', subtitle: 'Kroger Co. · Wrong Product',
    customerSign: false, carrierSign: false, stc: false, caseType: 'Multiple Validation', subtype: 'No Casualties',
    stageDesc: 'Retrieving POD and backup files from vendor portals', assists: [],
    team: 'Analytics Team', assignTo: 'Ben Septer' },
  // ── Global agent tasks (not linked to a specific case) ───────────────────
  { id: 'DED-TASK-001', type: 'task', agent: 'OCR Agent', agentIcon: 'document_scanner',
    need: 'Low confidence fields', needIcon: 'warning',
    summary: '14 invoices flagged below 70% OCR confidence — manual field correction required before validation can proceed',
    items: ['INV-84209 (Walmart Inc.) — 61% confidence', 'INV-77043 (Target Corp.) — 58% confidence', 'INV-91228 (Home Depot) — 64% confidence', 'INV-66120 (Safeway Inc.) — 67% confidence', 'INV-72941 (Amazon Retail) — 59% confidence', 'INV-81034 (Kroger Co.) — 63% confidence', 'INV-88290 (Walgreens) — 55% confidence', 'INV-70129 (CVS Health) — 68% confidence', 'INV-93041 (Publix) — 62% confidence', 'INV-44821 (Costco Wholesale) — 57% confidence', 'INV-58820 (BJ\'s Wholesale) — 66% confidence', 'INV-39102 (Rite Aid) — 64% confidence', 'INV-51847 (Dollar General) — 60% confidence', 'INV-29471 (Target Corp.) — 58% confidence'],
    priority: 'High', status: 'failed', createdAt: '1h ago',
    team: 'OCR Team', assignTo: 'Ben Septer' },
  { id: 'DED-TASK-002', type: 'task', agent: 'Deduction Classifier', agentIcon: 'category',
    need: 'New deduction type', needIcon: 'rule',
    summary: '3 claims submitted with deduction type "Indirect Freight" which has no existing validation rule — rule definition needed',
    items: ['DED-00291 — Albertsons — $4,100.00', 'DED-00304 — Walgreens — $2,870.00', 'DED-00318 — Rite Aid — $1,950.00'],
    priority: 'High', status: 'failed', createdAt: '2h ago',
    team: 'Deductions Team', assignTo: 'Sarah Johnson' },
  { id: 'DED-TASK-003', type: 'task', agent: 'Dispute Agent', agentIcon: 'gavel',
    need: 'Escalation approval', needIcon: 'approval',
    summary: '2 high-value disputes exceed auto-approval threshold ($25K) and require manager sign-off before counter-claim is filed',
    items: ['DED-00211 — Costco Wholesale — $38,400.00', 'DED-00229 — BJ\'s Wholesale — $29,750.00'],
    priority: 'High', status: 'pending', createdAt: '3h ago',
    team: 'Disputes Team', assignTo: 'Ahmed Arah' },
  { id: 'DED-TASK-004', type: 'task', agent: 'POD Retriever', agentIcon: 'cloud_download',
    need: 'Portal credentials', needIcon: 'key',
    summary: 'Blocked on 2 retailer portals — credentials expired or revoked, cannot retrieve proof-of-delivery documents',
    items: ['Kroger Supplier Hub — session expired', 'Albertsons Connect — 403 Forbidden'],
    priority: 'Medium', status: 'failed', createdAt: '4h ago',
    team: 'Compliance Team', assignTo: 'Ben Septer' },
  { id: 'DED-TASK-005', type: 'task', agent: 'Settlement Agent', agentIcon: 'payments',
    need: 'Remittance mapping', needIcon: 'link',
    summary: '9 remittance files received with deduction codes that don\'t map to any internal reason type — requires code table update',
    items: ['Code "FR-441" — unknown (5 occurrences)', 'Code "DM-09B" — unknown (3 occurrences)', 'Code "RP-220" — unknown (1 occurrence)'],
    priority: 'Medium', status: 'pending', createdAt: '5h ago',
    team: 'Analytics Team', assignTo: 'Michael Nguyen' },
];

const _deductionWfTasks = {
  'DED-00124': [
    { id: 'eyeball', label: 'Eyeball', icon: 'visibility', count: 2, type: 'eyeball',
      heading: 'Eyeball Review: OCR Validation Required',
      desc: 'The OCR engine extracted the fields below from the source documents. Verify each value against the original and correct any errors before confirming.',
      docs: [
        { docLabel: 'BOL #64868', docType: 'Bill of Lading', fields: [
          { field: 'Invoice #',      ocr: 'lNV-84821',    verified: 'INV-84821',     flagged: true  },
          { field: 'PO Number',      ocr: 'PO-29301?',    verified: 'PO-293017',     flagged: true  },
          { field: 'Retailer',       ocr: 'Walmart lnc',  verified: 'Walmart Inc.',  flagged: true  },
          { field: 'Claim Date',     ocr: '03/15/2O24',   verified: '03/15/2024',    flagged: true  },
          { field: 'Deduction Type', ocr: 'Shortage',     verified: 'Shortage',      flagged: false },
          { field: 'Claim Amount',   ocr: '$12.450.00',   verified: '$12,450.00',    flagged: true  },
        ],
        form: {
          header: { documentProvider: 'Clorox University Park', bol: '64868', apptNumber: '896821858', freightChargeTerms: 'Prepaid', carrierSign: true, customerSign: false, subjectToCount: false, carrierSignText: 'ROEV', totalPackageQty: 1539, weight: 43852 },
          poRows: [
            { invoiceNumber: 'INV-84821', orderNumber: '2482860202', packageQty: 1539, lbsQty: 41707 },
          ],
          notations: "Driver must report any over, short, damaged or refused product at the time of delivery, by calling 833-220-1766. MABD 01/28/2025",
          handWritten: "Sam's DC 6596. Receiver# 6024 TRL# 64646. PO# 2482860202 PLTS 6. Total Received 430. Damage 1163. Rec'd By 871. Date 16965"
        }},
        { docLabel: 'POD #PD-48211', docType: 'Proof of Delivery', fields: [
          { field: 'Delivery Date',  ocr: '03/14/2024',   verified: '03/14/2024',    flagged: false },
          { field: 'Carrier',        ocr: 'FedEx Frght',  verified: 'FedEx Freight', flagged: true  },
          { field: 'Units Ordered',  ocr: '480',          verified: '480',           flagged: false },
          { field: 'Units Received', ocr: '412',          verified: '412',           flagged: false },
          { field: 'Shortage Units', ocr: '68',           verified: '68',            flagged: false },
        ],
        form: {
          header: { documentProvider: 'FedEx Freight', bol: '48211', apptNumber: '', freightChargeTerms: 'Prepaid', carrierSign: true, customerSign: true, subjectToCount: true, carrierSignText: 'FedEx', totalPackageQty: 480, weight: 12840 },
          poRows: [
            { invoiceNumber: 'INV-84821', orderNumber: '2482860202', packageQty: 412, lbsQty: 11004 },
          ],
          notations: "Delivery confirmed at dock 7. Short 68 units noted at receiving.",
          handWritten: "Received 412 of 480. Short 68 — noted on BOL. Driver: J. Marquez. Dock: 7B."
        }},
      ]
    }
  ],
  'DED-00109': [
    { id: 'eyeball', label: 'Eyeball', icon: 'visibility', count: 1, type: 'eyeball',
      heading: 'Eyeball Review: OCR Validation Required',
      desc: 'Verify the extracted invoice fields below. Correct any values that appear inaccurate before confirming.',
      docs: [
        { docLabel: 'Invoice INV-72941', docType: 'Invoice', fields: [
          { field: 'Invoice #',      ocr: 'INV-72941',    verified: 'INV-72941',     flagged: false },
          { field: 'PO Number',      ocr: 'PO-8812O3',    verified: 'PO-881203',     flagged: true  },
          { field: 'Retailer',       ocr: 'Amazon Retai', verified: 'Amazon Retail', flagged: true  },
          { field: 'Claim Date',     ocr: '03/22/2024',   verified: '03/22/2024',    flagged: false },
          { field: 'Deduction Type', ocr: 'Pricing Err',  verified: 'Pricing Error', flagged: true  },
          { field: 'Claim Amount',   ocr: '$5.870.50',    verified: '$5,870.50',     flagged: true  },
        ],
        form: {
          header: { documentProvider: 'Procter & Gamble', bol: '72941', apptNumber: '440829', freightChargeTerms: 'Prepaid', carrierSign: true, customerSign: false, subjectToCount: false, carrierSignText: 'XPO', totalPackageQty: 840, weight: 22100 },
          poRows: [
            { invoiceNumber: 'INV-72941', orderNumber: 'PO-881203', packageQty: 840, lbsQty: 22100 },
          ],
          notations: "Pricing discrepancy on contract vs. invoice rate. Review Q1 2024 pricing amendment before confirming.",
          handWritten: ""
        }},
      ]
    }
  ],
  'DED-00082': [
    { id: 'eyeball', label: 'Eyeball', icon: 'visibility', count: 3, type: 'eyeball',
      heading: 'Eyeball Review: OCR Validation Required',
      desc: 'Three documents require field verification. Review each extracted value and correct any errors before confirming.',
      docs: [
        { docLabel: 'Invoice INV-66120', docType: 'Invoice', fields: [
          { field: 'Invoice #',      ocr: 'INV-66120',    verified: 'INV-66120',     flagged: false },
          { field: 'PO Number',      ocr: 'PO-77391O',    verified: 'PO-773910',     flagged: true  },
          { field: 'Retailer',       ocr: 'Safeway lnc.', verified: 'Safeway Inc.',  flagged: true  },
          { field: 'Claim Date',     ocr: '04/01/2024',   verified: '04/01/2024',    flagged: false },
          { field: 'Deduction Type', ocr: 'Shortage',     verified: 'Shortage',      flagged: false },
          { field: 'Claim Amount',   ocr: '$9,250.OO',    verified: '$9,250.00',     flagged: true  },
        ],
        form: {
          header: { documentProvider: 'Kimberly-Clark', bol: '66120', apptNumber: '331047', freightChargeTerms: 'Prepaid', carrierSign: true, customerSign: true, subjectToCount: false, carrierSignText: 'ODFL', totalPackageQty: 1200, weight: 31500 },
          poRows: [
            { invoiceNumber: 'INV-66120', orderNumber: 'PO-773910', packageQty: 1200, lbsQty: 31500 },
          ],
          notations: "Shortage claim — 3 pallets short per driver count at destination.",
          handWritten: "Safeway DC. Short 3 pallets. BOL signed short. Driver: R. Torres."
        }},
      ]
    }
  ],
  'DED-00118': [
    { id: 'deduction-validation', label: 'Validate', icon: 'rule', count: 1, type: 'deduction-validation',
      heading: 'Deduction Validation: Analyst Review Required',
      desc: 'Compare the items below against the original shipment order. Approve, dispute, or enter a partial amount to make your determination.',
      case: { retailer: 'Target Corporation', invoiceNo: 'INV-79302', poNo: 'PO-187445', claimAmount: '$8,230.50', deductionType: 'Damage' },
      items: [
        { sku: 'SKU-44821', customerSku: 'C-44821', description: 'Premium Paper Towels 6pk',  ordered: 240,  received: 200, unitPrice: '$18.50', netPrice: '$15.72', discrepancy: 40,  shortage: 28,  damaged: 12, overage: 0, amount: '$740.00'  },
        { sku: 'SKU-38290', customerSku: 'C-38290', description: 'Laundry Detergent 2L',      ordered: 180,  received: 153, unitPrice: '$12.75', netPrice: '$10.84', discrepancy: 27,  shortage: 20,  damaged: 7,  overage: 0, amount: '$344.25'  },
        { sku: 'SKU-52201', customerSku: 'C-52201', description: 'Dish Soap 750ml 3pk',       ordered: 300,  received: 246, unitPrice: '$9.90',  netPrice: '$8.42',  discrepancy: 54,  shortage: 40,  damaged: 14, overage: 0, amount: '$534.60'  },
        { sku: 'SKU-61030', customerSku: 'C-61030', description: 'Baby Wipes 80ct 4pk',       ordered: 400,  received: 354, unitPrice: '$14.20', netPrice: '$12.07', discrepancy: 46,  shortage: 36,  damaged: 10, overage: 0, amount: '$653.20'  },
        { sku: 'SKU-73110', customerSku: 'C-73110', description: 'Hand Soap 500ml 2pk',       ordered: 450,  received: 378, unitPrice: '$8.40',  netPrice: '$7.14',  discrepancy: 72,  shortage: 72,  damaged: 0,  overage: 0, amount: '$604.80',  needsReview: true, agentNote: 'Shortage of 72 units (16%) exceeds the 15% auto-approve threshold. No carrier damage report found for this SKU.' },
        { sku: 'SKU-55402', customerSku: 'C-55402', description: 'Toilet Cleaner 750ml 2pk',  ordered: 320,  received: 240, unitPrice: '$11.25', netPrice: '$9.56',  discrepancy: 80,  shortage: 80,  damaged: 0,  overage: 0, amount: '$900.00',  needsReview: true, agentNote: 'Shortage of 80 units (25%) is unusually high. Historical avg shortage for this SKU is 8%. Possible receiving error or double-claim.' },
        { sku: 'SKU-68103', customerSku: 'C-68103', description: 'Air Freshener 300ml',       ordered: 500,  received: 378, unitPrice: '$6.40',  netPrice: '$5.44',  discrepancy: 122, shortage: 122, damaged: 0,  overage: 0, amount: '$780.80',  needsReview: true, agentNote: 'Highest discrepancy count in this claim (122 units, 24.4%). Cross-reference with POD shows carrier signed off on 498 units.' },
        { sku: 'SKU-77891', customerSku: 'C-77891', description: 'Fabric Softener 1L',        ordered: 260,  received: 202, unitPrice: '$14.80', netPrice: '$12.58', discrepancy: 58,  shortage: 48,  damaged: 10, overage: 0, amount: '$858.40'  },
        { sku: 'SKU-83021', customerSku: 'C-83021', description: 'Sponge Pack 10ct',          ordered: 400,  received: 360, unitPrice: '$3.15',  netPrice: '$2.68',  discrepancy: 40,  shortage: 32,  damaged: 8,  overage: 0, amount: '$126.00'  },
        { sku: 'SKU-29471', customerSku: 'C-29471', description: 'All-Purpose Cleaner 1L',    ordered: 200,  received: 162, unitPrice: '$7.80',  netPrice: '$6.63',  discrepancy: 38,  shortage: 30,  damaged: 8,  overage: 0, amount: '$296.40'  },
      ]
    }
  ],
  'DED-00105': [
    { id: 'deduction-validation', label: 'Validate', icon: 'rule', count: 1, type: 'deduction-validation',
      heading: 'Deduction Validation: Analyst Review Required',
      desc: 'Review the shortage details for this Home Depot shipment. Make your final determination.',
      case: { retailer: 'Home Depot', invoiceNo: 'INV-71882', poNo: 'PO-229048', claimAmount: '$19,450.00', deductionType: 'Shortage' },
      items: [
        { sku: 'SKU-10291', customerSku: 'C-10291', description: 'Lumber 2×4 8ft',            ordered: 800,  received: 612, unitPrice: '$8.50',  netPrice: '$7.22',  discrepancy: 188, shortage: 188, damaged: 0,  overage: 0, amount: '$1,598.00', needsReview: true, agentNote: 'Shortage of 188 units (23.5%) is significantly above normal. Carrier BOL shows 798 units loaded — discrepancy may be at unloading.' },
        { sku: 'SKU-20384', customerSku: 'C-20384', description: 'Drywall Sheet 4×8ft',       ordered: 500,  received: 372, unitPrice: '$12.00', netPrice: '$10.20', discrepancy: 128, shortage: 128, damaged: 0,  overage: 0, amount: '$1,536.00' },
        { sku: 'SKU-30421', customerSku: 'C-30421', description: 'Interior Paint 5gal',       ordered: 200,  received: 148, unitPrice: '$45.00', netPrice: '$38.25', discrepancy: 52,  shortage: 52,  damaged: 0,  overage: 0, amount: '$2,340.00', needsReview: true, agentNote: 'High unit value ($45.00 each) — total disputed amount of $2,340 requires analyst sign-off per policy. No damage photos available.' },
        { sku: 'SKU-40882', customerSku: 'C-40882', description: 'PVC Pipe 10ft',             ordered: 1000, received: 794, unitPrice: '$4.80',  netPrice: '$4.08',  discrepancy: 206, shortage: 206, damaged: 0,  overage: 0, amount: '$988.80'  },
        { sku: 'SKU-55129', customerSku: 'C-55129', description: 'Roofing Nails 5lb',         ordered: 300,  received: 228, unitPrice: '$18.50', netPrice: '$15.72', discrepancy: 72,  shortage: 72,  damaged: 0,  overage: 0, amount: '$1,332.00' },
        { sku: 'SKU-62311', customerSku: 'C-62311', description: 'Concrete Mix 60lb',         ordered: 600,  received: 478, unitPrice: '$8.20',  netPrice: '$6.97',  discrepancy: 122, shortage: 122, damaged: 0,  overage: 0, amount: '$1,000.40' },
        { sku: 'SKU-71820', customerSku: 'C-71820', description: 'Door Hinges 3pk',           ordered: 400,  received: 300, unitPrice: '$12.80', netPrice: '$10.88', discrepancy: 100, shortage: 100, damaged: 0,  overage: 0, amount: '$1,280.00' },
        { sku: 'SKU-84031', customerSku: 'C-84031', description: 'Deck Screws 1lb',           ordered: 1200, received: 940, unitPrice: '$6.40',  netPrice: '$5.44',  discrepancy: 260, shortage: 260, damaged: 0,  overage: 0, amount: '$1,664.00', needsReview: true, agentNote: 'Largest shortage in claim by unit count (260 units, 21.7%). A prior claim for the same SKU against this retailer was disputed in Feb 2024.' },
        { sku: 'SKU-92104', customerSku: 'C-92104', description: 'Window Caulk 10oz',         ordered: 800,  received: 612, unitPrice: '$5.90',  netPrice: '$5.02',  discrepancy: 188, shortage: 188, damaged: 0,  overage: 0, amount: '$1,109.20' },
        { sku: 'SKU-33810', customerSku: 'C-33810', description: 'Electrical Tape 3pk',       ordered: 600,  received: 448, unitPrice: '$7.25',  netPrice: '$6.16',  discrepancy: 152, shortage: 152, damaged: 0,  overage: 0, amount: '$1,102.00' },
      ]
    }
  ],
  'DED-00088': [
    { id: 'deduction-validation', label: 'Validate', icon: 'rule', count: 1, type: 'deduction-validation',
      heading: 'Deduction Validation: Analyst Review Required',
      desc: 'Review the pricing discrepancy below for this Publix order. Verify contract vs. invoice pricing and make your determination.',
      case: { retailer: 'Publix Super Markets', invoiceNo: 'INV-64509', poNo: 'PO-559820', claimAmount: '$14,100.00', deductionType: 'Pricing Error' },
      items: [
        { sku: 'SKU-11042', customerSku: 'C-11042', description: 'Orange Juice 64oz 4pk',     ordered: 480, received: 480, unitPrice: '$8.20',  invPrice: '$6.97',  netPrice: '$6.97',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,440.00' },
        { sku: 'SKU-22183', customerSku: 'C-22183', description: 'Greek Yogurt 32oz',         ordered: 600, received: 600, unitPrice: '$4.50',  invPrice: '$3.83',  netPrice: '$3.83',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,500.00', needsReview: true, agentNote: 'Invoice price ($4.50) does not match contract price ($3.83). Pricing exception detected — contract amendment signed Jan 2024 may not have been applied.' },
        { sku: 'SKU-33204', customerSku: 'C-33204', description: 'Cheese Slices 24ct',        ordered: 360, received: 360, unitPrice: '$6.80',  invPrice: '$5.78',  netPrice: '$5.78',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,440.00' },
        { sku: 'SKU-44315', customerSku: 'C-44315', description: 'Whole Grain Bread',         ordered: 720, received: 720, unitPrice: '$3.90',  invPrice: '$3.32',  netPrice: '$3.32',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,872.00', needsReview: true, agentNote: 'Discrepancy spans 100% of ordered units — full shipment affected. Possible invoice issued at incorrect price tier. Verify pricing agreement for this SKU.' },
        { sku: 'SKU-55426', customerSku: 'C-55426', description: 'Butter 4-sticks',           ordered: 440, received: 440, unitPrice: '$5.75',  invPrice: '$4.89',  netPrice: '$4.89',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,100.00' },
        { sku: 'SKU-66537', customerSku: 'C-66537', description: 'Cream Cheese 8oz',          ordered: 520, received: 520, unitPrice: '$4.20',  invPrice: '$3.57',  netPrice: '$3.57',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,248.00' },
        { sku: 'SKU-77648', customerSku: 'C-77648', description: 'Milk 1gal',                 ordered: 400, received: 400, unitPrice: '$4.10',  invPrice: '$3.49',  netPrice: '$3.49',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,200.00', needsReview: true, agentNote: 'Price delta of $0.61/unit flagged — deduction amount of $1,200 is within dispute range but retailer has a history of over-deducting on this SKU.' },
        { sku: 'SKU-99870', customerSku: 'C-99870', description: 'Eggs 12ct Cage-Free',       ordered: 600, received: 600, unitPrice: '$5.60',  invPrice: '$4.76',  netPrice: '$4.76',  discrepancy: 0, shortage: 0, damaged: 0, overage: 0, amount: '$1,680.00' },
      ]
    }
  ],
  'DED-00113': [
    { id: 'billback', label: 'Credit Memo', icon: 'receipt', count: 1, type: 'billback',
      heading: 'Credit Memo / Billback: Send Deduction Authorization to Client',
      desc: "Review the deduction notification below. Edit if needed, then approve to send to Costco's deductions team.",
      case: { retailer: 'Costco Wholesale', invoiceNo: 'INV-75844', poNo: 'PO-412093', approvedAmount: '$31,200.00', deductionType: 'Shortage' },
      to: 'deductions@costco.com',
      subject: 'Deduction Authorization — DED-00113 — $31,200.00 Approved',
      bodyText: `Dear Costco Wholesale Deductions Team,

We have completed our review of deduction claim DED-00113 submitted against Invoice INV-75844 (PO-412093).

Determination: APPROVED
Approved deduction amount: $31,200.00
Deduction type: Shortage

Our records confirm a shortage of 2,600 units across the referenced shipment. The deduction has been authorized and will be reflected in your next settlement statement within 5 business days.

Reference case DED-00113 in any future correspondence.

Best regards,
Genpact Deductions Processing`
    }
  ],
  'DED-00094': [
    { id: 'billback', label: 'Credit Memo', icon: 'receipt', count: 1, type: 'billback',
      heading: 'Credit Memo / Billback: Send Deduction Authorization to Client',
      desc: 'Review and approve the billback notification to CVS Health.',
      case: { retailer: 'CVS Health', invoiceNo: 'INV-68831', poNo: 'PO-348820', approvedAmount: '$6,790.00', deductionType: 'Shortage' },
      to: 'ap.deductions@cvs.com',
      subject: 'Deduction Authorization — DED-00094 — $6,790.00 Approved',
      bodyText: `Dear CVS Health Accounts Payable,

This confirms our determination on deduction claim DED-00094 for Invoice INV-68831 (PO-348820).

Determination: APPROVED
Approved deduction amount: $6,790.00
Deduction type: Shortage

The credit of $6,790.00 has been approved and will be applied to your account within 5 business days. Reference case DED-00094 in any future correspondence.

Best regards,
Genpact Deductions Processing`
    }
  ],
  'DED-00076': [
    { id: 'billback', label: 'Credit Memo', icon: 'receipt', count: 1, type: 'billback',
      heading: 'Credit Memo / Billback: Send Deduction Authorization to Client',
      desc: "Review and approve the billback notification to Sam's Club.",
      case: { retailer: "Sam's Club", invoiceNo: 'INV-59902', poNo: 'PO-280043', approvedAmount: '$22,630.00', deductionType: 'Damage' },
      to: 'deductions@samsclub.com',
      subject: "Deduction Authorization — DED-00076 — $22,630.00 Partial Approval",
      bodyText: `Dear Sam's Club Deductions Team,

This confirms our determination on deduction claim DED-00076 for Invoice INV-59902 (PO-280043).

Determination: PARTIAL APPROVAL
Approved deduction amount: $22,630.00  (original claim: $24,890.00)
Deduction type: Damage

Items with sufficient damage documentation have been approved. Items lacking photographic or carrier evidence have been excluded. The approved credit will be reflected in your account within 5–7 business days.

Reference case DED-00076 in any future correspondence.

Best regards,
Genpact Deductions Processing`
    }
  ],
  'DED-00139': [
    { id: 'eyeball', label: 'Eyeball', icon: 'visibility', count: 2, type: 'eyeball',
      heading: 'Eyeball Review: OCR Validation Required',
      desc: 'The OCR engine extracted the fields below from the source documents. Verify each value against the original and correct any errors before confirming.',
      docs: [
        { docLabel: 'Invoice INV-91042', docType: 'Invoice', fields: [
          { field: 'Invoice #',      ocr: 'lNV-91042',      verified: 'INV-91042',      flagged: true  },
          { field: 'PO Number',      ocr: 'PO-48821O',      verified: 'PO-488210',      flagged: true  },
          { field: 'Retailer',       ocr: 'Walgreens lnc',  verified: 'Walgreens',      flagged: true  },
          { field: 'Claim Date',     ocr: '04/08/2O24',     verified: '04/08/2024',     flagged: true  },
          { field: 'Deduction Type', ocr: 'OS&D',           verified: 'OS&D',           flagged: false },
          { field: 'Claim Amount',   ocr: '$7.310.00',      verified: '$7,310.00',      flagged: true  },
        ]},
        { docLabel: 'POD #PD-61032', docType: 'Proof of Delivery', fields: [
          { field: 'Delivery Date',  ocr: '04/07/2024',     verified: '04/07/2024',     flagged: false },
          { field: 'Carrier',        ocr: 'UPS Frght',      verified: 'UPS Freight',    flagged: true  },
          { field: 'Units Ordered',  ocr: '620',            verified: '620',            flagged: false },
          { field: 'Units Received', ocr: '541',            verified: '541',            flagged: false },
          { field: 'Shortage Units', ocr: '79',             verified: '79',             flagged: false },
        ]},
      ]
    }
  ],
  'DED-00145': [
    { id: 'deduction-validation', label: 'Validate', icon: 'rule', count: 1, type: 'deduction-validation',
      heading: 'Deduction Validation: Analyst Review Required',
      desc: 'Compare the items below against the original shipment order. Approve, dispute, or enter a partial amount to make your determination.',
      case: { retailer: 'Albertsons', invoiceNo: 'INV-88231', poNo: 'PO-661045', claimAmount: '$11,580.00', deductionType: 'Duplicate Billing' },
      items: [
        { sku: 'SKU-14820', customerSku: 'C-14820', description: 'Organic Milk 1gal',          ordered: 500,  received: 500, unitPrice: '$5.80',  netPrice: '$4.93',  discrepancy: 500, amount: '$870.00'   },
        { sku: 'SKU-25931', customerSku: 'C-25931', description: 'Greek Yogurt 6pk',            ordered: 400,  received: 400, unitPrice: '$9.40',  netPrice: '$7.99',  discrepancy: 400, amount: '$1,280.00', needsReview: true, agentNote: 'Full quantity invoiced twice — duplicate PO reference detected. Cross-check with PO-661045 and PO-661018.' },
        { sku: 'SKU-36042', customerSku: 'C-36042', description: 'Cheddar Cheese 2lb',         ordered: 320,  received: 320, unitPrice: '$7.20',  netPrice: '$6.12',  discrepancy: 320, amount: '$1,382.40' },
        { sku: 'SKU-47153', customerSku: 'C-47153', description: 'Butter Unsalted 4-sticks',   ordered: 480,  received: 480, unitPrice: '$6.50',  netPrice: '$5.53',  discrepancy: 480, amount: '$1,248.00', needsReview: true, agentNote: 'Invoice price matches contract but retailer claims double-billing. Verify against remittance for PO-661018.' },
        { sku: 'SKU-58264', customerSku: 'C-58264', description: 'Cream Cheese 8oz 4pk',       ordered: 300,  received: 300, unitPrice: '$8.90',  netPrice: '$7.57',  discrepancy: 300, amount: '$1,071.00' },
        { sku: 'SKU-69375', customerSku: 'C-69375', description: 'Sour Cream 16oz',            ordered: 360,  received: 360, unitPrice: '$4.30',  netPrice: '$3.66',  discrepancy: 360, amount: '$586.80'  },
        { sku: 'SKU-70486', customerSku: 'C-70486', description: 'Cottage Cheese 24oz',        ordered: 280,  received: 280, unitPrice: '$5.60',  netPrice: '$4.76',  discrepancy: 280, amount: '$532.80'  },
        { sku: 'SKU-81597', customerSku: 'C-81597', description: 'Whipped Cream 15oz',         ordered: 420,  received: 420, unitPrice: '$4.80',  netPrice: '$4.08',  discrepancy: 420, amount: '$806.40'  },
      ]
    }
  ],
  'DED-00099': [
    { id: 'eyeball', label: 'Eyeball', icon: 'visibility', count: 2, type: 'eyeball',
      heading: 'Eyeball Review: OCR Validation Required',
      desc: 'Verify the extracted fields below. Correct any inaccurate values before confirming.',
      docs: [
        { docLabel: 'Invoice INV-70129', docType: 'Invoice', fields: [
          { field: 'Invoice #',      ocr: 'INV-70129',      verified: 'INV-70129',      flagged: false },
          { field: 'PO Number',      ocr: 'PO-3O1982',      verified: 'PO-301982',      flagged: true  },
          { field: 'Retailer',       ocr: 'Kroger Co',      verified: 'Kroger Co.',     flagged: true  },
          { field: 'Claim Date',     ocr: '03/26/2024',     verified: '03/26/2024',     flagged: false },
          { field: 'Deduction Type', ocr: 'Wrong Prodct',   verified: 'Wrong Product',  flagged: true  },
          { field: 'Claim Amount',   ocr: '$3.420.00',      verified: '$3,420.00',      flagged: true  },
        ]},
        { docLabel: 'POD-KR-70129', docType: 'Proof of Delivery', fields: [
          { field: 'BOL Number',         ocr: 'BOL-2024-88471',     verified: 'BOL-2024-88471',     flagged: false },
          { field: 'PRO / Tracking #',   ocr: 'PRO-993-4471-22',    verified: 'PRO-993-4471-22',    flagged: false },
          { field: 'Carrier Name',       ocr: 'XPO Logistcs',       verified: 'XPO Logistics',      flagged: true  },
          { field: 'Ship Date',          ocr: '03/20/2024',         verified: '03/20/2024',         flagged: false },
          { field: 'Delivery Date',      ocr: '03/26/2O24',         verified: '03/26/2024',         flagged: true  },
          { field: 'Ship From',          ocr: 'DC-Nashville TN',    verified: 'DC-Nashville, TN',   flagged: true  },
          { field: 'Ship To',            ocr: 'Kroger DC-Atlanta',  verified: 'Kroger DC — Atlanta',flagged: true  },
          { field: 'PO Number',          ocr: 'PO-301982',          verified: 'PO-301982',          flagged: false },
          { field: 'Invoice #',          ocr: 'INV-70129',          verified: 'INV-70129',          flagged: false },
          { field: 'Total Units',        ocr: '1.440',              verified: '1,440',              flagged: true  },
          { field: 'Total Pallets',      ocr: '12',                 verified: '12',                 flagged: false },
          { field: 'Total Weight (lbs)', ocr: '18.620',             verified: '18,620',             flagged: true  },
          { field: 'Seal Number',        ocr: 'SEAL-4482',          verified: 'SEAL-4482',          flagged: false },
          { field: 'Delivery Signature', ocr: 'J. Hartman',         verified: 'J. Hartman',         flagged: false },
          { field: 'Receiver Notes',     ocr: 'Shortage — 60 units short per physical count at dock', verified: 'Shortage — 60 units short per physical count at dock', flagged: false },
        ]},
      ]
    },
  ],
};

// ─── Deduction inline-table state ────────────────────────────────────────────
const _dedQtyDenominators  = {};  // { caseId: { sku: number } }
const _dedAcceptedItems    = {};  // { caseId: Set<sku> }
const _dedValInputs        = {};  // { caseId: { sku: { validQty, reasoning } } }
const _dedConfirmed        = {};  // { caseId: { sku: boolean } }
const _dedInlinePinned     = {};  // { tableId: Set<colKey> }
const _dedInlineColWidths  = {};  // { tableId: { colKey: number } }
let   _dedResState         = null; // { tableId, colKey, startX, startWidth }
const _dedQtySubmitted     = {};  // { caseId: boolean }
const _wfRowDecisions      = {};  // { caseId: { sku: 'accept'|'dispute' } }

// ─── Deductions My Work data ─────────────────────────────────────────────────
// "Cases I started" — assigned to the current user (Ben Septer)
const _deductionStartedData = [
  { id: 'DED-00124', name: 'Walmart Inc.',        created: '03/15/2024', due: '03/22/2024', tier: 'Enterprise', assignees: ['Ben Septer'],    overflow: 0, status: 'intervention', stage: 'Eyeball Review',           priority: 'High',   fetchedBy: 'Portal',    client: 'OS&D',               reasonType: 'OS&D'               },
  { id: 'DED-00118', name: 'Target Corporation',  created: '03/18/2024', due: '03/25/2024', tier: 'Enterprise', assignees: ['Ben Septer'],    overflow: 0, status: 'intervention', stage: 'Deduction Validation',     priority: 'High',   fetchedBy: 'Portal',    client: 'OS&D',               reasonType: 'OS&D'               },
  { id: 'DED-00113', name: 'Costco Wholesale',    created: '03/20/2024', due: '03/27/2024', tier: 'Enterprise', assignees: ['Ben Septer'],    overflow: 0, status: 'on progress',  stage: 'Credit Memo / Billback',   priority: 'High',   fetchedBy: 'Portal',    client: 'OS&D',               reasonType: 'OS&D'               },
  { id: 'DED-00082', name: 'Safeway Inc.',         created: '04/01/2024', due: '04/08/2024', tier: 'Mid-Market', assignees: ['Ben Septer'],    overflow: 0, status: 'on progress',  stage: 'Eyeball Review',           priority: 'Medium', fetchedBy: 'Portal',    client: 'Tax/Freight Mismatch', reasonType: 'Tax/Freight Mismatch'},
  { id: 'DED-00088', name: 'Publix Super Markets', created: '03/30/2024', due: '04/06/2024', tier: 'Mid-Market', assignees: ['Ben Septer'],    overflow: 0, status: 'awaiting',     stage: 'Deduction Validation',     priority: 'Medium', fetchedBy: 'Portal',    client: 'Price Discrepancy',  reasonType: 'Price Discrepancy'  },
  { id: 'DED-00094', name: 'CVS Health',           created: '03/25/2024', due: '04/01/2024', tier: 'Mid-Market', assignees: ['Ben Septer'],    overflow: 0, status: 'completed',    stage: 'Credit Memo / Billback',   priority: 'Medium', fetchedBy: 'Portal',    client: 'Duplicate Billing',  reasonType: 'Duplicate Billing'  },
];

// "My Team Cases" — assigned to other team members
const _deductionTeamData = [
  { id: 'DED-00109', name: 'Amazon Retail',        created: '03/22/2024', due: '03/29/2024', tier: 'Enterprise', assignees: ['Ahmed Arah'],    overflow: 0, status: 'intervention', stage: 'Eyeball Review',           priority: 'High',   fetchedBy: 'Portal',    client: 'Price Discrepancy',  reasonType: 'Price Discrepancy'  },
  { id: 'DED-00105', name: 'Home Depot',           created: '03/28/2024', due: '04/04/2024', tier: 'Enterprise', assignees: ['Sarah Chen'],    overflow: 0, status: 'on progress',  stage: 'Deduction Validation',     priority: 'High',   fetchedBy: 'Portal',    client: 'OS&D',               reasonType: 'OS&D'               },
  { id: 'DED-00076', name: "Sam's Club",           created: '04/05/2024', due: '04/12/2024', tier: 'Enterprise', assignees: ['Sarah Chen'],    overflow: 0, status: 'awaiting',     stage: 'Credit Memo / Billback',   priority: 'Low',    fetchedBy: 'Portal',    client: 'RTV',                reasonType: 'RTV'                },
  { id: 'DED-00099', name: 'Kroger Co.',           created: '03/26/2024', due: '04/02/2024', tier: 'Mid-Market', assignees: ['Ahmed Arah'],    overflow: 0, status: 'on progress',  stage: 'Document Collection',      priority: 'Medium', fetchedBy: '—',         client: 'Wrong Product',      reasonType: 'Wrong Product'      },
  { id: 'DED-00139', name: 'Walgreens',            created: '04/08/2024', due: '04/15/2024', tier: 'Mid-Market', assignees: ['Michael Torres'], overflow: 0, status: 'intervention', stage: 'Eyeball Review',           priority: 'High',   fetchedBy: 'Portal',    client: 'OS&D',               reasonType: 'OS&D'               },
  { id: 'DED-00145', name: 'Albertsons',           created: '04/10/2024', due: '04/17/2024', tier: 'Mid-Market', assignees: ['Michael Torres'], overflow: 0, status: 'completed',    stage: 'Deduction Validation',     priority: 'Medium', fetchedBy: 'Portal',    client: 'Duplicate Billing',  reasonType: 'Duplicate Billing'  },
];

let wfTableMode = true;
let wfTileMode  = false;
const _wfTableStatuses = {}; // caseId → 'awaiting' | 'agent-taking-care' | 'complete'

function _wfTableStatusHtml(caseId) {
  const s = _wfTableStatuses[caseId] || 'awaiting';
  if (s === 'agent-taking-care') return `<span class="wf-tbl-status wf-tbl-status--agent"><span class="material-symbols-outlined">autorenew</span>Agent taking care</span>`;
  if (s === 'complete')          return `<span class="wf-tbl-status wf-tbl-status--complete"><span class="material-symbols-outlined" style="font-size:12px">check_circle</span>Complete</span>`;
  return `<span class="wf-tbl-status">Awaiting human</span>`;
}

function _updateWfTableStatus(caseId, status) {
  _wfTableStatuses[caseId] = status;
  _wfUpdateKPIs();
  if (!wfTableMode) return;
  const row = document.querySelector(`#wf-tbl-tbody tr[data-case="${caseId}"]`);
  if (row) row.cells[1].innerHTML = _wfTableStatusHtml(caseId);
}

function toggleWfMode(mode) {
  wfTableMode = (mode === 'table');
  wfTileMode  = (mode === 'tile');
  const splitView   = document.getElementById('wf-split-view');
  const tableView   = document.getElementById('wf-table-view');
  const tileView    = document.getElementById('wf-tile-view');
  const feedBtn     = document.getElementById('wf-view-feed');
  const tableBtn    = document.getElementById('wf-view-table');
  const tileBtn     = document.getElementById('wf-view-tile');
  const aiDrawer    = document.getElementById('ai-drawer');
  const groupWrap   = document.getElementById('wf-group-btn')?.closest('.tb-wrap');
  const colsWrap    = document.getElementById('wf-columns-btn')?.closest('.tb-wrap');
  if (splitView)  splitView.style.display = (mode === 'assist') ? '' : 'none';
  if (tableView)  tableView.style.display = wfTableMode ? 'flex' : 'none';
  if (tileView)   tileView.style.display  = wfTileMode  ? 'flex' : 'none';
  const feedPgBar   = document.getElementById('wf-feed-pagination-bar');
  const feedBulkBar = document.getElementById('wf-feed-bulk-bar');
  if (feedPgBar)  feedPgBar.style.display = (mode === 'assist') ? '' : 'none';
  if (feedBulkBar && mode !== 'assist') feedBulkBar.classList.remove('visible');
  if (feedBtn)   feedBtn.classList.toggle('active',   mode === 'assist');
  if (tableBtn)  tableBtn.classList.toggle('active',  mode === 'table');
  if (tileBtn)   tileBtn.classList.toggle('active',   mode === 'tile');
  if (groupWrap) groupWrap.style.display = wfTableMode ? '' : 'none';
  if (colsWrap)  colsWrap.style.display  = wfTableMode ? '' : 'none';
  if (aiDrawer && (wfTableMode || wfTileMode)) aiDrawer.classList.remove('open');
  if (wfTableMode)     { renderWfTableHeader(); renderWorkFeedTable(); }
  else if (wfTileMode) { renderWorkFeedTiles(); }
  else { renderWorkFeedList(); renderWorkFeedSolver(activeWorkFeedCase); renderWorkFeedCasey(activeWorkFeedCase); _renderWfFetchBtn(activeWorkFeedCase); }
}

// ── Work Feed data filter (segmented button — switches the data set, not the view) ──
const _wfDataFilter = 'all'; // Work Feed always shows all assigned cases

// Helper: returns the filtered work feed dataset (all cases + tasks assigned to current user)
const _WF_PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };
// Returns the active WF case list based on current solution
function _activeWfCases() {
  return (typeof activeSolution !== 'undefined' && activeSolution === 'deduction') ? _deductionWfData : workFeedData;
}
// Returns the active WF tasks object based on current solution
function _activeWfTasksObj() {
  return (typeof activeSolution !== 'undefined' && activeSolution === 'deduction') ? _deductionWfTasks : workFeedTasks;
}

function _wfFilteredData() {
  // Deductions solution: cases only (no background agent tasks)
  const isDeduction = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';
  const cases = _activeWfCases();
  const extras = isDeduction ? [] : generalTasksData;
  // Merge cases + tasks, default order: by priority (High → Medium → Low) so they interleave
  let data = [...cases, ...extras].sort((a, b) =>
    (_WF_PRIORITY_ORDER[a.priority] ?? 3) - (_WF_PRIORITY_ORDER[b.priority] ?? 3)
  );
  if (_wfSegFilter === 'on-me') {
    data = data.filter(c => _fetchedCases[c.id] === _currentUser);
  } else if (_wfSegFilter === 'queue') {
    data = data.filter(c => !_fetchedCases[c.id]);
  }
  // 'all' → no segment filter
  if (_wfAvailableOnly) data = data.filter(c => !_fetchedCases[c.id] || _fetchedCases[c.id] === _currentUser);
  // Apply column header filters
  Object.entries(_wfColFilters).forEach(([col, vals]) => {
    if (!vals || vals.size === 0) return;
    data = data.filter(c => vals.has(_getWfCellRawVal(c, col)));
  });
  // Apply field filters (toolbar filter bar)
  wfFilterFields.forEach(f => {
    if (!f.value) return;
    const q = f.value.toLowerCase();
    data = data.filter(c => (c[f.field] != null ? String(c[f.field]) : '').toLowerCase().includes(q));
  });
  return data;
}

// Returns the raw string value for a WF row + column (used by column filters)
function _getWfCellRawVal(c, col) {
  switch (col) {
    case 'type':      return c.type === 'task' ? 'Agent task' : 'Case task';
    case 'id':        return c.id || '';
    case 'status':    return c.type === 'task' ? (c.status || '') : (_wfTableStatuses[c.id] || c.status || 'awaiting');
    case 'assists':   return c.type === 'task' ? (c.need || '') : ((c.assists||[]).map(a=>a.label).join(', ') || '');
    case 'priority':  return c.priority || '';
    case 'stage':     return c.type === 'task' ? (c.agent || '') : (c.stage || '');
    case 'team':      return c.team || '';
    case 'assignTo':  return c.assignTo || '';
    case 'fetchedBy': return _fetchedCases[c.id] || '';
    default:          return '';
  }
}

// Open the column filter popover for a given column th
function _openWfColFilter(th, colKey) {
  if (_wfColFilterOpen === colKey) { _closeWfColFilter(); return; }
  _closeWfColFilter();
  _wfColFilterOpen = colKey;
  // Collect distinct values from full unfiltered dataset
  const isDeduction = typeof activeSolution !== 'undefined' && activeSolution === 'deduction';
  const allData = [..._activeWfCases(), ...(isDeduction ? [] : generalTasksData)];
  const vals = [...new Set(allData.map(c => _getWfCellRawVal(c, colKey)).filter(Boolean))].sort();
  _wfCfpAllVals = vals;
  _wfCfpRender(vals, colKey);
  // Position below th
  const rect = th.getBoundingClientRect();
  const pop  = document.getElementById('wf-col-fpop');
  pop.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
  pop.style.top  = (rect.bottom + 3) + 'px';
  pop.classList.remove('hidden');
  document.getElementById('wf-cfp-search-inp').value = '';
  document.getElementById('wf-cfp-search-inp').focus();
}
function _closeWfColFilter() {
  document.getElementById('wf-col-fpop')?.classList.add('hidden');
  _wfColFilterOpen = null;
}
function _wfCfpRender(vals, colKey) {
  const active = _wfColFilters[colKey] || new Set();
  const list   = document.getElementById('wf-cfp-list');
  if (!vals.length) { list.innerHTML = '<div class="wf-cfp-empty">No values</div>'; return; }
  list.innerHTML = '';
  vals.forEach(v => {
    const label = document.createElement('label');
    label.className = 'wf-cfp-item';
    const cb = document.createElement('input');
    cb.type    = 'checkbox';
    cb.checked = active.has(v);
    cb.addEventListener('change', () => _wfColFilterToggle(colKey, v, cb.checked));
    const txt = document.createElement('span');
    txt.textContent = v;
    label.appendChild(cb);
    label.appendChild(txt);
    list.appendChild(label);
  });
}
function _wfCfpSearch(q) {
  const filtered = q ? _wfCfpAllVals.filter(v => v.toLowerCase().includes(q.toLowerCase())) : _wfCfpAllVals;
  _wfCfpRender(filtered, _wfColFilterOpen);
}
function _wfColFilterToggle(colKey, val, checked) {
  if (!_wfColFilters[colKey]) _wfColFilters[colKey] = new Set();
  if (checked) _wfColFilters[colKey].add(val);
  else         _wfColFilters[colKey].delete(val);
  if (_wfColFilters[colKey].size === 0) delete _wfColFilters[colKey];
  renderWfTableHeader();
  renderWorkFeedTable();
}
function _wfColFilterClear(colKey) {
  delete _wfColFilters[colKey];
  _closeWfColFilter();
  renderWfTableHeader();
  renderWorkFeedTable();
}

function toggleWfAvailFilter() {
  _wfAvailableOnly = !_wfAvailableOnly;
  const chip = document.getElementById('wf-avail-chip');
  if (chip) chip.classList.toggle('active', _wfAvailableOnly);
  renderWorkFeedList();
  if (wfTableMode) renderWorkFeedTable();
}

function setWfSegFilter(val) {
  _wfSegFilter = val;
  ['all', 'on-me', 'queue'].forEach(k => {
    const btn = document.getElementById(`wf-seg-${k}`);
    if (btn) btn.classList.toggle('active', k === val);
  });
  // Team: visible in All + In Queue; Assign to: visible in All only
  if (val === 'all')    { wfHiddenCols.delete('team'); wfHiddenCols.delete('assignTo'); }
  if (val === 'queue')  { wfHiddenCols.delete('team'); wfHiddenCols.add('assignTo'); }
  if (val === 'on-me')  { wfHiddenCols.add('team');    wfHiddenCols.add('assignTo'); }
  _wfCurrentPage = 1;
  _wfUpdateKPIs();
  renderWorkFeedList();
  if (wfTableMode) { renderWfTableHeader(); renderWorkFeedTable(); }
}

// ── WF Bulk actions ───────────────────────────────────────────────────────────
function wfUpdateBulkBar() {
  const allCbs    = document.querySelectorAll('#wf-tbl-tbody .wf-row-cb');
  const checked   = document.querySelectorAll('#wf-tbl-tbody .wf-row-cb:checked');
  const n         = checked.length;
  const bar       = document.getElementById('wf-bulk-bar');
  const cnt       = document.getElementById('wf-bulk-count');
  const sa        = document.getElementById('wf-select-all');
  if (bar) bar.classList.toggle('visible', n > 0);
  if (cnt) cnt.textContent = `${n} selected`;
  if (sa) {
    sa.checked       = n > 0 && n === allCbs.length;
    sa.indeterminate = n > 0 && n < allCbs.length;
  }
  _syncRowCtxState('wf-tbl-tbody');
}
function wfToggleAll(cb) {
  document.querySelectorAll('#wf-tbl-tbody .wf-row-cb').forEach(c => c.checked = cb.checked);
  wfUpdateBulkBar();
}
function wfUnselectAll() {
  document.querySelectorAll('#wf-tbl-tbody .wf-row-cb').forEach(c => c.checked = false);
  const sa = document.getElementById('wf-select-all');
  if (sa) { sa.checked = false; sa.indeterminate = false; }
  wfUpdateBulkBar();
}
function wfBulkFetch() {
  const ids = [...document.querySelectorAll('#wf-tbl-tbody .wf-row-cb:checked')].map(cb => cb.value);
  ids.forEach(id => { if (!_fetchedCases[id]) _fetchedCases[id] = _currentUser; });
  wfUnselectAll();
  renderWorkFeedTable();
  renderWorkFeedList();
}
function wfBulkAssign()      { /* placeholder — open assignee picker for selected rows */ }
function wfBulkReallocate()  { /* placeholder — reallocate selected to team */ }

// ── WF cell dropdown (Team / Assign to) ───────────────────────────────────────
let _wfCellDropTarget = null; // { rowId, col }

function _openWfCellDrop(td, rowId, col) {
  _wfCellDropTarget = { rowId, col };
  const drop = document.getElementById('wf-cell-drop');
  const list = document.getElementById('wf-cell-drop-list');
  if (!drop || !list) return;

  const row = [...workFeedData, ...generalTasksData].find(c => c.id === rowId);
  if (!row) return;

  if (col === 'team') {
    list.innerHTML = TEAMS.map(t => `
      <div class="wf-cell-drop-item ${row.team === t.label ? 'active' : ''}"
           onclick="_wfCellSet('${rowId}','team','${t.label}')">
        <span class="wf-team-pill" style="pointer-events:none">${t.label}</span>
      </div>`).join('');
  } else if (col === 'assignTo') {
    list.innerHTML =
      `<div class="wf-cell-drop-item wf-cell-drop-unassign ${!row.assignTo ? 'active' : ''}"
            onclick="_wfCellSet('${rowId}','assignTo',null)">
         <span style="font-size:18px;width:24px;text-align:center;color:#ccc">—</span> Unassigned
       </div>
       <div class="wf-cell-drop-divider"></div>` +
      _WF_USERS.map(u => `
        <div class="wf-cell-drop-item ${row.assignTo === u ? 'active' : ''}"
             onclick="_wfCellSet('${rowId}','assignTo','${u}')">
          ${_activeUserAvatarHtml(u, 'sm')}
          <span>${u === _currentUser ? u + ' (you)' : u}</span>
        </div>`).join('');
  }

  const rect = td.getBoundingClientRect();
  drop.classList.remove('hidden');
  // Position below the cell, aligned left
  const dropW = 210;
  let left = rect.left;
  if (left + dropW > window.innerWidth - 8) left = window.innerWidth - dropW - 8;
  drop.style.top  = (rect.bottom + 4) + 'px';
  drop.style.left = left + 'px';
}

function _wfCellSet(rowId, col, val) {
  const all = [...workFeedData, ...generalTasksData];
  const row = all.find(c => c.id === rowId);
  if (row) row[col] = val;
  document.getElementById('wf-cell-drop')?.classList.add('hidden');
  _wfCellDropTarget = null;
  if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}

function _closeWfCellDrop() {
  document.getElementById('wf-cell-drop')?.classList.add('hidden');
  _wfCellDropTarget = null;
}

// Close cell dropdown + column filter popover on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#wf-cell-drop')) _closeWfCellDrop();
  if (!e.target.closest('#wf-col-fpop') && !e.target.closest('.wf-th-filter-btn')) _closeWfColFilter();
});

function wfSetDensity(d) {
  const tw = document.querySelector('#wf-table-view .table-wrapper');
  if (tw) {
    tw.classList.toggle('density-compact',  d === 'compact');
    tw.classList.toggle('density-spacious', d === 'spacious');
  }
  ['default','compact','spacious'].forEach(k => {
    document.getElementById(`wf-display-opt-${k}`)?.classList.toggle('active', k === d);
  });
  document.getElementById('wf-display-panel')?.classList.add('hidden');
}

function toggleWfFeedSortPanel() {
  const panel = document.getElementById('wf-feed-sort-panel');
  if (!panel) return;
  const opening = panel.classList.contains('hidden');
  panel.classList.toggle('hidden', !opening);
  if (opening) {
    // Close on outside click
    const close = e => { if (!panel.contains(e.target) && e.target.id !== 'wf-feed-sort-btn') { panel.classList.add('hidden'); document.removeEventListener('click', close); } };
    setTimeout(() => document.addEventListener('click', close), 0);
  }
}
const _WF_FEED_SORT_LABELS = { priority: 'Priority', type: 'Type', status: 'Status' };
const _WF_TYPE_ORDER = { case: 0, task: 1 };
function setWfFeedSort(by) {
  _wfFeedSortBy = by;
  const label = document.getElementById('wf-feed-sort-label');
  if (label) label.textContent = _WF_FEED_SORT_LABELS[by] || by;
  document.getElementById('wf-feed-sort-panel')?.classList.add('hidden');
  renderWorkFeedList();
}

// ── Work Feed Column Management ──────────────────────────────────────────────

function _wfActiveCols() {
  return { order: wfColOrder, hidden: wfHiddenCols, widths: wfColWidths, defs: WF_CASE_COLS,
           sortRules: wfCaseSortRules, pinnedCols: wfCasePinnedCols, frozenCol: wfCaseFrozenCol };
}

// ── WF Toolbar panels ─────────────────────────────────────────────────────────
const _WF_PANELS = ['wf-filter-panel','wf-sort-panel','wf-group-panel','wf-display-panel','wf-columns-panel'];

function wfTogglePanel(panelId) {
  _WF_PANELS.forEach(id => { if (id !== panelId) document.getElementById(id)?.classList.add('hidden'); });
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const opening = panel.classList.contains('hidden');
  panel.classList.toggle('hidden');
  if (opening) {
    if (panelId === 'wf-filter-panel')  { wfRenderFilterPanel();  setTimeout(() => document.getElementById('wf-filter-dp-search')?.focus(), 50); }
    if (panelId === 'wf-sort-panel')    { wfRenderSortPanel();    setTimeout(() => document.getElementById('wf-sort-dp-search')?.focus(), 50); }
    if (panelId === 'wf-group-panel')   { wfRenderGroupPanel(); }
    if (panelId === 'wf-columns-panel') { renderWfColumnsPanel(); setTimeout(() => document.getElementById('wf-cols-dp-search')?.focus(), 50); }
  }
}

// Keep old name working
function wfToggleColumnsPanel() { wfTogglePanel('wf-columns-panel'); }

// ── WF Filter ─────────────────────────────────────────────────────────────────
function wfRenderFilterPanel(search) {
  search = search !== undefined ? search : (document.getElementById('wf-filter-dp-search')?.value || '');
  const { defs } = _wfActiveCols();
  const active = wfFilterFields.map(f => f.field);
  const list = document.getElementById('wf-filter-field-list');
  if (!list) return;
  list.innerHTML = defs
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="event.stopPropagation();wfToggleFilterField('${c.key}')">
        <input type="checkbox" ${active.includes(c.key) ? 'checked' : ''} onclick="event.stopPropagation();wfToggleFilterField('${c.key}')">
        ${c.label}
      </div>`).join('');
}
function wfFilterDpSearch(q) { wfRenderFilterPanel(q); }

function wfToggleFilterField(key) {
  const idx = wfFilterFields.findIndex(f => f.field === key);
  if (idx >= 0) {
    wfFilterFields.splice(idx, 1);
    if (wfActiveFilterPopover === key) wfActiveFilterPopover = null;
  } else {
    wfFilterFields.push({ field: key, value: '' });
    wfActiveFilterPopover = key;
  }
  wfRenderFilterPanel(); wfRenderActiveBar();
  if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfRemoveFilterField(key) {
  wfFilterFields = wfFilterFields.filter(f => f.field !== key);
  if (wfActiveFilterPopover === key) wfActiveFilterPopover = null;
  wfRenderFilterPanel(); wfRenderActiveBar();
  if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfUpdateFilterValue(key, val) {
  const f = wfFilterFields.find(f => f.field === key);
  if (f) { f.value = val; wfRenderActiveBar(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList(); }
}
function wfOpenFilterPopover(key, event) {
  event && event.stopPropagation();
  wfActiveFilterPopover = (wfActiveFilterPopover === key) ? null : key;
  wfRenderActiveBar();
}

// ── WF Sort ───────────────────────────────────────────────────────────────────
function wfRenderSortPanel(search) {
  search = search !== undefined ? search : (document.getElementById('wf-sort-dp-search')?.value || '');
  const { defs } = _wfActiveCols();
  const list = document.getElementById('wf-sort-field-list');
  if (!list) return;
  list.innerHTML = defs
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="wfAddSortRule('${c.key}')">${c.label}</div>`).join('');
}
function wfSortDpSearch(q) { wfRenderSortPanel(q); }

function wfAddSortRule(key) {
  const wfa = _wfActiveCols();
  wfa.sortRules.push({ field: key || '', dir: 'asc' });
  wfSortEditorOpen = true;
  wfTogglePanel('wf-sort-panel');
  wfRenderActiveBar(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfRemoveSortRule(i) {
  const wfa = _wfActiveCols();
  wfa.sortRules.splice(i, 1);
  if (!wfa.sortRules.length) wfSortEditorOpen = false;
  wfRenderActiveBar(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfSetSortField(i, key) {
  _wfActiveCols().sortRules[i].field = key;
  wfRenderActiveBar(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfSetSortDir(i, dir) {
  _wfActiveCols().sortRules[i].dir = dir;
  wfRenderActiveBar(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfClearAllSorts() {
  const wfa = _wfActiveCols();
  wfa.sortRules.length = 0; wfSortEditorOpen = false;
  wfRenderActiveBar(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfResetAll() {
  wfFilterFields = []; wfActiveFilterPopover = null;
  _wfActiveCols().sortRules.length = 0; wfSortEditorOpen = false;
  wfGroupField = null;
  wfRenderFilterPanel(); wfRenderSortPanel();
  wfRenderActiveBar(); renderWfTableHeader();
  if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfToggleSortEditor(event) {
  event && event.stopPropagation();
  wfSortEditorOpen = !wfSortEditorOpen;
  wfRenderActiveBar();
}
function wfSortDragStart(e, idx) { wfSortDragIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
function wfSortDrop(e, toIdx) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (wfSortDragIdx === null || wfSortDragIdx === toIdx) { wfSortDragIdx = null; return; }
  const rules = _wfActiveCols().sortRules;
  const moved = rules.splice(wfSortDragIdx, 1)[0];
  rules.splice(toIdx, 0, moved);
  wfSortDragIdx = null;
  wfRenderActiveBar(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable();
}

// ── WF Group ──────────────────────────────────────────────────────────────────
function wfRenderGroupPanel() {
  const inner = document.getElementById('wf-group-panel-inner');
  if (!inner) return;
  if (!wfGroupField) {
    inner.innerHTML = `<div style="padding:6px 0">
      <input type="text" class="dp-search" id="wf-group-dp-search" placeholder="Group by..." oninput="wfGroupDpSearch(this.value)">
      <div id="wf-group-field-list"></div>
    </div>`;
    wfRenderGroupFieldList();
    setTimeout(() => document.getElementById('wf-group-dp-search')?.focus(), 50);
  } else {
    const { defs } = _wfActiveCols();
    const col = defs.find(c => c.key === wfGroupField);
    inner.innerHTML = `
      <div class="gp-header" style="padding:10px 14px 6px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted)">Group by</span>
        <button class="gp-field-link" onclick="wfOpenGroupPicker(event)" style="font-size:13px;background:none;border:none;cursor:pointer;color:#4555D4;display:flex;align-items:center;gap:2px">
          ${col?.label || wfGroupField}<span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
        </button>
      </div>
      <button class="gp-delete-btn" onclick="wfClearGroup()" style="display:flex;align-items:center;gap:6px;width:100%;padding:8px 14px;border:none;background:none;cursor:pointer;font-size:13px;color:#b91c1c">
        <span class="material-symbols-outlined" style="font-size:15px">delete</span>Delete grouping
      </button>`;
  }
}
function wfRenderGroupFieldList(search) {
  const { defs } = _wfActiveCols();
  const list = document.getElementById('wf-group-field-list');
  if (!list) return;
  list.innerHTML = defs
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="wfSetGroupField('${c.key}')">${c.label}</div>`).join('');
}
function wfGroupDpSearch(q) { wfRenderGroupFieldList(q); }
function wfOpenGroupPicker(event) { event && event.stopPropagation(); wfGroupField = null; wfRenderGroupPanel(); }
function wfSetGroupField(key) {
  wfGroupField = key;
  wfTogglePanel('wf-group-panel');
  wfRenderActiveBar(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}
function wfClearGroup() {
  wfGroupField = null;
  wfTogglePanel('wf-group-panel');
  wfRenderActiveBar(); if (wfTableMode) renderWorkFeedTable(); else renderWorkFeedList();
}

// ── WF Active Bar ─────────────────────────────────────────────────────────────
function wfRenderActiveBar() {
  const bar = document.getElementById('wf-active-bar');
  if (!bar) return;
  const { sortRules, defs } = _wfActiveCols();
  const hasSorts   = sortRules.length > 0;
  const hasGroup   = !!wfGroupField;
  const hasFilters = wfFilterFields.length > 0;
  const hasAny     = hasSorts || hasGroup || hasFilters;
  bar.classList.toggle('hidden', !hasAny);
  document.getElementById('wf-sort-btn')?.classList.toggle('active', hasSorts);
  document.getElementById('wf-group-btn')?.classList.toggle('active', hasGroup);
  document.getElementById('wf-filter-btn')?.classList.toggle('active', hasFilters);
  if (!hasAny) return;

  let html = '';
  if (hasSorts) {
    const r0 = sortRules[0];
    const col0 = defs.find(c => c.key === r0.field);
    const pillLabel = sortRules.length === 1
      ? `${col0?.label || '…'} ${r0.dir === 'asc' ? '↑' : '↓'}`
      : `${sortRules.length} sorts`;
    html += `<button class="sort-pill" onclick="wfToggleSortEditor(event)">
      ${pillLabel}<span class="material-symbols-outlined" style="font-size:14px">${wfSortEditorOpen ? 'expand_less' : 'expand_more'}</span>
    </button>`;
    if (wfSortEditorOpen) {
      html += `<div class="sort-editor" onclick="event.stopPropagation()">
        ${sortRules.map((r, i) => `
          <div class="sort-editor-row" draggable="true"
              ondragstart="wfSortDragStart(event,${i})"
              ondragover="event.preventDefault();this.classList.add('drag-over')"
              ondragleave="this.classList.remove('drag-over')"
              ondrop="wfSortDrop(event,${i})">
            <span class="material-symbols-outlined" style="color:#ccc;font-size:16px;cursor:grab;flex-shrink:0">drag_indicator</span>
            <select onchange="wfSetSortField(${i},this.value)">
              ${!r.field ? `<option value="" disabled selected>Pick a field…</option>` : ''}
              ${defs.map(c => `<option value="${c.key}" ${r.field===c.key?'selected':''}>${c.label}</option>`).join('')}
            </select>
            <select onchange="wfSetSortDir(${i},this.value)">
              <option value="asc" ${r.dir==='asc'?'selected':''}>Ascending</option>
              <option value="desc" ${r.dir==='desc'?'selected':''}>Descending</option>
            </select>
            <button class="remove-sort" onclick="wfRemoveSortRule(${i})">&times;</button>
          </div>`).join('')}
        <button class="dp-add-sort" onclick="wfAddSortRule(null)">+ Add sort</button>
        <div class="dp-divider"></div>
        <button class="dp-delete-btn" onclick="wfClearAllSorts()">
          <span class="material-symbols-outlined" style="font-size:15px">delete</span>Delete sort
        </button>
      </div>`;
    }
  }
  if (hasGroup) {
    const { defs: d } = _wfActiveCols();
    const gcol = d.find(c => c.key === wfGroupField);
    if (hasSorts) html += `<div class="active-bar-section-divider"></div>`;
    html += `<button class="sort-pill" onclick="wfTogglePanel('wf-group-panel');event.stopPropagation()">
      Group: ${gcol?.label || wfGroupField}<span class="material-symbols-outlined" style="font-size:14px">expand_more</span>
    </button>`;
  }
  if ((hasSorts || hasGroup) && hasFilters) html += `<div class="active-bar-section-divider"></div>`;
  wfFilterFields.forEach(f => {
    const { defs: d } = _wfActiveCols();
    const col = d.find(c => c.key === f.field);
    if (!col) return;
    const isEmpty = !f.value;
    const isOpen  = wfActiveFilterPopover === f.field;
    const popoverHtml = isOpen ? `
      <div class="filter-popover" onclick="event.stopPropagation()">
        <div class="fp-header">
          <span>${col.label}</span>
          <button class="fp-contains">contains <span class="material-symbols-outlined">expand_more</span></button>
          <button class="fp-overflow">···</button>
        </div>
        <div class="fp-input-row">
          <input class="fp-input" type="text" placeholder="Type a value..." value="${f.value}"
            oninput="wfUpdateFilterValue('${f.field}', this.value)" autofocus>
          ${f.value ? `<button class="fp-clear" onclick="wfUpdateFilterValue('${f.field}','');wfRenderActiveBar()">&times;</button>` : ''}
        </div>
        <button class="fp-delete" onclick="wfRemoveFilterField('${f.field}')">
          <span class="material-symbols-outlined">delete</span>Delete filter
        </button>
      </div>` : '';
    html += `<div class="filter-pill ${isEmpty ? 'empty' : ''}" onclick="wfOpenFilterPopover('${f.field}', event)">
      ${f.value ? `<span style="color:#888;margin-right:2px">${col.label}:</span>${f.value}` : col.label}
      <button class="pill-x" onclick="event.stopPropagation();wfRemoveFilterField('${f.field}')">&times;</button>
      ${popoverHtml}
    </div>`;
  });
  // Action buttons — always visible when bar is shown
  html += `<button class="filter-bar-add" onclick="wfTogglePanel('wf-filter-panel');event.stopPropagation()">
    <span class="material-symbols-outlined">add</span>Filter
  </button>
  <div class="filter-bar-divider"></div>
  <button class="filter-bar-reset" onclick="wfResetAll()">
    <span class="material-symbols-outlined">refresh</span>Reset
  </button>`;
  bar.innerHTML = html;
  if (wfActiveFilterPopover) {
    const input = bar.querySelector('.fp-input');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
}

function renderWfColumnsPanel(search) {
  const { order, hidden } = _wfActiveCols();
  search = search !== undefined ? search : (document.getElementById('wf-cols-dp-search')?.value || '');
  const q = search.toLowerCase();
  const shownCols    = order.filter(c => !hidden.has(c.key) && (!q || c.label.toLowerCase().includes(q)));
  const hiddenColList = order.filter(c =>  hidden.has(c.key) && (!q || c.label.toLowerCase().includes(q)));
  document.getElementById('wf-shown-count').textContent = order.filter(c => !hidden.has(c.key)).length;
  document.getElementById('wf-shown-cols-list').innerHTML = shownCols.map(c => {
    const realIdx = order.indexOf(c);
    return `<div class="dp-col-item" draggable="true" onclick="event.stopPropagation()"
        ondragstart="wfColDragStart(event,${realIdx})"
        ondragover="wfColDragOver(event,${realIdx})"
        ondragleave="wfColDragLeave(event)"
        ondrop="wfColDrop(event,${realIdx})">
      <span class="material-symbols-outlined drag-handle">drag_indicator</span>
      <span class="col-name">${c.label}</span>
      <button class="dp-eye-btn" onclick="event.stopPropagation();toggleWfColVisibility('${c.key}')">
        <span class="material-symbols-outlined">visibility</span>
      </button>
    </div>`;
  }).join('');
  const hiddenSection = document.getElementById('wf-hidden-section');
  if (hiddenColList.length) {
    hiddenSection.style.display = 'block';
    document.getElementById('wf-hidden-count').textContent = hiddenColList.length;
    document.getElementById('wf-hidden-cols-list').innerHTML = hiddenColList.map(c =>
      `<div class="dp-col-item">
        <span class="material-symbols-outlined drag-handle" style="opacity:0.3">drag_indicator</span>
        <span class="col-name" style="color:#aaa">${c.label}</span>
        <button class="dp-eye-btn" onclick="event.stopPropagation();toggleWfColVisibility('${c.key}')">
          <span class="material-symbols-outlined" style="color:#aaa">visibility_off</span>
        </button>
      </div>`).join('');
  } else {
    hiddenSection.style.display = 'none';
  }
}
function wfColsDpSearch(q) { renderWfColumnsPanel(q); }

function wfColDragStart(e, idx) { wfColDragIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
function wfColDragOver(e, idx) {
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('#wf-shown-cols-list .dp-col-item').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.classList.add('drag-over');
}
function wfColDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function wfColDrop(e, toIdx) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (wfColDragIdx === null || wfColDragIdx === toIdx) { wfColDragIdx = null; return; }
  const { order } = _wfActiveCols();
  const moved = order.splice(wfColDragIdx, 1)[0];
  const adjusted = wfColDragIdx < toIdx ? toIdx - 1 : toIdx;
  order.splice(adjusted, 0, moved);
  wfColDragIdx = null;
  renderWfColumnsPanel();
  renderWfTableHeader();
  if (wfTableMode) renderWorkFeedTable();
}

function toggleWfColVisibility(key) {
  const { hidden } = _wfActiveCols();
  if (hidden.has(key)) hidden.delete(key); else hidden.add(key);
  renderWfColumnsPanel();
  renderWfTableHeader();
  if (wfTableMode) renderWorkFeedTable();
  document.getElementById('wf-columns-btn')?.classList.toggle('active',
    wfHiddenCols.size > 0 || wfTaskHiddenCols.size > 0);
}
function wfHideAllCols() {
  const { order, hidden } = _wfActiveCols();
  order.forEach(c => hidden.add(c.key));
  renderWfColumnsPanel(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable();
  document.getElementById('wf-columns-btn')?.classList.add('active');
}
function wfShowAllCols() {
  const { hidden } = _wfActiveCols();
  hidden.clear();
  renderWfColumnsPanel(); renderWfTableHeader(); if (wfTableMode) renderWorkFeedTable();
  document.getElementById('wf-columns-btn')?.classList.toggle('active', wfHiddenCols.size > 0 || wfTaskHiddenCols.size > 0);
}

function renderWfTableHeader() {
  const thead = document.getElementById('wf-tbl-thead');
  if (!thead) return;
  const { order, hidden, widths, sortRules, pinnedCols } = _wfActiveCols();
  const checkboxTh = document.createElement('th');
  checkboxTh.style.cssText = 'width:36px;min-width:36px;padding:0 8px;text-align:center';
  checkboxTh.innerHTML = `<input type="checkbox" id="wf-select-all" onclick="wfToggleAll(this)">`;
  _buildTableHead(thead, order, hidden, widths, {
    resizeFn:        'startWfColResize',
    sortRules,
    pinnedCols,
    colMenuFn:       'openWfColMenu',
    trailingThStyle: 'width:0;min-width:0;padding:0;border:none',
    checkboxTh,
  });
  // Insert ctx-menu th right after checkbox th
  const wfHeaderTr = thead.querySelector('tr');
  if (wfHeaderTr) {
    const ctxTh = document.createElement('th');
    ctxTh.className = 'col-row-ctx';
    wfHeaderTr.insertBefore(ctxTh, wfHeaderTr.children[1]);
  }
  // Column filter buttons removed — filtering via column context menu instead
}

function applyWfColWidths() {
  const { widths } = _wfActiveCols();
  const thead = document.getElementById('wf-tbl-thead');
  if (!thead) return;
  Object.entries(widths).forEach(([key, width]) => {
    const th = thead.querySelector(`th[data-col="${key}"]`);
    if (th) th.style.width = width + 'px';
  });
}

let _wfResizeState = null;
function startWfColResize(e, key) {
  e.stopPropagation(); e.preventDefault();
  const th = e.currentTarget.closest('th');
  _wfResizeState = { key, startX: e.clientX, startWidth: th.offsetWidth };
  e.currentTarget.classList.add('resizing');
  document.body.classList.add('col-resizing');
  const table = document.getElementById('wf-tbl-thead')?.closest('table');
  const tableRect = table ? table.getBoundingClientRect() : { top: 0, height: window.innerHeight };
  const line = document.getElementById('col-resize-line');
  line.style.top = tableRect.top + 'px';
  line.style.height = tableRect.height + 'px';
  line.style.left = e.clientX + 'px';
  line.classList.add('visible');
  document.addEventListener('mousemove', _onWfColResize);
  document.addEventListener('mouseup', _endWfColResize);
}
function _onWfColResize(e) {
  if (!_wfResizeState) return;
  const newWidth = Math.max(50, _wfResizeState.startWidth + (e.clientX - _wfResizeState.startX));
  const { widths } = _wfActiveCols();
  widths[_wfResizeState.key] = newWidth;
  applyWfColWidths();
  document.getElementById('col-resize-line').style.left = e.clientX + 'px';
}
function _endWfColResize() {
  document.removeEventListener('mousemove', _onWfColResize);
  document.removeEventListener('mouseup', _endWfColResize);
  document.body.classList.remove('col-resizing');
  document.getElementById('col-resize-line').classList.remove('visible');
  document.getElementById('wf-tbl-thead')?.querySelectorAll('.col-resize-handle.resizing').forEach(h => h.classList.remove('resizing'));
  _wfResizeState = null;
}

