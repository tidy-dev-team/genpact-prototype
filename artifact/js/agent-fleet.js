// ── Agent Fleet Column Management ────────────────────────────────────────────

function renderAfColumnsPanel(search) {
  search = search !== undefined ? search : (document.getElementById('af-cols-dp-search')?.value || '');
  const q = search.toLowerCase();
  const shownCols     = afColOrder.filter(c => !afHiddenCols.has(c.key) && (!q || c.label.toLowerCase().includes(q)));
  const hiddenColList = afColOrder.filter(c =>  afHiddenCols.has(c.key) && (!q || c.label.toLowerCase().includes(q)));
  document.getElementById('af-shown-count').textContent = afColOrder.filter(c => !afHiddenCols.has(c.key)).length;
  document.getElementById('af-shown-cols-list').innerHTML = shownCols.map(c => {
    const realIdx = afColOrder.indexOf(c);
    return `<div class="dp-col-item" draggable="true" onclick="event.stopPropagation()"
        ondragstart="afColDragStart(event,${realIdx})"
        ondragover="afColDragOver(event,${realIdx})"
        ondragleave="afColDragLeave(event)"
        ondrop="afColDrop(event,${realIdx})">
      <span class="material-symbols-outlined drag-handle">drag_indicator</span>
      <span class="col-name">${c.label}</span>
      <button class="dp-eye-btn" onclick="event.stopPropagation();toggleAfColVisibility('${c.key}')">
        <span class="material-symbols-outlined">visibility</span>
      </button>
    </div>`;
  }).join('');
  const hiddenSection = document.getElementById('af-hidden-section');
  if (hiddenColList.length) {
    hiddenSection.style.display = 'block';
    document.getElementById('af-hidden-count').textContent = hiddenColList.length;
    document.getElementById('af-hidden-cols-list').innerHTML = hiddenColList.map(c =>
      `<div class="dp-col-item">
        <span class="material-symbols-outlined drag-handle" style="opacity:0.3">drag_indicator</span>
        <span class="col-name" style="color:#aaa">${c.label}</span>
        <button class="dp-eye-btn" onclick="event.stopPropagation();toggleAfColVisibility('${c.key}')">
          <span class="material-symbols-outlined" style="color:#aaa">visibility_off</span>
        </button>
      </div>`).join('');
  } else {
    hiddenSection.style.display = 'none';
  }
}
function afColsDpSearch(q) { renderAfColumnsPanel(q); }

function afColDragStart(e, idx) { afColDragIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
function afColDragOver(e, idx) {
  e.preventDefault(); e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('#af-shown-cols-list .dp-col-item').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.classList.add('drag-over');
}
function afColDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
function afColDrop(e, toIdx) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (afColDragIdx === null || afColDragIdx === toIdx) { afColDragIdx = null; return; }
  const moved = afColOrder.splice(afColDragIdx, 1)[0];
  const adjusted = afColDragIdx < toIdx ? toIdx - 1 : toIdx;
  afColOrder.splice(adjusted, 0, moved);
  afColDragIdx = null;
  renderAfColumnsPanel();
  renderAgentFleetTable();
}

function toggleAfColVisibility(key) {
  if (afHiddenCols.has(key)) afHiddenCols.delete(key); else afHiddenCols.add(key);
  renderAfColumnsPanel();
  renderAgentFleetTable();
  document.getElementById('af-columns-btn')?.classList.toggle('active', afHiddenCols.size > 0);
}
function afHideAllCols() {
  AF_COLS.forEach(c => afHiddenCols.add(c.key));
  renderAfColumnsPanel(); renderAgentFleetTable();
  document.getElementById('af-columns-btn')?.classList.add('active');
}
function afShowAllCols() {
  afHiddenCols.clear();
  renderAfColumnsPanel(); renderAgentFleetTable();
  document.getElementById('af-columns-btn')?.classList.remove('active');
}

function applyAfColWidths() {
  const table = document.getElementById('af-table-wrap')?.querySelector('table');
  if (!table) return;
  Object.entries(afColWidths).forEach(([key, width]) => {
    const th = table.querySelector(`thead th[data-col="${key}"]`);
    if (th) th.style.width = width + 'px';
  });
}

let _afResizeState = null;
function startAfColResize(e, key) {
  e.stopPropagation(); e.preventDefault();
  const th = e.currentTarget.closest('th');
  _afResizeState = { key, startX: e.clientX, startWidth: th.offsetWidth };
  e.currentTarget.classList.add('resizing');
  document.body.classList.add('col-resizing');
  const table = document.getElementById('af-table-wrap')?.querySelector('table');
  const tableRect = table ? table.getBoundingClientRect() : { top: 0, height: window.innerHeight };
  const line = document.getElementById('col-resize-line');
  line.style.top = tableRect.top + 'px';
  line.style.height = tableRect.height + 'px';
  line.style.left = e.clientX + 'px';
  line.classList.add('visible');
  document.addEventListener('mousemove', _onAfColResize);
  document.addEventListener('mouseup', _endAfColResize);
}
function _onAfColResize(e) {
  if (!_afResizeState) return;
  const newWidth = Math.max(50, _afResizeState.startWidth + (e.clientX - _afResizeState.startX));
  afColWidths[_afResizeState.key] = newWidth;
  applyAfColWidths();
  document.getElementById('col-resize-line').style.left = e.clientX + 'px';
}
function _endAfColResize() {
  document.removeEventListener('mousemove', _onAfColResize);
  document.removeEventListener('mouseup', _endAfColResize);
  document.body.classList.remove('col-resizing');
  document.getElementById('col-resize-line').classList.remove('visible');
  document.getElementById('af-table-wrap')?.querySelectorAll('.col-resize-handle.resizing').forEach(h => h.classList.remove('resizing'));
  _afResizeState = null;
}

