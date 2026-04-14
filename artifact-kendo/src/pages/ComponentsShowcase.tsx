import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Grid, GridColumn } from '@progress/kendo-react-grid'
import type { GridDataStateChangeEvent } from '@progress/kendo-react-grid'
import { process } from '@progress/kendo-data-query'
import type { DataResult, State } from '@progress/kendo-data-query'
import { DatePicker } from '@progress/kendo-react-dateinputs'
import { DropDownList } from '@progress/kendo-react-dropdowns'
import { Button } from '@progress/kendo-react-buttons'
import { Input, TextArea } from '@progress/kendo-react-inputs'
import { Loader, Skeleton } from '@progress/kendo-react-indicators'
import { Tooltip } from '@progress/kendo-react-tooltip'
import { assignedData } from '../data'
import '../kendo-overrides.css'

const SECTIONS = [
  { id: 'grid', label: 'Grid' },
  { id: 'datepicker', label: 'DatePicker' },
  { id: 'dropdown', label: 'DropDownList' },
  { id: 'button', label: 'Button' },
  { id: 'input', label: 'Input' },
  { id: 'tooltip', label: 'Tooltip' },
  { id: 'indicators', label: 'Indicators' },
]

const CodeBlock = ({ code }: { code: string }) => (
  <pre style={{
    background: '#f6f6f6', border: '1px solid #e0e0e0', borderRadius: 8,
    padding: '14px 16px', fontSize: 12, fontFamily: 'ui-monospace, Consolas, monospace',
    overflowX: 'auto', color: '#333', margin: 0, lineHeight: 1.6
  }}>{code}</pre>
)

