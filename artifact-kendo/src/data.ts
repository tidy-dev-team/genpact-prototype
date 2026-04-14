export interface CaseRow {
  id: string;
  name: string;
  created: string;
  due: string;
  tier: string;
  assignees: string[];
  overflow: string;
  status: string;
  stage: string;
  fetchedBy: string;
  client: string;
}

export const assignedData: CaseRow[] = [
  { id: '# 100002', name: '_doronELgraph',      created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Assignee #1', 'Assignee #2'], overflow: '+4', status: 'pending',     stage: 'Intake',         fetchedBy: 'API',     client: 'Acme Corp' },
  { id: '# 100003', name: '[Test] test',          created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Ben Septer'],   overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'TechFlow Inc' },
  { id: '# 100004', name: '_WFmaster',            created: 'Mar 19, 2026', due: 'Mar 19, 2026', tier: 'Tier 2', assignees: ['Ben Septer', 'David Ellis'],  overflow: '+1', status: 'On progress', stage: 'Escalated',      fetchedBy: 'Webhook', client: 'DataSync Ltd' },
  { id: '# 100005', name: 'SN_message',           created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Emily Foster'],               overflow: '',   status: 'Stuck',       stage: 'Pending Review', fetchedBy: 'Import',  client: 'GlobalBank' },
  { id: '# 100006', name: 'SN_message',           created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                 overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'API',     client: 'NovaTech' },
  { id: '# 100007', name: '# _WFmaster',          created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 2', assignees: ["Cara D'Angelo", 'Emily Foster'], overflow: '+2', status: 'pending', stage: 'Review',         fetchedBy: 'Webhook', client: 'Acme Corp' },
  { id: '# 100008', name: '_WFmaster',            created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 3', assignees: ['Ben Septer', 'Ahmed Arah'],   overflow: '+4', status: 'pending',     stage: 'Resolved',       fetchedBy: 'Manual',  client: 'Meridian SA' },
  { id: '# 100009', name: '_doronELgraph',        created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 3', assignees: ['Assignee #1', 'Badge'],       overflow: '+4', status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'TechFlow Inc' },
  { id: '# 100010', name: '_WFmaster',            created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Assignee #2', 'Ahmed Arah'],  overflow: '+4', status: 'On progress', stage: 'Escalated',      fetchedBy: 'Import',  client: 'ClearView Co' },
  { id: '# 100011', name: '_doronELgraph',        created: 'Mar 19, 2026', due: 'Apr 19, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Assignee #2'], overflow: '+4', status: 'pending',   stage: 'Intake',         fetchedBy: 'Webhook', client: 'GlobalBank' },
  { id: '# 100012', name: 'SN_escalation',        created: 'Mar 20, 2026', due: 'Apr 20, 2026', tier: 'Tier 2', assignees: ['Ben Septer'],                 overflow: '',   status: 'pending',     stage: 'Review',         fetchedBy: 'API',     client: 'DataSync Ltd' },
  { id: '# 100013', name: 'WF_review_cycle',      created: 'Mar 20, 2026', due: 'Apr 21, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Nora Vidal'],   overflow: '+1', status: 'On progress', stage: 'Pending Review', fetchedBy: 'Manual',  client: 'NovaTech' },
  { id: '# 100014', name: 'data_sync_job',        created: 'Mar 21, 2026', due: 'Apr 22, 2026', tier: 'Tier 3', assignees: ['Liam Chen'],                  overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Import',  client: 'Acme Corp' },
  { id: '# 100015', name: 'audit_log_export',     created: 'Mar 21, 2026', due: 'Apr 23, 2026', tier: 'Tier 2', assignees: ['Emily Foster', 'Tom Reeves'], overflow: '+2', status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'Meridian SA' },
  { id: '# 100016', name: 'bulk_reassign_v2',     created: 'Mar 22, 2026', due: 'Apr 24, 2026', tier: 'Tier 1', assignees: ['Assignee #1'],                overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'API',     client: 'ClearView Co' },
  { id: '# 100017', name: 'SN_message_v2',        created: 'Mar 22, 2026', due: 'Apr 25, 2026', tier: 'Tier 2', assignees: ["Cara D'Angelo", 'Ben Septer'], overflow: '+3', status: 'On progress', stage: 'Review',        fetchedBy: 'Manual',  client: 'TechFlow Inc' },
  { id: '# 100018', name: '_doronELgraph_v2',     created: 'Mar 23, 2026', due: 'Apr 26, 2026', tier: 'Tier 3', assignees: ['Priya Patel'],                overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Import',  client: 'GlobalBank' },
  { id: '# 100019', name: 'case_merge_tool',      created: 'Mar 23, 2026', due: 'Apr 27, 2026', tier: 'Tier 1', assignees: ['Ahmed Arah', 'Jake Moreno'],  overflow: '+1', status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Webhook', client: 'NovaTech' },
  { id: '# 100020', name: 'intake_form_fix',      created: 'Mar 24, 2026', due: 'Apr 28, 2026', tier: 'Tier 2', assignees: ['Sara Klein'],                 overflow: '',   status: 'pending',     stage: 'Pending Review', fetchedBy: 'API',     client: 'Acme Corp' },
  { id: '# 100021', name: 'priority_escalation',  created: 'Mar 24, 2026', due: 'Apr 29, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Nora Vidal'], overflow: '+2', status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'DataSync Ltd' },
  { id: '# 100022', name: 'WF_template_update',   created: 'Mar 25, 2026', due: 'Apr 30, 2026', tier: 'Tier 3', assignees: ['Liam Chen', 'Ben Septer'],    overflow: '',   status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'Meridian SA' },
  { id: '# 100023', name: 'SN_routing_fix',       created: 'Mar 25, 2026', due: 'May 01, 2026', tier: 'Tier 2', assignees: ['Assignee #2'],                overflow: '',   status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'ClearView Co' },
  { id: '# 100024', name: 'case_dedup_scan',      created: 'Mar 26, 2026', due: 'May 02, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Ahmed Arah'],   overflow: '+4', status: 'On progress', stage: 'Escalated',      fetchedBy: 'API',     client: 'GlobalBank' },
];

export const queueData: CaseRow[] = [
  { id: '# 200451', name: 'DB_migration_v3',    created: 'Mar 22, 2026', due: 'Apr 05, 2026', tier: 'Tier 1', assignees: ['Liam Chen'],                  overflow: '',   status: 'On progress', stage: 'Intake',         fetchedBy: 'API',     client: 'Acme Corp' },
  { id: '# 200452', name: 'API_gateway_fix',     created: 'Mar 24, 2026', due: 'Apr 10, 2026', tier: 'Tier 2', assignees: ['Sara Klein', 'Tom Reeves'],   overflow: '+1', status: 'pending',     stage: 'Review',         fetchedBy: 'Webhook', client: 'TechFlow Inc' },
  { id: '# 200460', name: 'auth_token_rotate',   created: 'Mar 25, 2026', due: 'Apr 02, 2026', tier: 'Tier 1', assignees: ['Nora Vidal'],                 overflow: '',   status: 'Stuck',       stage: 'Escalated',      fetchedBy: 'Manual',  client: 'GlobalBank' },
  { id: '# 200471', name: 'cache_invalidation',  created: 'Mar 20, 2026', due: 'Apr 15, 2026', tier: 'Tier 3', assignees: ['Jake Moreno', 'Priya Patel'], overflow: '+3', status: 'completed',   stage: 'Closed',         fetchedBy: 'Import',  client: 'DataSync Ltd' },
  { id: '# 200489', name: 'SN_webhook_retry',    created: 'Mar 26, 2026', due: 'Apr 12, 2026', tier: 'Tier 2', assignees: ['Ahmed Arah'],                 overflow: '',   status: 'On progress', stage: 'Pending Review', fetchedBy: 'API',     client: 'NovaTech' },
  { id: '# 200503', name: 'log_aggregator',      created: 'Mar 21, 2026', due: 'Apr 08, 2026', tier: 'Tier 1', assignees: ['Emily Foster', 'Ben Septer'], overflow: '+2', status: 'pending',     stage: 'Intake',         fetchedBy: 'Webhook', client: 'Meridian SA' },
  { id: '# 200517', name: 'UI_dashboard_v2',     created: 'Mar 27, 2026', due: 'May 01, 2026', tier: 'Tier 2', assignees: ["Cara D'Angelo"],              overflow: '',   status: 'On progress', stage: 'Review',         fetchedBy: 'Manual',  client: 'ClearView Co' },
  { id: '# 200528', name: 'batch_export_csv',    created: 'Mar 23, 2026', due: 'Apr 20, 2026', tier: 'Tier 3', assignees: ['David Ellis', 'Liam Chen'],   overflow: '',   status: 'pending',     stage: 'Escalated',      fetchedBy: 'Import',  client: 'Acme Corp' },
  { id: '# 200534', name: 'SSO_integration',     created: 'Mar 28, 2026', due: 'Apr 25, 2026', tier: 'Tier 1', assignees: ['Tom Reeves', 'Nora Vidal'],   overflow: '+1', status: 'Stuck',       stage: 'Pending Review', fetchedBy: 'API',     client: 'TechFlow Inc' },
  { id: '# 200541', name: 'perf_monitoring',     created: 'Mar 18, 2026', due: 'Apr 03, 2026', tier: 'Tier 2', assignees: ['Priya Patel', 'Jake Moreno'], overflow: '+2', status: 'completed',   stage: 'Closed',         fetchedBy: 'Webhook', client: 'GlobalBank' },
];
