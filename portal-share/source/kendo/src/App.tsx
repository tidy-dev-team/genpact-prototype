import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Grid, GridColumn } from '@progress/kendo-react-grid'
import type { GridCellProps, GridCustomHeaderCellProps } from '@progress/kendo-react-grid'
import { process, orderBy } from '@progress/kendo-data-query'
import type { SortDescriptor } from '@progress/kendo-data-query'
import { assignedData, queueData } from './data'
import type { CaseRow } from './data'
import './kendo-overrides.css'

const DATA_ITEM_KEY  = 'id'
const SELECTED_FIELD = 'selected'

// ── Stable contexts (avoid creating new component types inside render) ──────

const ColMenuContext = React.createContext<(e: React.MouseEvent, field: string) => void>(() => {})
const PinCtx = React.createContext<Set<string>>(new Set())

// ── Selection context (checkboxes managed manually, not via KendoReact selectable) ──
interface SelectionCtxType {
  selectedState: Record<string, boolean | number[]>
  headerValue: boolean
  toggle: (id: string) => void
  toggleAll: (checked: boolean) => void
}
const SelectionCtx = React.createContext<SelectionCtxType>({
  selectedState: {}, headerValue: false, toggle: () => {}, toggleAll: () => {}
})

// Column definitions ──────────────────────────────────────────────

interface ColDef {
  field: string
  title: string
  width: number
  locked?: boolean
}

const ALL_COLUMNS: ColDef[] = [
  { field: 'id',        title: 'ID',          width: 110 },
  { field: 'name',      title: 'Case Name',   width: 180 },
  { field: 'created',   title: 'Create Date', width: 130 },
  { field: 'due',       title: 'Due Date',    width: 130 },
  { field: 'tier',      title: 'Tier',        width: 100 },
  { field: 'assignees', title: 'Assignee',    width: 230 },
  { field: 'status',    title: 'Status',      width: 130 },
  { field: 'stage',     title: 'Stage Name',  width: 140 },
  { field: 'fetchedBy', title: 'Fetched By',  width: 120 },
  { field: 'client',    title: 'Client Name', width: 140 },
]

// Create stable header-cell components once at module level so React never
// treats them as new component types across renders (which would cause remounts
// and break KendoReact locked-column state).
function makeColHeaderCell(field: string, title: string) {
  const HC = (props: GridCustomHeaderCellProps) => {
    const onMenuClick = React.useContext(ColMenuContext)
    return (
      <ColHeader thProps={props.thProps} field={field} title={title} onMenuClick={onMenuClick}>
        {props.children}
      </ColHeader>
    )
  }
  HC.displayName = `HC_${field}`
  return HC
}
const COL_HEADER_CELLS: Record<string, ReturnType<typeof makeColHeaderCell>> = Object.fromEntries(
  ALL_COLUMNS.map(c => [c.field, makeColHeaderCell(c.field, c.title)])
)

function getFieldValue(row: CaseRow, field: string): string {
  switch (field) {
    case 'id':        return row.id
    case 'name':      return row.name
    case 'created':   return row.created
    case 'due':       return row.due
    case 'tier':      return row.tier
    case 'assignees': return row.assignees.join(', ')
    case 'status':    return row.status
    case 'stage':     return row.stage || ''
    case 'fetchedBy': return row.fetchedBy || ''
    case 'client':    return row.client || ''
    default:          return ''
  }
}

// ── Custom Cells ──────────────────────────────────────────────────

const StatusCell = (props: GridCellProps) => {
  const status: string = props.dataItem.status || ''
  const cls = status.toLowerCase() === 'on progress' ? 'on-progress' : status.toLowerCase()
  return (
    <td style={{ height: 64, verticalAlign: 'middle', padding: '12px' }}>
      <span className={`status-badge ${cls}`}>{status}</span>
    </td>
  )
}

const AssigneeCell = (props: GridCellProps) => {
  const row: CaseRow = props.dataItem
  const shown = (row.assignees || []).slice(0, 2)
  return (
    <td style={{ height: 64, verticalAlign: 'middle', padding: '12px' }}>
      <div className="assignee-list">
        {shown.map((a: string, i: number) => (
          <span key={i} className="assignee-badge">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>person</span>
            {a}
          </span>
        ))}
        {row.overflow && <span className="assignee-overflow">{row.overflow}</span>}
      </div>
    </td>
  )
}

// Checkbox cell — reads from SelectionCtx so it's stable at module level
const SelectionCheckboxCell = (props: GridCellProps) => {
  const { selectedState, toggle } = React.useContext(SelectionCtx)
  const id = String(props.dataItem[DATA_ITEM_KEY])
  if (!props.dataItem[DATA_ITEM_KEY]) return <td />
  return (
    <td style={{ textAlign: 'center', padding: 0, verticalAlign: 'middle', width: 40 }}>
      <input
        type="checkbox"
        checked={!!selectedState[id]}
        onChange={() => toggle(id)}
        style={{ cursor: 'pointer', width: 16, height: 16 }}
      />
    </td>
  )
}

// Header checkbox — reads from SelectionCtx so it's stable at module level
const SelectionHeaderCellComp = (props: GridCustomHeaderCellProps) => {
  const { headerValue, toggleAll } = React.useContext(SelectionCtx)
  const thProps = (props.thProps ?? {}) as React.ThHTMLAttributes<HTMLTableCellElement>
  return (
    <th {...thProps} style={{ ...thProps.style, textAlign: 'center', padding: 0 }}>
      <input
        type="checkbox"
        checked={headerValue}
        onChange={e => toggleAll(e.target.checked)}
        style={{ cursor: 'pointer', width: 16, height: 16 }}
      />
    </th>
  )
}

const TierCell = (props: GridCellProps) => (
  <td style={{ height: 64, verticalAlign: 'middle', padding: '12px' }}>
    <span className="tier-badge">{props.dataItem.tier}</span>
  </td>
)

const IdCell = (props: GridCellProps) => (
  <td style={{ height: 64, verticalAlign: 'middle', padding: '12px', fontWeight: 500, color: '#474747', whiteSpace: 'nowrap' }}>
    {props.dataItem.id}
  </td>
)

// ── KPI Computation ───────────────────────────────────────────────

function computeKpi(data: CaseRow[]) {
  const total = data.length
  const completed = data.filter(r => r.status.toLowerCase() === 'completed').length
  const stuck = data.filter(r => r.status.toLowerCase() === 'stuck').length
  const onProgress = data.filter(r => r.status.toLowerCase() === 'on progress').length
  const waiting = data.filter(r => r.status.toLowerCase() === 'pending').length
  return { total, completed, stuck, onProgress, waiting }
}