const SectionCard = ({ id, title, description, children, code }: {
  id: string; title: string; description: string; children: React.ReactNode; code: string
}) => (
  <div id={id} style={{ border: '1px solid #e0e0e0', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
    <div style={{ padding: '20px 24px', borderBottom: '1px solid #eeeeee' }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a', marginBottom: 6 }}>{title}</h2>
      <p style={{ fontSize: 13, color: '#7a7a7a', margin: 0 }}>{description}</p>
    </div>
    <div style={{ padding: '24px', borderBottom: '1px solid #eeeeee' }}>
      {children}
    </div>
    <div style={{ padding: '16px 24px', background: '#fafafa' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Usage</div>
      <CodeBlock code={code} />
    </div>
  </div>
)

// ── Grid section ──────────────────────────────────────────────────

const GridSection = () => {
  const init: State = { skip: 0, take: 5 }
  const [ds, setDs] = useState<State>(init)
  const [gd, setGd] = useState<DataResult>(process(assignedData, init))
  return (
    <SectionCard
      id="grid"
      title="Grid"
      description="A full-featured data grid with sorting, paging, and custom cell renderers."
      code={`import { Grid, GridColumn } from '@progress/kendo-react-grid'
import { process } from '@progress/kendo-data-query'

<Grid
  data={process(data, dataState)}
  {...dataState}
  onDataStateChange={e => setDataState(e.dataState)}
  pageable sortable
>
  <GridColumn field="id" title="ID" />
  <GridColumn field="name" title="Case Name" />
  <GridColumn field="status" title="Status" />
</Grid>`}
    >
      <Grid
        data={gd}
        {...ds}
        onDataStateChange={(e: GridDataStateChangeEvent) => { setDs(e.dataState); setGd(process(assignedData, e.dataState)) }}
        pageable={{ pageSizes: [5, 10] }}
        sortable
        style={{ height: 350 }}
      >
        <GridColumn field="id" title="ID" width={110} />
        <GridColumn field="name" title="Case Name" width={180} />
        <GridColumn field="tier" title="Tier" width={90} />
        <GridColumn field="status" title="Status" width={120} />
        <GridColumn field="client" title="Client" width={140} />
      </Grid>
    </SectionCard>
  )
}

// ── DatePicker section ────────────────────────────────────────────

const DatePickerSection = () => {
  const [date, setDate] = useState<Date | null>(new Date())
  return (
    <SectionCard
      id="datepicker"
      title="DatePicker"
      description="An interactive date picker with calendar popup, keyboard navigation, and format support."
      code={`import { DatePicker } from '@progress/kendo-react-dateinputs'

<DatePicker
  value={date}
  onChange={e => setDate(e.value)}
  format="MMM dd, yyyy"
/>`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Default</div>
          <DatePicker value={date} onChange={e => setDate(e.value)} format="MMM dd, yyyy" />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Selected value</div>
          <div style={{ fontSize: 14, color: '#1a1a1a', padding: '8px 0' }}>
            {date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'None'}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Disabled</div>
          <DatePicker value={new Date()} disabled />
        </div>
      </div>
    </SectionCard>
  )
}

// ── DropDownList section ──────────────────────────────────────────

const DropDownSection = () => {
  const tiers = ['All Tiers', 'Tier 1', 'Tier 2', 'Tier 3']
  const statuses = ['All', 'pending', 'On progress', 'Stuck', 'completed']
  const [tier, setTier] = useState('All Tiers')
  const [status, setStatus] = useState('All')
  return (
    <SectionCard
      id="dropdown"
      title="DropDownList"
      description="A dropdown selection component with searchable options and keyboard support."
      code={`import { DropDownList } from '@progress/kendo-react-dropdowns'

<DropDownList
  data={['Tier 1', 'Tier 2', 'Tier 3']}
  value={value}
  onChange={e => setValue(e.value)}
/>`}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Tier Filter</div>
          <DropDownList data={tiers} value={tier} onChange={e => setTier(e.value)} style={{ width: 180 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Status Filter</div>
          <DropDownList data={statuses} value={status} onChange={e => setStatus(e.value)} style={{ width: 180 }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Disabled</div>
          <DropDownList data={tiers} value="Tier 1" disabled style={{ width: 180 }} />
        </div>
      </div>
    </SectionCard>
  )
}

// ── Button section ────────────────────────────────────────────────

const ButtonSection = () => {
  const [clicked, setClicked] = useState(false)
  return (
    <SectionCard
      id="button"
      title="Button"
      description="Buttons in various themes and states: default, primary, flat, and disabled."
      code={`import { Button } from '@progress/kendo-react-buttons'

<Button themeColor="primary" onClick={handler}>Primary</Button>
<Button themeColor="base">Secondary</Button>
<Button fillMode="flat">Flat</Button>
<Button disabled>Disabled</Button>`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <Button themeColor="primary" onClick={() => setClicked(!clicked)}>
          {clicked ? 'Clicked!' : 'Primary'}
        </Button>
        <Button themeColor="base">Secondary</Button>
        <Button fillMode="flat">Flat</Button>
        <Button fillMode="outline" themeColor="primary">Outline</Button>
        <Button disabled>Disabled</Button>
        <Button themeColor="error">Error</Button>
        <Button icon="plus" themeColor="primary">With Icon</Button>
      </div>
    </SectionCard>
  )
}

// ── Input section ─────────────────────────────────────────────────

const InputSection = () => {
  const [text, setText] = useState('')
  const [area, setArea] = useState('')
  return (
    <SectionCard
      id="input"
      title="Input"
      description="Text inputs and textarea for form data entry with validation states."
      code={`import { Input, TextArea } from '@progress/kendo-react-inputs'

<Input
  placeholder="Search cases..."
  value={text}
  onChange={e => setText(e.value)}
/>
<TextArea
  value={area}
  onChange={e => setArea(e.value)}
  rows={3}
/>`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Text Input</div>
          <Input
            placeholder="Search cases..."
            value={text}
            onChange={e => setText(e.value as string)}
            style={{ width: '100%' }}
          />
          {text && <div style={{ fontSize: 12, color: '#474747', marginTop: 6 }}>Value: "{text}"</div>}
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>Disabled Input</div>
          <Input value="Read-only value" disabled style={{ width: '100%' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 8 }}>TextArea</div>
          <TextArea
            value={area}
            onChange={e => setArea(e.value as string)}
            rows={3}
            placeholder="Enter case notes..."
            style={{ width: '100%' }}
          />
        </div>
      </div>
    </SectionCard>
  )
}

// ── Tooltip section ───────────────────────────────────────────────

const TooltipSection = () => (
  <SectionCard
    id="tooltip"
    title="Tooltip"
    description="Contextual tooltips triggered on hover, with configurable position and content."
    code={`import { Tooltip } from '@progress/kendo-react-tooltip'

<Tooltip anchorElement="target" position="top">
  <button title="This is a tooltip">Hover me</button>
</Tooltip>`}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', paddingBottom: 40 }}>
      <Tooltip anchorElement="target" position="top">
        <button
          title="This tooltip appears on top"
          style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: '#fff' }}
        >
          Top tooltip
        </button>
      </Tooltip>
      <Tooltip anchorElement="target" position="bottom">
        <button
          title="This tooltip appears on bottom"
          style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: '#fff' }}
        >
          Bottom tooltip
        </button>
      </Tooltip>
      <Tooltip anchorElement="target" position="right">
        <button
          title="Case #100002: _doronELgraph — Tier 1 — Intake"
          style={{ padding: '8px 16px', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 13, background: '#fff' }}
        >
          Right tooltip (with content)
        </button>
      </Tooltip>
    </div>
  </SectionCard>
)

// ── Indicators section ────────────────────────────────────────────

const IndicatorsSection = () => {
  const [loading, setLoading] = useState(false)
  return (
    <SectionCard
      id="indicators"
      title="Indicators"
      description="Loading spinners and skeleton placeholders for async states."
      code={`import { Loader, Skeleton } from '@progress/kendo-react-indicators'

// Spinner
<Loader size="medium" type="converging-spinner" />

// Skeleton
<Skeleton shape="rectangle" style={{ width: 200, height: 20 }} />`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 16 }}>Spinner variants</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <Loader size="small" type="converging-spinner" />
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Small</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Loader size="medium" type="converging-spinner" />
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Medium</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Loader size="large" type="converging-spinner" />
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Large</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Loader size="medium" type="pulsing" />
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Pulsing</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Loader size="medium" type="infinite-spinner" />
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>Infinite</div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 16 }}>Skeleton placeholders</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 400 }}>
            <Skeleton shape="text" style={{ width: '60%', height: 16 }} />
            <Skeleton shape="text" style={{ width: '90%', height: 16 }} />
            <Skeleton shape="text" style={{ width: '75%', height: 16 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Skeleton shape="circle" style={{ width: 40, height: 40 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Skeleton shape="text" style={{ width: '80%', height: 14 }} />
                <Skeleton shape="text" style={{ width: '50%', height: 14 }} />
              </div>
            </div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginBottom: 16 }}>Interactive loading state</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Button themeColor="primary" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }} disabled={loading}>
              {loading ? 'Loading...' : 'Simulate Load'}
            </Button>
            {loading && <Loader size="small" type="converging-spinner" />}
            {!loading && <span style={{ fontSize: 13, color: '#7a7a7a' }}>Click to see loading state</span>}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}

// ── Main ComponentsShowcase ───────────────────────────────────────

export default function ComponentsShowcase() {
  const [active, setActive] = useState('grid')

  const scrollTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Inter, sans-serif', background: '#f6f6f6', width: '100%' }}>

      {/* Sidebar nav */}
      <div style={{
        width: 220, background: '#ffffff', borderRight: '1px solid #e0e0e0',
        display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '20px 20px 16px' }}>
          <Link to="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
            color: '#474747', textDecoration: 'none', marginBottom: 20
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_back</span>
            Back to Portal
          </Link>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#1a1a1a' }}>KendoReact</div>
          <div style={{ fontSize: 12, color: '#7a7a7a', marginTop: 2 }}>Component Showcase</div>
        </div>
        <div style={{ padding: '0 8px', flex: 1 }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              style={{
                width: '100%', textAlign: 'left', padding: '9px 14px',
                border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 13, fontFamily: 'inherit',
                background: active === s.id ? '#1a1a1a' : 'none',
                color: active === s.id ? '#ffffff' : '#474747',
                fontWeight: active === s.id ? 500 : 400,
                marginBottom: 2
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ marginBottom: 8 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 6 }}>KendoReact Components</h1>
            <p style={{ fontSize: 14, color: '#7a7a7a' }}>
              Live interactive demos of KendoReact UI components used in the Genpact Visio portal.
            </p>
          </div>
          <GridSection />
          <DatePickerSection />
          <DropDownSection />
          <ButtonSection />
          <InputSection />
          <TooltipSection />
          <IndicatorsSection />
        </div>
      </div>
    </div>
  )
}