// Cell content renderer for AF table
function _renderAfCellContent(a, key) {
  const rateNum = parseInt(a.successRate);
  const rateColor = rateNum >= 93 ? '#15803d' : rateNum >= 85 ? '#b45309' : '#b91c1c';
  switch (key) {
    case 'type':
      return `<div style="display:flex;align-items:center;gap:8px">
        ${agentDetailData[a.type] ? `<div style="width:22px;height:22px;border-radius:5px;background:linear-gradient(135deg,#7c3aed,#5b21b6);display:flex;align-items:center;justify-content:center;flex-shrink:0"><span class="material-symbols-outlined" style="font-size:12px;color:#fff">${agentDetailData[a.type].icon}</span></div>` : ''}
        <span class="af-type-tag" style="border:none;background:none;padding:0;font-size:13px;font-weight:500;color:var(--text-primary)">${a.type}</span>
      </div>`;
    case 'running':
      return `<span class="af-running-count"><span class="af-status-dot" style="display:inline-block;margin-right:5px"></span>${a.running}</span>`;
    case 'awaiting':
      return a.awaiting > 0
        ? `<span class="af-awaiting-badge">${a.awaiting}</span>`
        : `<span class="af-num" style="color:var(--text-muted)">—</span>`;
    case 'successRate':
      return `<span class="af-rate" style="color:${rateColor};font-weight:600">${a.successRate}</span>`;
    case 'minMax':
      return `<span class="af-rate">${a.minMax}</span>`;
    case 'reason':
      return a.commonReason
        ? `<div class="af-reason-card"><span class="material-symbols-outlined af-reason-icon">warning</span><div class="af-reason-title">${a.commonReason}</div></div>`
        : `<span style="color:var(--text-muted);font-size:13px">—</span>`;
    default: return '';
  }
}

// ── AF Sort ──────────────────────────────────────────────────────────────────
let afSortRules = [];
let afSortEditorOpen = false;
let afSortDragIdx = null;

function afRenderSortPanel(search) {
  search = search !== undefined ? search : (document.getElementById('af-sort-dp-search')?.value || '');
  const list = document.getElementById('af-sort-field-list');
  if (!list) return;
  list.innerHTML = AF_COLS
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="afAddSortRule('${c.key}')">${c.label}</div>`).join('');
}
function afSortDpSearch(q) { afRenderSortPanel(q); }

function afAddSortRule(key) {
  if (key) { afSortRules.push({ field: key, dir: 'asc' }); }
  else     { afSortRules.push({ field: '', dir: 'asc' }); }
  afSortEditorOpen = true;
  afTogglePanel('af-sort-panel'); // close panel
  afRenderActiveBar();
  renderAgentFleetTable();
}
function afRemoveSortRule(i) {
  afSortRules.splice(i, 1);
  if (!afSortRules.length) afSortEditorOpen = false;
  afRenderActiveBar(); renderAgentFleetTable();
}
function afSetSortField(i, key) { afSortRules[i].field = key; afRenderActiveBar(); renderAgentFleetTable(); }
function afSetSortDir(i, dir)   { afSortRules[i].dir = dir;   afRenderActiveBar(); renderAgentFleetTable(); }
function afClearAllSorts() {
  afSortRules = []; afSortEditorOpen = false;
  afRenderActiveBar(); renderAgentFleetTable();
}
function afToggleSortEditor(event) {
  event && event.stopPropagation();
  afSortEditorOpen = !afSortEditorOpen;
  afRenderActiveBar();
}
function afSortDragStart(e, idx) { afSortDragIdx = idx; e.dataTransfer.effectAllowed = 'move'; }
function afSortDrop(e, toIdx) {
  e.preventDefault(); e.currentTarget.classList.remove('drag-over');
  if (afSortDragIdx === null || afSortDragIdx === toIdx) { afSortDragIdx = null; return; }
  const moved = afSortRules.splice(afSortDragIdx, 1)[0];
  afSortRules.splice(toIdx, 0, moved);
  afSortDragIdx = null;
  afRenderActiveBar(); renderAgentFleetTable();
}

// ── AF Group by ───────────────────────────────────────────────────────────────
let afGroupField = null;

function afRenderGroupPanel() {
  const inner = document.getElementById('af-group-panel-inner');
  if (!inner) return;
  if (!afGroupField) {
    inner.innerHTML = `<div style="padding:6px 0">
      <input type="text" class="dp-search" id="af-group-dp-search" placeholder="Group by..." oninput="afGroupDpSearch(this.value)">
      <div id="af-group-field-list"></div>
    </div>`;
    afRenderGroupFieldList();
    setTimeout(() => document.getElementById('af-group-dp-search')?.focus(), 50);
  } else {
    const col = AF_COLS.find(c => c.key === afGroupField);
    inner.innerHTML = `
      <div class="gp-header" style="padding:10px 14px 6px;display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:12px;font-weight:600;color:var(--text-muted)">Group by</span>
        <button class="gp-field-link" onclick="afOpenGroupPicker(event)" style="font-size:13px;background:none;border:none;cursor:pointer;color:#4555D4;display:flex;align-items:center;gap:2px">
          ${col.label}<span class="material-symbols-outlined" style="font-size:14px">chevron_right</span>
        </button>
      </div>
      <button class="gp-delete-btn" onclick="afClearGroup()" style="display:flex;align-items:center;gap:6px;width:100%;padding:8px 14px;border:none;background:none;cursor:pointer;font-size:13px;color:#b91c1c">
        <span class="material-symbols-outlined" style="font-size:15px">delete</span>Delete grouping
      </button>`;
  }
}
function afRenderGroupFieldList(search) {
  const list = document.getElementById('af-group-field-list');
  if (!list) return;
  list.innerHTML = AF_COLS
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="afSetGroupField('${c.key}')">${c.label}</div>`).join('');
}
function afGroupDpSearch(q) { afRenderGroupFieldList(q); }
function afOpenGroupPicker(event) { event && event.stopPropagation(); afGroupField = null; afRenderGroupPanel(); }
function afSetGroupField(key) {
  afGroupField = key;
  afTogglePanel('af-group-panel');
  afRenderActiveBar(); renderAgentFleetTable();
}
function afClearGroup() {
  afGroupField = null;
  afTogglePanel('af-group-panel');
  afRenderActiveBar(); renderAgentFleetTable();
}