// ── Filter / Sort types ───────────────────────────────────────────

interface FilterField { field: string; value: string }
interface SortRule { field: string; dir: 'asc' | 'desc' }

// ── App ───────────────────────────────────────────────────────────

export default function App() {
  // Tab
  const [activeTab, setActiveTab] = useState<'assigned' | 'queue'>('assigned')

  // Metrics
  const [showMetrics, setShowMetrics] = useState(false)

  // Topbar case tabs
  const [selectedCaseTab, setSelectedCaseTab] = useState<string | null>(null)
  const [caseTabs, setCaseTabs] = useState(['100003', '100004', '100005', '100006', '100007', '100008', '100009', '100010'])

  // Pagination
  const [page, setPage] = useState({ skip: 0, take: 10 })

  // Sort (manual, fed to orderBy)
  const [sortRules, setSortRules] = useState<SortRule[]>([])
  const [sortEditorOpen, setSortEditorOpen] = useState(false)

  // Group
  const [groupField, setGroupField] = useState<string | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Filter (custom filter fields)
  const [filterFields, setFilterFields] = useState<FilterField[]>([])
  const [activeFilterPopover, setActiveFilterPopover] = useState<string | null>(null)

  // Columns
  const [columnOrder, setColumnOrder] = useState<ColDef[]>(ALL_COLUMNS)
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set())
  const [frozenCol, setFrozenCol] = useState<string | null>(null)
  const [pinnedCols, setPinnedCols] = useState<Set<string>>(new Set())

  // Selection — manual checkbox, keyed by data item key
  const [selectedState, setSelectedStateObj] = useState<Record<string, boolean>>({})

  // Sidebar slide-in panel
  const [sidebarPanel, setSidebarPanel] = useState<'notifications' | 'search' | null>(null)
  const [sidebarSearch, setSidebarSearch] = useState('')

  // Dropdown panels
  const [openPanel, setOpenPanel] = useState<'filter' | 'sort' | 'group' | 'columns' | null>(null)

  // Column context menu
  const [colCtxMenu, setColCtxMenu] = useState<{ field: string; x: number; y: number } | null>(null)

  // Search (toolbar search, currently used as a quick filter)
  const [searchQuery, setSearchQuery] = useState('')

  // Group panel picker
  const [groupPickerOpen, setGroupPickerOpen] = useState(false)
  const [groupPanelSearch, setGroupPanelSearch] = useState('')
  const [sortPanelSearch, setSortPanelSearch] = useState('')
  const [filterPanelSearch, setFilterPanelSearch] = useState('')
  const [colPanelSearch, setColPanelSearch] = useState('')

  // Per-page menu (managed by KendoReact Grid's pageable prop)


  // ── Source data for current tab ──
  const sourceData = activeTab === 'assigned' ? assignedData : queueData

  // ── Apply filters ──
  const filteredData = React.useMemo(() => {
    let data = sourceData as CaseRow[]

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      data = data.filter(row =>
        row.id.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        row.status.toLowerCase().includes(q) ||
        row.assignees.some(a => a.toLowerCase().includes(q))
      )
    }

    // Custom filter fields
    data = data.filter(row =>
      filterFields.every(f => {
        if (!f.value) return true
        return getFieldValue(row, f.field).toLowerCase().includes(f.value.toLowerCase())
      })
    )
    return data
  }, [sourceData, searchQuery, filterFields])

  // ── Apply sorts ──
  const sortedData = React.useMemo(() => {
    if (!sortRules.length) return filteredData
    const sortDescs: SortDescriptor[] = sortRules.map(r => ({ field: r.field, dir: r.dir as 'asc' | 'desc' }))
    // orderBy works on plain objects, but our data has assignees array - wrap for sort
    return orderBy(filteredData, sortDescs)
  }, [filteredData, sortRules])

  // ── KPI (from filtered, not paged) ──
  const kpi = React.useMemo(() => computeKpi(filteredData), [filteredData])

  // ── Manual grouping (bypasses KendoReact premium `group` prop) ──
  const groupedFlatData = React.useMemo(() => {
    if (!groupField) return null
    const groups: Record<string, CaseRow[]> = {}
    const groupOrder: string[] = []
    sortedData.forEach(row => {
      const val = getFieldValue(row, groupField)
      if (!groups[val]) { groups[val] = []; groupOrder.push(val) }
      groups[val].push(row)
    })
    const result: any[] = []
    groupOrder.forEach(val => {
      result.push({ __isGroupHeader: true, __groupValue: val, __groupCount: groups[val].length, id: `__group_${val}` })
      if (!collapsedGroups.has(val)) {
        groups[val].forEach(row => result.push({ ...row, [SELECTED_FIELD]: !!selectedState[row.id] }))
      }
    })
    return result
  }, [sortedData, groupField, collapsedGroups, selectedState])

  // ── Process data for KendoReact Grid ──
  const processedData = React.useMemo(() => {
    if (groupedFlatData) {
      // Manual grouping path
      return { data: groupedFlatData.slice(page.skip, page.skip + page.take), total: groupedFlatData.length }
    }
    const dataWithSelection = sortedData.map(r => ({
      ...r,
      [SELECTED_FIELD]: !!selectedState[r.id],
    }))
    return process(dataWithSelection, { skip: page.skip, take: page.take })
  }, [groupedFlatData, sortedData, selectedState, page])

  // ── Tab switch ──
  const handleTabSwitch = (tab: 'assigned' | 'queue') => {
    setActiveTab(tab)
    setPage({ skip: 0, take: page.take })
    setSelectedStateObj({})
    setFilterFields([])
    setSortRules([])
    setSortEditorOpen(false)
    setGroupField(null)
    setCollapsedGroups(new Set())
    setGroupPickerOpen(false)
    setSearchQuery('')
    setOpenPanel(null)
    setActiveFilterPopover(null)
  }

  // ── Manual selection (checkboxes only, no KendoReact selectable) ──
  const toggleRowSelection = useCallback((id: string) => {
    setSelectedStateObj(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  const toggleAllSelection = useCallback((checked: boolean) => {
    if (checked) {
      const all: Record<string, boolean> = {}
      sortedData.forEach(r => { all[r.id] = true })
      setSelectedStateObj(all)
    } else {
      setSelectedStateObj({})
    }
  }, [sortedData])

  // ── Sort helpers ──
  const addSortRule = (field: string) => {
    setSortRules(prev => {
      const existing = prev.find(r => r.field === field)
      if (existing) return prev
      return [...prev, { field, dir: 'asc' }]
    })
    setSortEditorOpen(true)
    setOpenPanel(null)
  }

  const removeSortRule = (field: string) => {
    setSortRules(prev => {
      const next = prev.filter(r => r.field !== field)
      if (!next.length) setSortEditorOpen(false)
      return next
    })
  }

  const setSortDir = (field: string, dir: 'asc' | 'desc') => {
    setSortRules(prev => prev.map(r => r.field === field ? { ...r, dir } : r))
  }

  const clearAllSorts = () => {
    setSortRules([])
    setSortEditorOpen(false)
  }

  // ── Filter helpers ──
  const toggleFilterField = (field: string) => {
    setFilterFields(prev => {
      const exists = prev.find(f => f.field === field)
      if (exists) {
        if (activeFilterPopover === field) setActiveFilterPopover(null)
        return prev.filter(f => f.field !== field)
      }
      return [...prev, { field, value: '' }]
    })
  }

  const removeFilterField = (field: string) => {
    setFilterFields(prev => prev.filter(f => f.field !== field))
    if (activeFilterPopover === field) setActiveFilterPopover(null)
  }

  const updateFilterValue = (field: string, value: string) => {
    setFilterFields(prev => prev.map(f => f.field === field ? { ...f, value } : f))
    setPage(prev => ({ ...prev, skip: 0 }))
  }

  const resetAll = () => {
    setFilterFields([])
    setSortRules([])
    setSortEditorOpen(false)
    setActiveFilterPopover(null)
    setSearchQuery('')
  }

  // ── Group helpers ──
  const applyGroupField = (field: string) => {
    setGroupField(field)
    setCollapsedGroups(new Set())
    setGroupPickerOpen(false)
    setOpenPanel(null)
  }

  const clearGroup = () => {
    setGroupField(null)
    setCollapsedGroups(new Set())
    setGroupPickerOpen(false)
  }

  const toggleGroupCollapse = useCallback((groupValue: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupValue)) next.delete(groupValue)
      else next.add(groupValue)
      return next
    })
    setPage(prev => ({ ...prev, skip: 0 }))
  }, [])

  // ── Column visibility ──
  const toggleColVisibility = (field: string) => {
    setHiddenCols(prev => {
      const next = new Set(prev)
      if (next.has(field)) next.delete(field)
      else next.add(field)
      return next
    })
  }

  const hideAllCols = () => setHiddenCols(new Set(ALL_COLUMNS.map(c => c.field)))
  const showAllCols = () => setHiddenCols(new Set())

  // ── Pin / Unpin column ──
  const pinColumn = (field: string) => {
    setPinnedCols(prev => { const n = new Set(prev); n.add(field); return n })
    setColumnOrder(prev => {
      const idx = prev.findIndex(c => c.field === field)
      if (idx < 0) return prev
      const next = [...prev]
      const [col] = next.splice(idx, 1)
      // Insert after existing pinned columns
      const pinCount = Array.from(pinnedCols).filter(p => prev.some(c => c.field === p)).length
      next.splice(pinCount, 0, col)
      return next
    })
    setColCtxMenu(null)
  }

  const unpinColumn = (field: string) => {
    setPinnedCols(prev => { const n = new Set(prev); n.delete(field); return n })
    setColumnOrder(prev => {
      const curIdx = prev.findIndex(c => c.field === field)
      if (curIdx < 0) return prev
      const next = [...prev]
      const [col] = next.splice(curIdx, 1)
      const origIdx = ALL_COLUMNS.findIndex(c => c.field === field)
      let insertAt = 0
      for (let i = 0; i < next.length; i++) {
        const o = ALL_COLUMNS.findIndex(c => c.field === next[i].field)
        if (o < origIdx) insertAt = i + 1
      }
      next.splice(insertAt, 0, col)
      return next
    })
    setColCtxMenu(null)
  }

  // ── Column context menu ──
  const openColCtxMenu = useCallback((e: React.MouseEvent, field: string) => {
    e.stopPropagation()
    setColCtxMenu({ field, x: e.clientX, y: e.clientY })
    setOpenPanel(null)
  }, [])

  // ── Outside click handler ──
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.tb-wrap') && !target.closest('.sort-pill') && !target.closest('.sort-editor')) {
        setOpenPanel(null)
        setSortEditorOpen(false)
      }
      if (!target.closest('.filter-pill') && !target.closest('.filter-popover')) {
        setActiveFilterPopover(null)
      }
      if (!target.closest('.col-ctx-menu') && !target.closest('.th-menu-btn')) {
        setColCtxMenu(null)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  // ── Visible columns ──
  const visibleColumns = columnOrder.filter(c => !hiddenCols.has(c.field))

  // ── Computed header selection value ──
  const allPageIds = React.useMemo(() => {
    const flat: string[] = []
    processedData.data.forEach((item: Record<string, unknown>) => {
      if (item.__isGroupHeader) return
      if (item[DATA_ITEM_KEY]) flat.push(String(item[DATA_ITEM_KEY]))
    })
    return flat
  }, [processedData])

  const headerSelectionValue = allPageIds.length > 0 && allPageIds.every(id => !!selectedState[id])
  const selectedCount = Object.values(selectedState).filter(Boolean).length

  const hasActiveFilters = filterFields.length > 0
  const hasActiveSorts = sortRules.length > 0
  const showActiveBar = hasActiveFilters || hasActiveSorts

  // ── Memoized context values (stable reference when deps unchanged) ──
  const selectionCtxValue = React.useMemo<SelectionCtxType>(() => ({
    selectedState,
    headerValue: headerSelectionValue,
    toggle: toggleRowSelection,
    toggleAll: toggleAllSelection,
  }), [selectedState, headerSelectionValue, toggleRowSelection, toggleAllSelection])

  // ── Group header row renderer (manual grouping replaces KendoReact premium `group`) ──
  const rowRender = useCallback((row: React.ReactElement, props: any) => {
    const item = props.dataItem
    if (!item.__isGroupHeader) return row
    const isCollapsed = collapsedGroups.has(item.__groupValue)
    const colCount = visibleColumns.length + 1 // +1 for checkbox column
    return (
      <tr key={`gh-${item.__groupValue}`} style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0' }}>
        <td colSpan={colCount} style={{ padding: '6px 12px', fontWeight: 600, fontSize: 13, color: '#292929' }}>
          <button
            onClick={() => toggleGroupCollapse(item.__groupValue)}
            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, marginRight: 6, verticalAlign: 'middle', lineHeight: 1 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, verticalAlign: 'middle', color: '#555' }}>
              {isCollapsed ? 'chevron_right' : 'expand_more'}
            </span>
          </button>
          <span style={{ color: '#7a7a7a', fontWeight: 500 }}>
            {ALL_COLUMNS.find(c => c.field === groupField)?.title}:&nbsp;
          </span>
          {item.__groupValue}
          <span style={{ marginLeft: 8, fontSize: 12, color: '#aaa', fontWeight: 400 }}>({item.__groupCount})</span>
        </td>
      </tr>
    )
  }, [collapsedGroups, visibleColumns, groupField, toggleGroupCollapse])

  // ── Drag ref for column reorder in panel ──
  const colDragRef = useRef<number | null>(null)
  const sortDragRef = useRef<number | null>(null)

  return (
    <SelectionCtx.Provider value={selectionCtxValue}>
    <PinCtx.Provider value={pinnedCols}>
    <ColMenuContext.Provider value={openColCtxMenu}>
    <div style={{ display: 'grid', gridTemplateColumns: 'var(--sidebar-width) 1fr', height: '100vh', overflow: 'hidden', width: '100%' }}>

      {/* ── Sidebar slide-in panel ── */}
      {sidebarPanel && (
        <div style={{
          position: 'fixed', top: 0, left: 'var(--sidebar-width)', bottom: 0,
          width: 320, background: '#fff', borderRight: '1px solid var(--border)',
          zIndex: 200, display: 'flex', flexDirection: 'column', boxShadow: '4px 0 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#474747' }}>
              {sidebarPanel === 'notifications' ? 'notifications' : 'search'}
            </span>
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {sidebarPanel === 'notifications' ? 'Notifications' : 'Search'}
            </span>
            <button
              onClick={() => setSidebarPanel(null)}
              style={{ marginLeft: 'auto', border: 'none', background: 'none', cursor: 'pointer', fontSize: 18, color: '#888', padding: 4 }}
            >&times;</button>
          </div>
          {sidebarPanel === 'search' ? (
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 8, background: '#fafafa' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#999' }}>search</span>
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={sidebarSearch}
                  autoFocus
                  onChange={e => { setSidebarSearch(e.target.value); setSearchQuery(e.target.value); setPage(prev => ({ ...prev, skip: 0 })) }}
                  style={{ border: 'none', outline: 'none', fontSize: 13, fontFamily: 'inherit', flex: 1, background: 'transparent' }}
                />
                {sidebarSearch && (
                  <button onClick={() => { setSidebarSearch(''); setSearchQuery('') }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#999', fontSize: 16 }}>&times;</button>
                )}
              </div>
              {sidebarSearch && (
                <div style={{ fontSize: 12, color: '#7a7a7a', paddingLeft: 4 }}>
                  {filteredData.length} result{filteredData.length !== 1 ? 's' : ''} for "{sidebarSearch}"
                </div>
              )}
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {[
                { id: 1, text: 'Case #100003 was assigned to you', time: '2m ago', icon: 'assignment_ind' },
                { id: 2, text: 'Case #100007 status changed to On Progress', time: '14m ago', icon: 'autorenew' },
                { id: 3, text: 'Case #100012 due date is tomorrow', time: '1h ago', icon: 'schedule' },
                { id: 4, text: 'Team queue has 3 new cases', time: '3h ago', icon: 'inbox' },
                { id: 5, text: 'Case #100002 completed', time: 'Yesterday', icon: 'task_alt' },
              ].map(n => (
                <div key={n.id} style={{ display: 'flex', gap: 10, padding: '12px 16px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#474747' }}>{n.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: '#292929', lineHeight: 1.4 }}>{n.text}</div>
                    <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sidebar ── */}
      <nav style={{
        background: 'var(--bg-sidebar)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '8px 0', height: '100vh', overflow: 'hidden',
        position: 'relative', zIndex: 202
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0' }}>
          <button style={sidebarBtnStyle()}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>view_comfy_alt</span>
          </button>
        </div>
        <div style={dividerStyle()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0' }}>
          <button style={sidebarBtnStyle(sidebarPanel === 'notifications')} onClick={() => setSidebarPanel(sidebarPanel === 'notifications' ? null : 'notifications')}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>notifications</span>
          </button>
          <button style={sidebarBtnStyle(sidebarPanel === 'search')} onClick={() => setSidebarPanel(sidebarPanel === 'search' ? null : 'search')}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>search</span>
          </button>
        </div>
        <div style={dividerStyle()} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0' }}>
          <button style={sidebarBtnStyle(true)} onClick={() => setSelectedCaseTab(null)}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>home</span>
          </button>
          <button style={sidebarBtnStyle()}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>bar_chart</span>
          </button>
          <button style={sidebarBtnStyle()}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>archive</span>
          </button>
        </div>
        <div style={dividerStyle()} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '6px 0' }}>
          <button style={sidebarBtnStyle()}>
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>person</span>
          </button>
        </div>
      </nav>

      {/* ── Main ── */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>

        {/* ── Topbar ── */}
        <div style={{
          height: 'var(--topbar-height)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', background: 'var(--bg-light)', flexShrink: 0
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none' as const }}>
            {caseTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedCaseTab(selectedCaseTab === tab ? null : tab)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '0 12px', height: 'var(--topbar-height)',
                  border: 'none', borderLeft: '1px solid #e1e1e1',
                  background: selectedCaseTab === tab ? '#e1e1e1' : 'none',
                  fontSize: 14, color: '#292929', cursor: 'pointer',
                  whiteSpace: 'nowrap' as const, width: 138, flexShrink: 0, fontFamily: 'inherit'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#474747' }}>folder_open</span>
                <span style={{ flex: 1 }}>{tab}</span>
                <span
                  style={{ fontSize: 16, color: '#aaa', lineHeight: 1, padding: '2px 4px', borderRadius: 4 }}
                  onClick={e => { e.stopPropagation(); setCaseTabs(prev => prev.filter(t => t !== tab)); if (selectedCaseTab === tab) setSelectedCaseTab(null) }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#ccc')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >&times;</span>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 8px', flexShrink: 0 }}>
            <button style={topbarIconBtn()}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>history</span>
            </button>
            <button style={topbarIconBtn()}>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
            </button>
          </div>
          <Link to="/components" style={{
            marginRight: 12, fontSize: 13, color: '#474747',
            textDecoration: 'none', padding: '4px 10px',
            border: '1px solid #e0e0e0', borderRadius: 6,
            background: '#fff', whiteSpace: 'nowrap' as const, flexShrink: 0
          }}>
            Components →
          </Link>
        </div>

        {/* ── Portal body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexShrink: 0 }}>
            <h1 style={{ fontSize: 18, fontWeight: 600, marginRight: 4 }}>My Work</h1>
            <div style={{ display: 'flex', background: '#e1e1e1', borderRadius: 8, overflow: 'hidden', height: 34 }}>
              <button
                onClick={() => handleTabSwitch('assigned')}
                style={{
                  border: 'none', padding: '0 16px', fontSize: 13, fontFamily: 'inherit',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === 'assigned' ? 'var(--bg-dark)' : 'none',
                  color: activeTab === 'assigned' ? '#fff' : 'var(--text-secondary)',
                  borderRadius: activeTab === 'assigned' ? 8 : 0
                }}
              >
                Cases Assign to me
              </button>
              <button
                onClick={() => handleTabSwitch('queue')}
                style={{
                  border: 'none', padding: '0 16px', fontSize: 13, fontFamily: 'inherit',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  background: activeTab === 'queue' ? 'var(--bg-dark)' : 'none',
                  color: activeTab === 'queue' ? '#fff' : 'var(--text-secondary)',
                  borderRadius: activeTab === 'queue' ? 8 : 0
                }}
              >
                Cases in queue
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer', borderRadius: 8,
                  background: showMetrics ? 'var(--bg-dark)' : 'none',
                  color: showMetrics ? '#fff' : 'var(--text-secondary)',
                  transition: 'background 0.15s'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>bar_chart</span>
              </button>
              <button style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'none', cursor: 'pointer', borderRadius: 8, color: 'var(--text-secondary)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>refresh</span>
              </button>
            </div>
          </div>

          {/* KPI Metrics */}
          {showMetrics && (
            <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
              {/* Main KPI card */}
              <div style={kpiCardStyle('main')}>
                <div style={{ fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {kpi.total}
                  <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                    {activeTab === 'assigned' ? 'Assigned Cases' : 'Queue Cases'}
                  </span>
                </div>
                {/* Progress bar with tooltips */}
                <div style={{ height: 8, borderRadius: 4, display: 'flex', gap: 2, marginTop: 4 }}>
                  <KpiSegment flex={kpi.completed || 0.001} bg="#1a1a1a" tooltip={`Completed: ${kpi.completed}`} />
                  <KpiSegment flex={kpi.onProgress || 0.001} bg="#bdbdbd" tooltip={`On Progress: ${kpi.onProgress}`} />
                  <KpiSegment flex={kpi.waiting || 0.001} bg="#ddd" tooltip={`Waiting: ${kpi.waiting}`} />
                </div>
              </div>
              <div style={kpiCardStyle('sub')}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Completed Cases</div>
                <div style={{ fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#474747', flexShrink: 0, display: 'inline-block' }} />
                  {kpi.completed}
                </div>
              </div>
              <div style={kpiCardStyle('sub')}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Stuck Cases</div>
                <div style={{ fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#474747', flexShrink: 0, display: 'inline-block' }} />
                  {kpi.stuck}
                </div>
              </div>
              <div style={kpiCardStyle('sub')}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>On Progress</div>
                <div style={{ fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#474747', flexShrink: 0, display: 'inline-block' }} />
                  {kpi.onProgress}
                </div>
              </div>
              <div style={kpiCardStyle('sub')}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Waiting Cases</div>
                <div style={{ fontSize: 28, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ccc', flexShrink: 0, display: 'inline-block' }} />
                  {kpi.waiting}
                </div>
              </div>
            </div>
          )}

          {/* Case tab empty state — shown when a case tab is open */}
          {/* Portal content area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minHeight: 0, position: 'relative' }}>

            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', background: 'var(--bg-white)', cursor: 'pointer' }}>
                  <span>Default view</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
                </div>
                <button style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', background: 'var(--bg-white)', borderRadius: 8, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
                </button>

                {/* Filter button */}
                <div className="tb-wrap" style={{ position: 'relative' }}>
                  <button
                    className={`toolbar-btn${hasActiveFilters ? ' active' : ''}`}
                    onClick={e => { e.stopPropagation(); setOpenPanel(openPanel === 'filter' ? null : 'filter') }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>filter_list</span>
                    <span>filter</span>
                    {hasActiveFilters && <span className="toolbar-badge">{filterFields.length}</span>}
                  </button>
                  {openPanel === 'filter' && (
                    <div className="dropdown-panel" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        className="dp-search"
                        placeholder="Search"
                        value={filterPanelSearch}
                        onChange={e => setFilterPanelSearch(e.target.value)}
                      />
                      {ALL_COLUMNS
                        .filter(c => !filterPanelSearch || c.title.toLowerCase().includes(filterPanelSearch.toLowerCase()))
                        .map(c => (
                          <div key={c.field} className="dp-item" onClick={() => toggleFilterField(c.field)}>
                            <input
                              type="checkbox"
                              checked={filterFields.some(f => f.field === c.field)}
                              onChange={() => toggleFilterField(c.field)}
                              onClick={e => e.stopPropagation()}
                            />
                            {c.title}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Sort button */}
                <div className="tb-wrap" style={{ position: 'relative' }}>
                  <button
                    className={`toolbar-btn${hasActiveSorts ? ' active' : ''}`}
                    onClick={e => { e.stopPropagation(); setOpenPanel(openPanel === 'sort' ? null : 'sort') }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>swap_vert</span>
                    <span>sort</span>
                    {hasActiveSorts && <span className="toolbar-badge">{sortRules.length}</span>}
                  </button>
                  {openPanel === 'sort' && (
                    <div className="dropdown-panel" style={{ minWidth: 260 }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        className="dp-search"
                        placeholder="Sort By..."
                        value={sortPanelSearch}
                        onChange={e => setSortPanelSearch(e.target.value)}
                      />
                      {ALL_COLUMNS
                        .filter(c => !sortPanelSearch || c.title.toLowerCase().includes(sortPanelSearch.toLowerCase()))
                        .map(c => (
                          <div key={c.field} className="dp-item" onClick={() => addSortRule(c.field)}>
                            {c.title}
                          </div>
                        ))
                      }
                    </div>
                  )}
                </div>

                {/* Group button */}
                <div className="tb-wrap" style={{ position: 'relative' }}>
                  {groupField ? (
                    <button
                      className="toolbar-btn active"
                      onClick={e => { e.stopPropagation(); setOpenPanel(openPanel === 'group' ? null : 'group') }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_agenda</span>
                      Group by: {ALL_COLUMNS.find(c => c.field === groupField)?.title}
                      <span
                        onClick={e => { e.stopPropagation(); clearGroup() }}
                        style={{ marginLeft: 4, cursor: 'pointer', fontSize: 15, opacity: 0.8, lineHeight: 1 }}
                      >&times;</span>
                    </button>
                  ) : (
                    <button
                      className="toolbar-btn"
                      onClick={e => { e.stopPropagation(); setOpenPanel(openPanel === 'group' ? null : 'group') }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_agenda</span>
                      <span>group</span>
                    </button>
                  )}
                  {openPanel === 'group' && (
                    <div className="dropdown-panel" style={{ minWidth: 260, padding: 0 }} onClick={e => e.stopPropagation()}>
                      {(!groupField || groupPickerOpen) ? (
                        <div style={{ padding: '6px 0' }}>
                          <input
                            type="text"
                            className="dp-search"
                            placeholder="Search for a property..."
                            value={groupPanelSearch}
                            onChange={e => setGroupPanelSearch(e.target.value)}
                          />
                          {ALL_COLUMNS
                            .filter(c => !groupPanelSearch || c.title.toLowerCase().includes(groupPanelSearch.toLowerCase()))
                            .map(c => (
                              <div key={c.field} className="dp-item" onClick={() => applyGroupField(c.field)}>
                                {c.title}
                              </div>
                            ))
                          }
                        </div>
                      ) : (
                        <div>
                          <div className="gp-header">
                            <span className="gp-label">Group by</span>
                            <button className="gp-field-link" onClick={() => setGroupPickerOpen(true)}>
                              {ALL_COLUMNS.find(c => c.field === groupField)?.title}
                              <span className="material-symbols-outlined" style={{ fontSize: 14, verticalAlign: 'middle' }}>chevron_right</span>
                            </button>
                          </div>
                          <button className="gp-delete-btn" onClick={clearGroup}>
                            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>Delete grouping
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
                {/* Status dropdowns */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', color: 'var(--text-primary)', background: 'var(--bg-white)', border: 'none', cursor: 'pointer' }}>
                  <span style={{ color: '#7a7a7a', fontSize: 12 }}>Team:</span>
                  <span>All selected</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#999' }}>expand_more</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 13, fontFamily: 'inherit', color: 'var(--text-primary)', background: 'var(--bg-white)', border: 'none', cursor: 'pointer' }}>
                  <span style={{ color: '#7a7a7a', fontSize: 12 }}>Status:</span>
                  <span>Active cases</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#999' }}>expand_more</span>
                </div>

                {/* Columns button */}
                <div className="tb-wrap" style={{ position: 'relative' }}>
                  <button
                    className={`toolbar-btn${hiddenCols.size > 0 ? ' active' : ''}`}
                    onClick={e => { e.stopPropagation(); setOpenPanel(openPanel === 'columns' ? null : 'columns') }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_column</span>
                    <span>columns</span>
                  </button>
                  {openPanel === 'columns' && (
                    <div className="dropdown-panel" style={{ minWidth: 280, left: 'auto', right: 0 }} onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        className="dp-search"
                        placeholder="Search for a property..."
                        value={colPanelSearch}
                        onChange={e => setColPanelSearch(e.target.value)}
                      />
                      <div className="dp-col-section-header">
                        <span>Shown in Table ({columnOrder.filter(c => !hiddenCols.has(c.field)).length})</span>
                        <button onClick={hideAllCols}>Hide all</button>
                      </div>
                      {/* Shown columns */}
                      {columnOrder
                        .filter(c => !hiddenCols.has(c.field) && (!colPanelSearch || c.title.toLowerCase().includes(colPanelSearch.toLowerCase())))
                        .map((c, i) => (
                          <div
                            key={c.field}
                            className="dp-col-item"
                            draggable
                            onDragStart={() => { colDragRef.current = i }}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => {
                              if (colDragRef.current === null || colDragRef.current === i) return
                              const from = colDragRef.current
                              const newOrder = [...columnOrder]
                              const shownIndices = newOrder
                                .map((c2, idx) => ({ c: c2, idx }))
                                .filter(x => !hiddenCols.has(x.c.field))
                                .map(x => x.idx)
                              const fromGlobal = shownIndices[from]
                              const toGlobal = shownIndices[i]
                              if (fromGlobal === undefined || toGlobal === undefined) return
                              const [moved] = newOrder.splice(fromGlobal, 1)
                              newOrder.splice(toGlobal, 0, moved)
                              setColumnOrder(newOrder)
                              colDragRef.current = null
                            }}
                          >
                            <span className="material-symbols-outlined drag-handle">drag_indicator</span>
                            {pinnedCols.has(c.field) && (
                              <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#888', marginRight: 2 }}>push_pin</span>
                            )}
                            <span className="col-name">{c.title}</span>
                            <button className="dp-eye-btn" onClick={() => toggleColVisibility(c.field)}>
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                          </div>
                        ))
                      }
                      {/* Hidden columns */}
                      {columnOrder.filter(c => hiddenCols.has(c.field)).length > 0 && (
                        <>
                          <div className="dp-divider" />
                          <div className="dp-col-section-header">
                            <span>Hidden in Table ({columnOrder.filter(c => hiddenCols.has(c.field)).length})</span>
                            <button onClick={showAllCols}>Show all</button>
                          </div>
                          {columnOrder
                            .filter(c => hiddenCols.has(c.field) && (!colPanelSearch || c.title.toLowerCase().includes(colPanelSearch.toLowerCase())))
                            .map(c => (
                              <div key={c.field} className="dp-col-item">
                                <span className="material-symbols-outlined drag-handle" style={{ opacity: 0.3 }}>drag_indicator</span>
                                <span className="col-name" style={{ color: '#aaa' }}>{c.title}</span>
                                <button className="dp-eye-btn" onClick={() => toggleColVisibility(c.field)}>
                                  <span className="material-symbols-outlined" style={{ color: '#aaa' }}>visibility_off</span>
                                </button>
                              </div>
                            ))
                          }
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Active bar (sort pills + filter pills) */}
            {showActiveBar && (
              <div className="active-bar" style={{ position: 'relative' }}>
                {/* Sort pill */}
                {hasActiveSorts && (
                  <>
                    <button
                      className="sort-pill"
                      onClick={e => { e.stopPropagation(); setSortEditorOpen(!sortEditorOpen) }}
                    >
                      {sortRules.length === 1
                        ? `${ALL_COLUMNS.find(c => c.field === sortRules[0].field)?.title} ${sortRules[0].dir === 'asc' ? '↑' : '↓'}`
                        : `${sortRules.length} sorts`
                      }
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        {sortEditorOpen ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {sortEditorOpen && (
                      <div className="sort-editor" onClick={e => e.stopPropagation()}>
                        {sortRules.map((r, i) => (
                          <div
                            key={i}
                            className="sort-editor-row"
                            draggable
                            onDragStart={() => { sortDragRef.current = i }}
                            onDragOver={e => e.preventDefault()}
                            onDrop={() => {
                              if (sortDragRef.current === null || sortDragRef.current === i) return
                              const from = sortDragRef.current
                              const newRules = [...sortRules]
                              const [moved] = newRules.splice(from, 1)
                              newRules.splice(i, 0, moved)
                              setSortRules(newRules)
                              sortDragRef.current = null
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ color: '#ccc', fontSize: 16, cursor: 'grab', flexShrink: 0 }}>drag_indicator</span>
                            <select value={r.field} onChange={e => {
                              const f = e.target.value
                              setSortRules(prev => prev.map((x, j) => j === i ? { ...x, field: f } : x))
                            }}>
                              {ALL_COLUMNS.map(c => <option key={c.field} value={c.field}>{c.title}</option>)}
                            </select>
                            <select value={r.dir} onChange={e => setSortDir(r.field, e.target.value as 'asc' | 'desc')}>
                              <option value="asc">Ascending</option>
                              <option value="desc">Descending</option>
                            </select>
                            <button className="remove-sort" onClick={() => removeSortRule(r.field)}>&times;</button>
                          </div>
                        ))}
                        <button className="dp-add-sort" onClick={() => {
                          const used = sortRules.map(r => r.field)
                          const next = ALL_COLUMNS.find(c => !used.includes(c.field))
                          if (next) addSortRule(next.field)
                        }}>+ Add sort</button>
                        <div className="dp-divider" />
                        <button className="dp-delete-btn" onClick={clearAllSorts}>
                          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>delete</span>Delete sort
                        </button>
                      </div>
                    )}
                  </>
                )}

                {hasActiveSorts && hasActiveFilters && (
                  <div className="active-bar-section-divider" />
                )}

                {/* Filter pills */}
                {filterFields.map(f => {
                  const col = ALL_COLUMNS.find(c => c.field === f.field)
                  const isEmpty = !f.value
                  const isOpen = activeFilterPopover === f.field
                  return (
                    <div
                      key={f.field}
                      className={`filter-pill${isEmpty ? ' empty' : ''}`}
                      style={{ position: 'relative' }}
                      onClick={e => { e.stopPropagation(); setActiveFilterPopover(isOpen ? null : f.field) }}
                    >
                      {f.value
                        ? <><span style={{ color: '#888', marginRight: 2 }}>{col?.title}:</span>{f.value}</>
                        : col?.title
                      }
                      <button
                        className="pill-x"
                        onClick={e => { e.stopPropagation(); removeFilterField(f.field) }}
                      >&times;</button>
                      {isOpen && (
                        <div className="filter-popover" onClick={e => e.stopPropagation()}>
                          <div className="fp-header">
                            <span>{col?.title}</span>
                            <button className="fp-contains">contains <span className="material-symbols-outlined">expand_more</span></button>
                            <button className="fp-overflow">···</button>
                          </div>
                          <div className="fp-input-row">
                            <input
                              className="fp-input"
                              type="text"
                              placeholder="Type a value..."
                              value={f.value}
                              autoFocus
                              onChange={e => updateFilterValue(f.field, e.target.value)}
                            />
                            {f.value && (
                              <button className="fp-clear" onClick={() => updateFilterValue(f.field, '')}>&times;</button>
                            )}
                          </div>
                          <button className="fp-delete" onClick={() => removeFilterField(f.field)}>
                            <span className="material-symbols-outlined">delete</span>Delete filter
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Add filter / Reset */}
                <button className="filter-bar-add" onClick={e => { e.stopPropagation(); setOpenPanel('filter') }}>
                  <span className="material-symbols-outlined">add</span>Filter
                </button>
                <div className="filter-bar-divider" />
                <button className="filter-bar-reset" onClick={resetAll}>
                  <span className="material-symbols-outlined">refresh</span>Reset
                </button>
              </div>
            )}

            {/* KendoReact Grid */}
            <div style={{ flex: 1, minHeight: 400, position: 'relative' }}>
              <Grid
                data={processedData.data as any[]}
                total={processedData.total}
                skip={page.skip}
                take={page.take}
                onPageChange={e => setPage({ skip: e.page.skip, take: e.page.take })}
                pageable={{ pageSizes: [10, 25, 50, 75], info: true, previousNext: true }}
                sortable={false}
                groupable={false}
                resizable={true}
                reorderable={true}
                rowRender={rowRender}
                dataItemKey={DATA_ITEM_KEY}
                style={{ height: '100%', width: '100%', fontFamily: 'Inter, sans-serif' }}
              >
                {/* Checkbox selection column — uses stable context-based cells */}
                <GridColumn
                  field={SELECTED_FIELD}
                  width={40}
                  cells={{ data: SelectionCheckboxCell, headerCell: SelectionHeaderCellComp }}
                />
                {visibleColumns.map(col => {
                  const cellMap: Record<string, React.ComponentType<GridCellProps>> = {
                    id: IdCell,
                    status: StatusCell,
                    assignees: AssigneeCell,
                    tier: TierCell,
                  }
                  const cellRenderer = cellMap[col.field]
                  const locked = frozenCol !== null &&
                    visibleColumns.findIndex(c => c.field === col.field) <=
                    visibleColumns.findIndex(c => c.field === frozenCol)

                  // Use stable module-level header cell components
                  const HeaderCellComp = COL_HEADER_CELLS[col.field]

                  return (
                    <GridColumn
                      key={col.field}
                      field={col.field}
                      title={col.title}
                      width={col.width}
                      locked={locked}
                      cells={cellRenderer
                        ? { data: cellRenderer, headerCell: HeaderCellComp }
                        : { headerCell: HeaderCellComp }
                      }
                    />
                  )
                })}
              </Grid>

              {/* Bulk action bar — overlays pagination */}
              {selectedCount > 0 && (
                <div className="bulk-action-bar visible">
                  <span className="bulk-selected-count">{selectedCount} selected</span>
                  <button className="bulk-unselect-btn" onClick={() => setSelectedStateObj({})}>Unselect all</button>
                  <div className="bulk-bar-divider" />
                  <div className="bulk-actions">
                    <button className="bulk-action-btn">
                      <span className="material-symbols-outlined">person_add</span>
                      Assignee
                    </button>
                    <button className="bulk-action-btn">
                      <span className="material-symbols-outlined">assignment_return</span>
                      Return Cases
                    </button>
                    <button className="bulk-action-btn">
                      <span className="material-symbols-outlined">group</span>
                      Reallocate to Team
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Column context menu */}
      {colCtxMenu && (
        <div
          className="col-ctx-menu"
          style={{ position: 'fixed', top: colCtxMenu.y + 2, left: colCtxMenu.x, zIndex: 500 }}
          onClick={e => e.stopPropagation()}
        >
          <button className="col-ctx-item" onClick={() => {
            const { field } = colCtxMenu
            if (!filterFields.find(f => f.field === field)) {
              setFilterFields(prev => [...prev, { field, value: '' }])
            }
            setColCtxMenu(null)
          }}>
            <span className="material-symbols-outlined">filter_alt</span>Filter by this field
          </button>
          <button className="col-ctx-item" onClick={() => {
            const { field } = colCtxMenu
            setSortRules(prev => {
              const exists = prev.find(r => r.field === field)
              if (exists) return prev.map(r => r.field === field ? { ...r, dir: 'desc' } : r)
              return [...prev, { field, dir: 'desc' }]
            })
            setColCtxMenu(null)
          }}>
            <span className="material-symbols-outlined">arrow_downward</span>Sort descending
          </button>
          <button className="col-ctx-item" onClick={() => {
            const { field } = colCtxMenu
            setSortRules(prev => {
              const exists = prev.find(r => r.field === field)
              if (exists) return prev.map(r => r.field === field ? { ...r, dir: 'asc' } : r)
              return [...prev, { field, dir: 'asc' }]
            })
            setColCtxMenu(null)
          }}>
            <span className="material-symbols-outlined">arrow_upward</span>Sort ascending
          </button>
          <div className="col-ctx-divider" />
          <button className="col-ctx-item" onClick={() => {
            applyGroupField(colCtxMenu.field)
            setColCtxMenu(null)
          }}>
            <span className="material-symbols-outlined">view_agenda</span>Group by this field
          </button>
          <div className="col-ctx-divider" />
          {frozenCol === colCtxMenu.field ? (
            <button className="col-ctx-item" onClick={() => { setFrozenCol(null); setColCtxMenu(null) }}>
              <span className="material-symbols-outlined">border_clear</span>Unfreeze column
            </button>
          ) : (
            <button className="col-ctx-item" onClick={() => { setFrozenCol(colCtxMenu.field); setColCtxMenu(null) }}>
              <span className="material-symbols-outlined">border_left</span>Freeze column
            </button>
          )}
          <div className="col-ctx-divider" />
          {pinnedCols.has(colCtxMenu.field) ? (
            <button className="col-ctx-item" onClick={() => unpinColumn(colCtxMenu.field)}>
              <span className="material-symbols-outlined">push_pin</span>Unpin column
            </button>
          ) : (
            <button className="col-ctx-item" onClick={() => pinColumn(colCtxMenu.field)}>
              <span className="material-symbols-outlined">push_pin</span>Pin column
            </button>
          )}
        </div>
      )}
    </div>
    </ColMenuContext.Provider>
    </PinCtx.Provider>
    </SelectionCtx.Provider>
  )
}

// ── KPI progress segment with tooltip ─────────────────────────────

function KpiSegment({ flex, bg, tooltip }: { flex: number; bg: string; tooltip: string }) {
  const [show, setShow] = useState(false)
  return (
    <div
      style={{ flex, background: bg, borderRadius: 2, minWidth: 4, position: 'relative' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {show && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 7px)', left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', color: '#fff', fontSize: 11, fontWeight: 500,
          padding: '4px 8px', borderRadius: 5, whiteSpace: 'nowrap', zIndex: 200,
          pointerEvents: 'none'
        }}>
          {tooltip}
        </div>
      )}
    </div>
  )
}

// ── Column Header with ··· menu button ─────────────────────────────

import type { GridThAttributes } from '@progress/kendo-react-grid'

function ColHeader(props: {
  field: string
  title: string
  thProps?: GridThAttributes | null
  onMenuClick: (e: React.MouseEvent, field: string) => void
  children?: React.ReactNode
}) {
  const pinnedCols = React.useContext(PinCtx)
  const isPinned = pinnedCols.has(props.field)
  return (
    <th {...(props.thProps ?? {})}>
      <div className="th-inner" style={{ display: 'flex', alignItems: 'center', userSelect: 'none', width: '100%' }}>
        {isPinned && <span className="material-symbols-outlined" style={{ fontSize: 13, color: '#888', marginRight: 2, flexShrink: 0 }}>push_pin</span>}
        {props.children}
        <button
          className="th-menu-btn"
          title="Column options"
          onClick={e => { e.stopPropagation(); props.onMenuClick(e, props.field) }}
        >···</button>
      </div>
    </th>
  )
}

// ── Style helpers ─────────────────────────────────────────────────

function sidebarBtnStyle(active = false): React.CSSProperties {
  return {
    width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: active ? '#fff' : '#888', border: 'none',
    background: active ? '#2a2a2a' : 'none', borderRadius: 8, cursor: 'pointer', flexShrink: 0
  }
}

function dividerStyle(): React.CSSProperties {
  return { width: 24, height: 1, background: '#333', margin: '2px 0', flexShrink: 0 }
}

function topbarIconBtn(): React.CSSProperties {
  return {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: 'none', background: 'none', cursor: 'pointer', borderRadius: 6, color: 'var(--text-secondary)'
  }
}

function kpiCardStyle(type: 'main' | 'sub'): React.CSSProperties {
  return {
    border: '1px solid var(--border)', borderRadius: 10,
    padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8,
    flex: type === 'main' ? 2.5 : 1, minWidth: 0
  }
}
