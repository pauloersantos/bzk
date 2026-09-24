"use client";

import { AlertTriangle, BarChart3, Building2, CalendarDays, CheckCircle2, ChevronDown, CircleDollarSign, ClipboardCheck, HardHat, LayoutDashboard, Menu, Search, ShieldCheck, Store, X } from "lucide-react";
import { useState } from "react";
import { CatalogManager, ProjectsManager, SuppliersManager } from "./preobra-managers";
import { Contracts, InitialBudget, ProjectConfiguration, ProjectDocuments } from "./project-registration";

type ViewId = "dashboard" | "catalog" | "suppliers" | "projects" | "project-config" | "project-documents" | "initial-budget" | "contracts";
const projects = [
  { id: "jardins", name: "Residência Jardins", city: "São Paulo, SP", status: "Em execução" },
  { id: "boa-vista", name: "Casa Boa Vista", city: "Porto Feliz, SP", status: "Planejamento" },
];
const stages = [
  { name: "Projetos e aprovações", supplier: "Ateliê Norte Arquitetura", progress: 92, end: "18/10/2026", status: "No prazo" },
  { name: "Fundações e contenções", supplier: "Base Engenharia", progress: 68, end: "12/12/2026", status: "Atenção" },
  { name: "Estrutura", supplier: "Concreta Estruturas", progress: 34, end: "28/02/2027", status: "No prazo" },
  { name: "Instalações", supplier: "Atria Sistemas", progress: 8, end: "30/06/2027", status: "Planejada" },
];
const groups = [
  { label: "Pré-obra", items: [{ id: "catalog" as const, label: "Etapas e serviços", icon: ClipboardCheck }, { id: "suppliers" as const, label: "Fornecedores", icon: Store }] },
  { label: "Cadastro da obra", items: [{ id: "projects" as const, label: "Obras", icon: Building2 }, { id: "project-config" as const, label: "Configurações da obra", icon: ClipboardCheck }, { id: "project-documents" as const, label: "Projetos e documentação", icon: ShieldCheck }, { id: "initial-budget" as const, label: "Orçamento inicial", icon: CircleDollarSign }, { id: "contracts" as const, label: "Contratos e aditivos", icon: ClipboardCheck }] },
  { label: "Execução da obra", items: [{ id: "dashboard" as const, label: "Painel da obra", icon: LayoutDashboard }], planned: ["Compras", "Pagamentos", "Cronograma", "Diário e qualidade"] },
  { label: "Pós-obra", items: [], planned: ["Entrega e garantias", "Venda", "Memorial da obra"] },
];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Interface responsiva: os cadastros de Pré-Obra usam a API como fonte oficial.
 * O painel de Execução ainda contém indicadores demonstrativos identificados.
 */
export function BomzeikaApp() {
  const [view, setView] = useState<ViewId>("dashboard");
  const [projectId, setProjectId] = useState(projects[0].id);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState("");
  const project = projects.find((item) => item.id === projectId) ?? projects[0];
  const navigate = (next: ViewId) => { setView(next); setMobileMenu(false); };

  return <div className="app-shell">
    <a className="skip-link" href="#conteudo">Ir para o conteúdo</a>
    <Sidebar view={view} open={mobileMenu} onClose={() => setMobileMenu(false)} onNavigate={navigate} />
    <div className="app-workspace">
      <header className="topbar">
        <button className="icon-button mobile-only" type="button" aria-label="Abrir menu" onClick={() => setMobileMenu(true)}><Menu size={21} /></button>
        {view === "dashboard" ? <div className="project-switcher">
          <label htmlFor="obra-ativa">Obra ativa</label>
          <div className="select-wrap"><select id="obra-ativa" value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown aria-hidden="true" size={16} /></div>
          <span className="project-location">{project.city}</span>
        </div> : <div className="module-context"><strong>Pré-obra</strong><span>Cadastros gerais, sem vínculo com obra ativa</span></div>}
        <div className="topbar-actions">
          <label className="search-box"><span className="sr-only">Pesquisar</span><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar" /></label>
          <div className="user-chip" aria-label="Usuário atual: Paulo, administrador"><span>PS</span><div><strong>Paulo</strong><small>Administrador</small></div></div>
        </div>
      </header>
      <main id="conteudo" className="content" tabIndex={-1}>
        <div className="demo-notice"><ShieldCheck size={16} /> Ambiente local de desenvolvimento — cadastros persistidos no PostgreSQL</div>
        {view === "dashboard" && <Dashboard projectName={project.name} />}
        {view === "catalog" && <CatalogManager query={query} />}
        {view === "suppliers" && <SuppliersManager query={query} />}
        {view === "projects" && <ProjectsManager query={query} />}
        {view === "project-config" && <ProjectConfiguration />}
        {view === "project-documents" && <ProjectDocuments />}
        {view === "initial-budget" && <InitialBudget />}
        {view === "contracts" && <Contracts />}
      </main>
    </div>
  </div>;
}