function afRenderFilterPanel(search) {
  search = search !== undefined ? search : (document.getElementById('af-filter-dp-search')?.value || '');
  const active = afFilterFields.map(f => f.field);
  const list = document.getElementById('af-filter-field-list');
  if (!list) return;
  list.innerHTML = AF_COLS
    .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
    .map(c => `<div class="dp-item" onclick="event.stopPropagation();afToggleFilterField('${c.key}')">
        <input type="checkbox" ${active.includes(c.key) ? 'checked' : ''} onclick="event.stopPropagation();afToggleFilterField('${c.key}')">
        ${c.label}
      </div>`).join('');
}

function afFilterDpSearch(q) { afRenderFilterPanel(q); }

function afToggleFilterField(key) {
  const idx = afFilterFields.findIndex(f => f.field === key);
  if (idx >= 0) {
    afFilterFields.splice(idx, 1);
    if (afActiveFilterPopover === key) afActiveFilterPopover = null;
  } else {
    afFilterFields.push({ field: key, value: '' });
    afActiveFilterPopover = key;
  }
  afRenderFilterPanel();
  afRenderActiveBar();
  renderAgentFleetTable();
}

function afRemoveFilterField(key) {
  afFilterFields = afFilterFields.filter(f => f.field !== key);
  if (afActiveFilterPopover === key) afActiveFilterPopover = null;
  afRenderFilterPanel();
  afRenderActiveBar();
  renderAgentFleetTable();
}

function afUpdateFilterValue(key, val) {
  const f = afFilterFields.find(f => f.field === key);
  if (f) { f.value = val; afRenderActiveBar(); renderAgentFleetTable(); }
}

function afOpenFilterPopover(key, event) {
  event && event.stopPropagation();
  afActiveFilterPopover = (afActiveFilterPopover === key) ? null : key;
  afRenderActiveBar();
}