function Sidebar({ view, open, onClose, onNavigate }: { view: ViewId; open: boolean; onClose: () => void; onNavigate: (view: ViewId) => void }) {
  return <>{open && <button className="sidebar-backdrop" aria-label="Fechar menu" onClick={onClose} />}<aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Navegação principal">
    <div className="brand"><span className="brand-mark"><HardHat size={22} /></span><div><strong>BOMzeika</strong><small>OBRAS</small></div></div>
    <button className="icon-button close-menu mobile-only" type="button" aria-label="Fechar menu" onClick={onClose}><X size={20} /></button>
    <nav>{groups.map((group) => <section className="nav-group" key={group.label}><h2>{group.label}</h2>{group.items.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" className={view === item.id ? "nav-active" : ""} aria-current={view === item.id ? "page" : undefined} onClick={() => onNavigate(item.id)}><Icon size={18} /><span>{item.label}</span></button>; })}{group.planned?.map((item) => <div className="nav-planned" key={item}><span>{item}</span><small>em breve</small></div>)}</section>)}</nav>
    <div className="sidebar-footer"><ShieldCheck size={17} /><span>Sessão protegida</span></div>
  </aside></>;
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Dashboard({ projectName }: { projectName: string }) {
  const metrics = [
    { label: "Orçamento aprovado", value: money.format(12_500_000), note: "Base vigente", tone: "navy" },
    { label: "Contratado", value: money.format(7_840_000), note: "62,7% do orçamento", tone: "blue" },
    { label: "Executado", value: money.format(3_215_000), note: "25,7% reconhecido", tone: "cyan" },
    { label: "Pago", value: money.format(2_760_000), note: "Saldo: R$ 455 mil", tone: "slate" },
  ];
  return <><PageHeading eyebrow="Visão executiva" title={projectName} description="Acompanhe custo, avanço físico e riscos na mesma data de corte." action={<div className="date-chip"><CalendarDays size={16} /> 23/09/2026</div>} />
    <section className="metric-grid" aria-label="Indicadores financeiros">{metrics.map((metric) => <article className={`metric-card metric-${metric.tone}`} key={metric.label}><p>{metric.label}</p><strong>{metric.value}</strong><span>{metric.note}</span></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel progress-panel"><div className="panel-heading"><div><span>Avanço ponderado</span><h2>Progresso por etapa</h2></div><strong>38,4%</strong></div><div className="stage-bars">{stages.map((stage) => <div key={stage.name}><div><span>{stage.name}</span><b>{stage.progress}%</b></div><div className="progress-track"><span style={{ width: `${stage.progress}%` }} /></div></div>)}</div></article>
      <article className="panel cash-panel"><div className="panel-heading"><div><span>Fluxo mensal</span><h2>Previsto e realizado</h2></div><BarChart3 size={22} /></div><div className="bar-chart" aria-label="Gráfico demonstrativo do fluxo mensal">{[42, 56, 68, 73, 64, 88].map((height, index) => <div key={index}><span className="bar-plan" style={{ height: `${height}%` }} /><span className="bar-real" style={{ height: `${Math.max(18, height - 14)}%` }} /><small>{["Set", "Out", "Nov", "Dez", "Jan", "Fev"][index]}</small></div>)}</div><div className="chart-legend"><span><i className="legend-plan" /> Previsto</span><span><i className="legend-real" /> Realizado</span></div></article>
      <article className="panel risk-panel"><div className="panel-heading"><div><span>Controle</span><h2>Riscos que pedem atenção</h2></div><AlertTriangle size={22} /></div><ul className="risk-list"><li><span className="risk-icon high"><AlertTriangle size={17} /></span><div><strong>Contenção — prazo de insumo</strong><p>Entrega prevista com 8 dias de impacto.</p></div><b>Alto</b></li><li><span className="risk-icon medium"><CircleDollarSign size={17} /></span><div><strong>Esquadrias — proposta vence amanhã</strong><p>Economia potencial de R$ 86 mil.</p></div><b>Médio</b></li><li><span className="risk-icon ok"><CheckCircle2 size={17} /></span><div><strong>Documentação municipal</strong><p>Licenças obrigatórias conferidas.</p></div><b>Regular</b></li></ul></article>
    </section></>;
}