function afRenderActiveBar() {
  const bar = document.getElementById('af-active-bar');
  if (!bar) return;
  const hasSorts   = afSortRules.length > 0;
  const hasGroup   = !!afGroupField;
  const hasFilters = afFilterFields.length > 0;
  const hasAny     = hasSorts || hasGroup || hasFilters;
  bar.classList.toggle('hidden', !hasAny);
  if (!hasAny) return;

  // Update toolbar button active states
  document.getElementById('af-sort-btn')?.classList.toggle('active', hasSorts);
  document.getElementById('af-group-btn')?.classList.toggle('active', hasGroup);
  document.getElementById('af-filter-btn')?.classList.toggle('active', hasFilters);

  let html = '';

  // Sort pill
  if (hasSorts) {
    const r0 = afSortRules[0];
    const col0 = AF_COLS.find(c => c.key === r0.field);
    const pillLabel = afSortRules.length === 1
      ? `${col0?.label || '…'} ${r0.dir === 'asc' ? '↑' : '↓'}`
      : `${afSortRules.length} sorts`;
    html += `<button class="sort-pill" onclick="afToggleSortEditor(event)">
      ${pillLabel}
      <span class="material-symbols-outlined" style="font-size:14px">${afSortEditorOpen ? 'expand_less' : 'expand_more'}</span>
    </button>`;
    if (afSortEditorOpen) {
      html += `<div class="sort-editor" onclick="event.stopPropagation()">
        ${afSortRules.map((r, i) => `
          <div class="sort-editor-row" draggable="true"
              ondragstart="afSortDragStart(event,${i})"
              ondragover="event.preventDefault();this.classList.add('drag-over')"
              ondragleave="this.classList.remove('drag-over')"
              ondrop="afSortDrop(event,${i})">
            <span class="material-symbols-outlined" style="color:#ccc;font-size:16px;cursor:grab;flex-shrink:0">drag_indicator</span>
            <select onchange="afSetSortField(${i},this.value)">
              ${!r.field ? `<option value="" disabled selected>Pick a field…</option>` : ''}
              ${AF_COLS.map(c => `<option value="${c.key}" ${r.field===c.key?'selected':''}>${c.label}</option>`).join('')}
            </select>
            <select onchange="afSetSortDir(${i},this.value)">
              <option value="asc" ${r.dir==='asc'?'selected':''}>Ascending</option>
              <option value="desc" ${r.dir==='desc'?'selected':''}>Descending</option>
            </select>
            <button class="remove-sort" onclick="afRemoveSortRule(${i})">&times;</button>
          </div>`).join('')}
        <button class="dp-add-sort" onclick="afAddSortRule(null)">+ Add sort</button>
        <div class="dp-divider"></div>
        <button class="dp-delete-btn" onclick="afClearAllSorts()">
          <span class="material-symbols-outlined" style="font-size:15px">delete</span>Delete sort
        </button>
      </div>`;
    }
  }

  // Group pill
  if (hasGroup) {
    const gcol = AF_COLS.find(c => c.key === afGroupField);
    if (hasSorts) html += `<div class="active-bar-section-divider"></div>`;
    html += `<button class="sort-pill" onclick="afTogglePanel('af-group-panel');event.stopPropagation()">
      Group: ${gcol?.label}
      <span class="material-symbols-outlined" style="font-size:14px">expand_more</span>
    </button>`;
  }

  if ((hasSorts || hasGroup) && hasFilters) html += `<div class="active-bar-section-divider"></div>`;

  afFilterFields.forEach(f => {
    const col = AF_COLS.find(c => c.key === f.field);
    if (!col) return;
    const isEmpty = !f.value;
    const isOpen = afActiveFilterPopover === f.field;
    const popoverHtml = isOpen ? `
      <div class="filter-popover" onclick="event.stopPropagation()">
        <div class="fp-header">
          <span>${col.label}</span>
          <button class="fp-contains">contains <span class="material-symbols-outlined">expand_more</span></button>
          <button class="fp-overflow">···</button>
        </div>
        <div class="fp-input-row">
          <input class="fp-input" type="text" placeholder="Type a value..." value="${f.value}"
            oninput="afUpdateFilterValue('${f.field}', this.value)" autofocus>
          ${f.value ? `<button class="fp-clear" onclick="afUpdateFilterValue('${f.field}','');afRenderActiveBar()">&times;</button>` : ''}
        </div>
        <button class="fp-delete" onclick="afRemoveFilterField('${f.field}')">
          <span class="material-symbols-outlined">delete</span>Delete filter
        </button>
      </div>` : '';
    html += `<div class="filter-pill ${isEmpty ? 'empty' : ''}" onclick="afOpenFilterPopover('${f.field}', event)">
      ${f.value ? `<span style="color:#888;margin-right:2px">${col.label}:</span>${f.value}` : col.label}
      <button class="pill-x" onclick="event.stopPropagation();afRemoveFilterField('${f.field}')">&times;</button>
      ${popoverHtml}
    </div>`;
  });

  html += `<button class="filter-bar-add" onclick="afTogglePanel('af-filter-panel');event.stopPropagation()">
    <span class="material-symbols-outlined">add</span>Filter
  </button>
  <div class="filter-bar-divider"></div>
  <button class="filter-bar-reset" onclick="afResetFilters()">
    <span class="material-symbols-outlined">refresh</span>Reset
  </button>`;
  bar.innerHTML = html;

  if (afActiveFilterPopover) {
    const input = bar.querySelector('.fp-input');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }
}

function afResetFilters() {
  afFilterFields = []; afActiveFilterPopover = null;
  afSortRules = []; afSortEditorOpen = false;
  afGroupField = null;
  afRenderFilterPanel(); afRenderSortPanel();
  afRenderActiveBar(); renderAgentFleetTable();
}

document.addEventListener('click', e => {
  let changed = false;
  if (afActiveFilterPopover && !e.target.closest('#af-active-bar .filter-pill')) {
    afActiveFilterPopover = null; changed = true;
  }
  if (afSortEditorOpen && !e.target.closest('.sort-pill') && !e.target.closest('.sort-editor')) {
    afSortEditorOpen = false; changed = true;
  }
  if (changed) afRenderActiveBar();
});

// Close af panels on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('.tb-wrap') && !e.target.closest('.dropdown-panel')) {
    ['af-filter-panel','af-sort-panel','af-group-panel','af-display-panel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('hidden');
    });
  }
});

// Close WF toolbar panels on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#workfeed-page .tb-wrap') && !e.target.closest('#workfeed-page .dropdown-panel')) {
    _WF_PANELS.forEach(id => document.getElementById(id)?.classList.add('hidden'));
    document.getElementById('wf-view-picker')?.classList.add('hidden');
  }
});

function renderAgentFleetTable() {
  const wrap = document.getElementById('af-table-wrap');
  if (!wrap) return;
  let rows = [...agentData];
  // Apply filters
  afFilterFields.forEach(f => {
    if (!f.value) return;
    const q = f.value.toLowerCase();
    rows = rows.filter(a => {
      const v = (a[f.field] != null ? String(a[f.field]) : '').toLowerCase();
      return v.includes(q);
    });
  });
  // Apply sorts
  if (afSortRules.length) {
    rows.sort((a, b) => {
      for (const r of afSortRules) {
        if (!r.field) continue;
        const av = a[r.field] != null ? String(a[r.field]) : '';
        const bv = b[r.field] != null ? String(b[r.field]) : '';
        const n = av.localeCompare(bv, undefined, { numeric: true });
        if (n !== 0) return r.dir === 'asc' ? n : -n;
      }
      return 0;
    });
  }
  // Build table scaffold — tbody via innerHTML, thead via shared component
  wrap.innerHTML = `
    <table class="af-table">
      <thead><tr></tr></thead>
      <tbody>
        ${rows.map(a => {
          const cells = afColOrder.filter(c => !afHiddenCols.has(c.key))
            .map(c => `<td data-col="${c.key}">${_renderAfCellContent(a, c.key)}</td>`).join('');
          return `<tr style="cursor:pointer" onclick="openAgentView('${a.type}')">
            ${cells}
            <td class="af-actions" onclick="event.stopPropagation()">
              <div class="af-row-actions">
                <button class="af-action-btn" onclick="openAgentView('${a.type}')"><span class="material-symbols-outlined">open_in_new</span><span>Open</span></button>
                ${a.awaiting > 0 ? `<button class="af-action-btn" onclick="openAgentView('${a.type}')"><span class="material-symbols-outlined">pending_actions</span><span>View Assists</span></button>` : ''}
              </div>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  _buildTableHead(wrap.querySelector('thead'), afColOrder, afHiddenCols, afColWidths, {
    resizeFn:        'startAfColResize',
    sortRules:       afSortRules,
    pinnedCols:      afPinnedCols,
    colMenuFn:       'openAfColMenu',
    baseThClass:     'af-table-th',
    trailingThClass: 'af-table-th af-actions-th',
  });
  if (typeof applyAfFreezeStyles === 'function') applyAfFreezeStyles();
}

// ── Agent View ────────────────────────────────────────────────────────────────
function openAgentView(type) {
  const tabs = sectionTabs['agentfleet'];
  const tabId = 'agent:' + type;
  if (!tabs.find(t => t.id === tabId)) {
    tabs.push({ id: tabId, label: type, icon: agentDetailData[type]?.icon || 'smart_toy', home: false });
  }
  sectionActiveTab['agentfleet'] = tabId;
  renderTopbarTabs();
  _showAgentView(type);
}

function _showAgentView(type) {
  _activeAgentType = type;
  closeAgentUtil();
  // Hide all list-layer pages; agent detail uses the shared #case-page shell
  document.getElementById('agentfleet-page').style.display = 'none';
  document.getElementById('portal-content').classList.add('hidden');
  const wfPage = document.getElementById('workfeed-page');
  if (wfPage) wfPage.style.display = 'none';
  document.getElementById('case-page').classList.remove('hidden');
  renderAgentView(type, 'overview');
  _renderAiDrawerContext();
  _renderAiFooter();
}

function _showFleetView() {
  _activeAgentType = null;
  // If agent detail was using #case-page, hide it and restore fleet page
  if (_casePageMode === 'agent') {
    document.getElementById('case-page').classList.add('hidden');
    _casePageMode = 'case';
  }
  const afPage = document.getElementById('agentfleet-page');
  afPage.style.display = 'flex';
  afPage.classList.remove('detail-mode');
  document.getElementById('af-fleet-view').style.display = 'flex';
  _renderAiDrawerContext();
  _renderAiFooter();
}

function renderAgentView(type, tabKey) {
  tabKey = tabKey || 'queue';
  const d = agentDetailData[type];
  if (!d) return;
  const fd = agentData.find(a => a.type === type) || {};
  _casePageMode = 'agent';
  const av = document.getElementById('case-page');
  // Clear any case-specific state classes before rendering agent content
  av.classList.remove('wf-readonly', 'progress-open');

  const escalated = d.pendingAssists.filter(p => p.priority === 'High').length;
  const inProgress = d.pendingAssists.filter(p => p.priority !== 'High').length;
  const queueTotal = d.pendingAssists.length;

  // ── Header ──────────────────────────────────────────────────────────────────
  const tabDefs = [
    { key: 'overview',     label: 'Overview'     },
    { key: 'queue',        label: 'In Queue'     },
    { key: 'capabilities', label: 'Capabilities' },
  ];
  const navTabsHtml = `<div class="av-nav-tabs">` + tabDefs.map(t =>
    `<button class="av-nav-tab${t.key === tabKey ? ' active' : ''}" onclick="scrollToAvSection('${t.key}','${type}')">${t.label}</button>`
  ).join('') + `</div>`;

  const header = `
    <div class="case-header progress-open">
      <div class="case-header-main">
        <div class="case-header-left">
          <div class="case-header-id">
            <span class="case-company" style="display:flex;align-items:center;gap:6px">
              <div class="av-agent-icon"><span class="material-symbols-outlined">${d.icon}</span></div>
              ${type}
            </span>
            <span class="case-num">
              <span class="material-symbols-outlined">smart_toy</span>
              <span>${d.agentId || '2947-5839'}</span>
            </span>
          </div>
        </div>
        <div class="case-header-meta">
          <div class="case-meta-sep"></div>
          <div class="case-meta-item">
            <span class="case-meta-label">In Handling</span>
            <span class="case-meta-value">${d.inHandling ?? fd.running ?? '—'}</span>
          </div>
          <div class="case-meta-sep"></div>
          <div class="case-meta-item">
            <span class="case-meta-label">Escalated</span>
            <span class="case-meta-value" style="color:${escalated > 0 ? '#dc2626' : 'inherit'}">${escalated}</span>
          </div>
          <div class="case-meta-sep"></div>
          <div class="case-meta-item">
            <span class="case-meta-label">Last action</span>
            <span class="case-meta-value">${d.lastAction || '—'}</span>
          </div>
        </div>
        <div class="case-header-right">
          <button class="case-return-btn" onclick="selectTab('home')">
            <span class="material-symbols-outlined">chevron_left</span>Fleet
          </button>
          <button class="header-icon" title="Refresh" onclick="renderAgentView('${type}','${tabKey}')">
            <span class="material-symbols-outlined">refresh</span>
          </button>
        </div>
      </div>
      <div class="case-header-footer" style="padding-left:4px">
        ${navTabsHtml}
      </div>
    </div>`;

  // ── Section: In Queue ────────────────────────────────────────────────────────
  const queueRows = d.pendingAssists.map(p => _avQueueRowHtml(p)).join('');

  const queueSection = _avSection('queue', `In Queue (${queueTotal})`, 'Queue management', `
    <div class="av-queue-filters">
      <button class="av-queue-pill active" onclick="_avFilterQueue(event,'all','${type}')">All (${queueTotal})</button>
      <button class="av-queue-pill" onclick="_avFilterQueue(event,'escalated','${type}')">Escalated (${escalated})</button>
      <button class="av-queue-pill" onclick="_avFilterQueue(event,'progress','${type}')">In progress (${inProgress})</button>
    </div>
    ${queueTotal > 0 ? `
    <div class="av-queue-box">
      <table class="av-queue-table" id="av-queue-tbl-${type}">
        <thead><tr>
          <th style="width:85px">Case</th>
          <th style="width:160px">Assist Needed</th>
          <th style="width:80px">Priority</th>
          <th style="width:100px">Escalated</th>
          <th>Reason</th>
          <th style="width:160px"></th>
        </tr></thead>
        <tbody>${queueRows}</tbody>
      </table>
    </div>` : `<div class="av-empty"><span class="material-symbols-outlined">check_circle</span>No items in queue — all clear</div>`}
  `);

  // ── Section: Overview ────────────────────────────────────────────────────────
  const totalAssists = d.openAssists.credentials + d.openAssists.captcha + d.openAssists.authorize;
  const barHtml = totalAssists > 0 ? `
    <div class="av-assists-bar">
      ${d.openAssists.credentials > 0 ? `<div class="ab-seg" style="flex:${d.openAssists.credentials};background:#7c3aed"></div>` : ''}
      ${d.openAssists.captcha     > 0 ? `<div class="ab-seg" style="flex:${d.openAssists.captcha};background:#f59e0b"></div>` : ''}
      ${d.openAssists.authorize   > 0 ? `<div class="ab-seg" style="flex:${d.openAssists.authorize};background:#22c55e"></div>` : ''}
    </div>
    <div class="av-assists-legend">
      ${d.openAssists.credentials > 0 ? `<div class="av-legend-item"><div class="av-legend-dot" style="background:#7c3aed"></div>Credentials</div>` : ''}
      ${d.openAssists.captcha     > 0 ? `<div class="av-legend-item"><div class="av-legend-dot" style="background:#f59e0b"></div>Captcha</div>` : ''}
      ${d.openAssists.authorize   > 0 ? `<div class="av-legend-item"><div class="av-legend-dot" style="background:#22c55e"></div>Authorize</div>` : ''}
    </div>` : `<div style="font-size:12px;color:var(--text-muted)">No open assists</div>`;
  const rateNum = parseInt(d.successRate);
  const rateColor = rateNum >= 93 ? '#15803d' : rateNum >= 85 ? '#b45309' : '#b91c1c';

  const overviewSection = _avSection('overview', 'Overview', 'Agent performance and objective', `
    <div class="av-ov-metrics">
      <div class="av-metric-card">
        <div class="av-metric-label">Open Assists</div>
        <div class="av-metric-number-row"><div class="av-metric-number">${totalAssists}</div><div class="av-metric-unit">pending</div></div>
        ${barHtml}
      </div>
      <div class="av-metric-card">
        <div class="av-metric-label">Human Assist Freq.</div>
        <div style="font-size:22px;font-weight:700;color:var(--text-primary);margin:8px 0 2px">${d.humanAssistFreq.split(' ')[0]}</div>
        <div style="font-size:11px;color:var(--text-muted)">Per ${d.humanAssistFreq.split(' ').slice(2).join(' ')}</div>
      </div>
      <div class="av-metric-card">
        <div class="av-metric-label">Success Rate</div>
        <div style="font-size:22px;font-weight:700;color:${rateColor};margin:8px 0 2px">${d.successRate}</div>
      </div>
    </div>
    <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:8px">Objective</div>
    <div class="av-obj-text">${d.objective}</div>
    <button class="av-view-system" style="margin-top:10px"><span class="material-symbols-outlined">open_in_new</span>View system prompt</button>

    <button class="av-fb-cta" onclick="openAvFeedback('${type}')">
      <span class="material-symbols-outlined">rate_review</span>
      Help improve this agent
      <span class="av-fb-cta-arrow material-symbols-outlined">arrow_forward</span>
    </button>
  `);

  // ── Section: Capabilities ────────────────────────────────────────────────────
  const caps = d.capabilities_v2 || {};
  function _capGroup(title, subsections) {
    return `<div class="av-cap-group">
      <div class="av-cap-group-title">${title}</div>
      ${subsections.map(([label, items]) => `
        <div class="av-cap-sub">
          <div class="av-cap-sub-label">${label}</div>
          <ul class="av-cap-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>`).join('')}
    </div>`;
  }

  const capsContent = `
    ${_capGroup('Triggers', [
      ['Automated', caps.triggers?.automated || ['Custom Field Changes']],
      ['Manual',    caps.triggers?.manual    || ['Mentioned', 'Assigned Task']],
    ])}
    ${_capGroup('Access', [
      ['Workspaces Access', caps.access?.workspaces || ['Queue In Line']],
      ['External Access',   caps.access?.external   || ['Web Search', 'Gmail']],
    ])}
    <div class="av-cap-group">
      <div class="av-cap-group-title">Skills</div>
      <ul class="av-cap-list">${(caps.skills || ['Tasks And Subtasks','Edit Tasks','Create Tasks','Update Tasks','Comments']).map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="av-cap-group">
      <div class="av-cap-group-title">Handover &amp; Escalation</div>
      <ul class="av-cap-list">${(caps.escalation || ['When A Specific Program Requires Credentials Loggin']).map(e => `<li>${e}</li>`).join('')}</ul>
    </div>`;

  const capSection = _avSection('capabilities', 'Capabilities', 'Triggers, access, skills and escalation rules', capsContent);

  // ── Utility sidebar (unchanged) ───────────────────────────────────────────────
  const utilSidebarHtml = `
    <div class="utility-sidebar" id="av-util-sidebar">
      <div class="utility-panel" id="av-util-panel">
        <div class="panel-resize-handle" id="av-panel-resize-handle" onmousedown="startAgentPanelResize(event)"></div>
        <div class="conv-toolbar" id="av-util-panel-header" style="display:flex">
          <span id="av-util-panel-title" style="font-size:13px;font-weight:600;color:var(--text-primary);padding:0 12px;display:flex;align-items:center;flex:1"></span>
          <button class="conv-action-btn" title="Minimize panel" onclick="closeAgentUtil()">
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <div class="utility-panel-body" id="av-util-panel-body"></div>
      </div>
      <div class="utility-strip" id="av-util-strip">
        <button class="util-strip-btn" data-util="activity" onclick="toggleAgentUtil('activity')" title="Activity">
          <span class="material-symbols-outlined">history</span>
        </button>
        <button class="util-strip-btn" data-util="prompt" onclick="toggleAgentUtil('prompt')" title="System Prompt">
          <span class="material-symbols-outlined">psychology</span>
        </button>
        <button class="util-strip-btn" data-util="config" onclick="toggleAgentUtil('config')" title="Configuration">
          <span class="material-symbols-outlined">settings</span>
        </button>
      </div>
    </div>`;

  av.innerHTML = header + `<div class="case-body"><div class="av-body" id="av-content-area">${overviewSection}${queueSection}${capSection}</div>${utilSidebarHtml}</div>`;

  // Scroll to requested section after render (overview is first — just reset to top)
  requestAnimationFrame(() => {
    const area = document.getElementById('av-content-area');
    if (!area) return;
    if (tabKey === 'overview') { area.scrollTop = 0; }
    else scrollToAvSection(tabKey, type);
  });
}

function _avSection(key, title, subtitle, content) {
  return `
  <div class="case-section" id="av-section-${key}">
    <div class="case-section-header" onclick="toggleAvSection('${key}')">
      <div class="case-section-toggle" id="av-toggle-${key}">
        <span class="material-symbols-outlined">expand_more</span>
      </div>
      <div class="case-section-labels">
        <div class="case-section-title">${title}</div>
        <div class="case-section-desc">${subtitle}</div>
      </div>
      <div class="case-section-actions">
        <button class="case-section-menu-btn" onclick="event.stopPropagation()">
          <span class="material-symbols-outlined">more_horiz</span>
        </button>
      </div>
    </div>
    <div class="case-section-divider"></div>
    <div class="case-fields" id="av-fields-${key}" style="padding-top:12px">
      ${content}
    </div>
  </div>`;
}

function toggleAvSection(key) {
  const fields  = document.getElementById('av-fields-' + key);
  const toggle  = document.getElementById('av-toggle-' + key);
  const section = document.getElementById('av-section-' + key);
  const divider = section?.querySelector('.case-section-divider');
  if (!fields) return;
  const isHidden = fields.classList.toggle('hidden');
  if (toggle)  toggle.classList.toggle('collapsed', isHidden);
  if (divider) divider.classList.toggle('hidden', isHidden);
  if (section) section.classList.toggle('minimized', isHidden);
}

function scrollToAvSection(key, type) {
  const el = document.getElementById('av-section-' + key);
  const area = document.getElementById('av-content-area');
  if (el && area) area.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' });
  // Update active tab
  document.querySelectorAll('.av-nav-tab').forEach(b =>
    b.classList.toggle('active', b.textContent.toLowerCase().includes(
      key === 'queue' ? 'queue' : key === 'overview' ? 'overview' : 'capab'
    ))
  );
}

let _avQueueFilter = {};
// ── Agent queue row template (shared by initial render + filter re-render) ───
function _avQueueRowHtml(p) {
  const types = Array.isArray(p.assistType) ? p.assistType : [p.assistType];
  const chips = types.map(t => `<span class="av-assist-tag ${t.toLowerCase().replace(/\s+/g,'')}">${t}</span>`).join(' ');
  const prioClass = p.priority === 'High' ? 'high' : p.priority === 'Med' ? 'med' : 'low';
  const prioIcon  = p.priority === 'High' ? 'priority_high' : p.priority === 'Med' ? 'remove' : 'expand_more';
  return `<tr onclick="openCaseTab('${p.caseId}')">
    <td><div class="av-case-link"><span class="material-symbols-outlined">folder_open</span>${p.caseId}</div></td>
    <td><div class="av-tags-cell">${chips}</div></td>
    <td><div class="av-priority-cell ${prioClass}"><span class="material-symbols-outlined">${prioIcon}</span>${p.priority}</div></td>
    <td style="font-variant-numeric:tabular-nums;color:var(--text-secondary);white-space:nowrap">${p.elapsed || '—'}</td>
    <td style="color:var(--text-secondary);overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:0">${p.blockReason || '—'}</td>
    <td onclick="event.stopPropagation()" style="padding:4px 8px">
      <div class="av-row-actions">
        <button class="av-action-btn" onclick="_avShowAssignPop(event,'${p.caseId}')">
          <span class="material-symbols-outlined">person_add</span>Assign to
        </button>
        <button class="av-action-btn" onclick="_avShowAllocatePop(event,'${p.caseId}')">
          <span class="material-symbols-outlined">move_to_inbox</span>Allocate to
        </button>
      </div>
    </td>
  </tr>`;
}

const _AV_AGENTS = ['Ben Septer','Ahmed Arah','Emily Foster','Sara Klein','Tom Reeves','Liam Chen','Nora Vidal','Jake Moreno','Priya Patel','David Ellis'];
const _AV_QUEUES = ['Tier 1 Queue','Tier 2 Queue','Tier 3 Queue','Escalated Queue','Unassigned Pool'];
let _avActionPop = null;

function _avCloseActionPop() {
  if (_avActionPop) { _avActionPop.remove(); _avActionPop = null; }
}

function _avBuildPop(btn, title, items, onSelect) {
  _avCloseActionPop();
  const pop = document.createElement('div');
  pop.className = 'av-action-pop';
  pop.innerHTML = `<div class="av-action-pop-title">${title}</div>` +
    items.map(it => `<div class="av-action-pop-item" data-val="${it}">
      <span class="material-symbols-outlined">${title.startsWith('Assign') ? 'person' : 'inbox'}</span>${it}
    </div>`).join('');
  pop.querySelectorAll('.av-action-pop-item').forEach(el =>
    el.addEventListener('click', () => { onSelect(el.dataset.val); _avCloseActionPop(); })
  );
  document.body.appendChild(pop);
  _avActionPop = pop;
  // Position below button
  const rect = btn.getBoundingClientRect();
  pop.style.top  = (rect.bottom + 4) + 'px';
  pop.style.left = Math.min(rect.left, window.innerWidth - 180) + 'px';
  setTimeout(() => document.addEventListener('click', _avCloseActionPop, { once: true }), 0);
}

function _avShowAssignPop(e, caseId) {
  e.stopPropagation();
  _avBuildPop(e.currentTarget, 'Assign to', _AV_AGENTS, agent => {
    showToast(`Case ${caseId} assigned to ${agent}`, { type: 'success' });
  });
}

function _avShowAllocatePop(e, caseId) {
  e.stopPropagation();
  _avBuildPop(e.currentTarget, 'Allocate to', _AV_QUEUES, queue => {
    showToast(`Case ${caseId} allocated to ${queue}`, { type: 'success' });
  });
}

function _avFilterQueue(e, filter, type) {
  e.stopPropagation();
  _avQueueFilter[type] = filter;
  e.currentTarget.closest('.av-queue-filters')?.querySelectorAll('.av-queue-pill')
    .forEach(b => b.classList.toggle('active', b === e.currentTarget));
  const d = agentDetailData[type];
  if (!d) return;
  const rows = d.pendingAssists.filter(p => {
    if (filter === 'escalated') return p.priority === 'High';
    if (filter === 'progress')  return p.priority !== 'High';
    return true;
  });
  const tbody = document.querySelector(`#av-queue-tbl-${type} tbody`);
  if (!tbody) return;
  tbody.innerHTML = rows.map(p => _avQueueRowHtml(p)).join('');
}

// ── Agent feedback CTA ────────────────────────────────────────────────────────
function toggleAvFbChip(el) {
  el.classList.toggle('selected');
}

function openAvFeedback(type) {
  // Reset form state
  const body = document.getElementById('av-fb-modal-body');
  if (body) body.innerHTML = `
    <div class="av-fb-label">What needs improvement?</div>
    <div class="av-fb-chips" id="av-fb-chips">
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Too many human assists</span>
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Wrong routing decisions</span>
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Accuracy issues</span>
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Missed edge cases</span>
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Slow execution</span>
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Incorrect escalation</span>
      <span class="av-fb-chip" onclick="toggleAvFbChip(this)">Other</span>
    </div>
    <div class="av-fb-label">Additional context</div>
    <textarea class="av-fb-textarea" id="av-fb-text" placeholder="Describe a specific case or pattern where the agent underperformed…"></textarea>
    <div class="av-fb-footer">
      <button class="av-fb-submit" onclick="submitAvFeedback()">Send feedback</button>
      <span class="av-fb-anon"><span class="material-symbols-outlined">lock</span>Sent anonymously to the dev team</span>
    </div>`;
  document.getElementById('av-fb-overlay')?.classList.remove('hidden');
}

function closeAvFeedback() {
  document.getElementById('av-fb-overlay')?.classList.add('hidden');
}

function submitAvFeedback() {
  const body = document.getElementById('av-fb-modal-body');
  if (!body) return;
  body.innerHTML = `
    <div class="av-fb-success">
      <span class="material-symbols-outlined">check_circle</span>
      Thanks! Your feedback has been sent to the developer team.
    </div>`;
  setTimeout(closeAvFeedback, 1800);
}

