"use client";

import { AlertTriangle, BarChart3, Building2, CalendarDays, CheckCircle2, ChevronDown, CircleDollarSign, ClipboardCheck, HardHat, LayoutDashboard, Menu, PackageCheck, Search, Settings2, ShieldCheck, Store, TrendingDown, X } from "lucide-react";
import { useState } from "react";

type ViewId = "dashboard" | "catalog" | "suppliers" | "projects";
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
const suppliers = [
  { name: "Ateliê Norte Arquitetura", specialty: "Arquitetura e interiores", active: 3, rating: "4,9" },
  { name: "Base Engenharia", specialty: "Fundações e contenções", active: 1, rating: "4,7" },
  { name: "Concreta Estruturas", specialty: "Estruturas de concreto", active: 2, rating: "4,8" },
  { name: "Atria Sistemas", specialty: "Elétrica, dados e automação", active: 2, rating: "4,6" },
];
const groups = [
  { label: "Pré-obra", items: [{ id: "catalog" as const, label: "Etapas e serviços", icon: ClipboardCheck }, { id: "suppliers" as const, label: "Fornecedores", icon: Store }, { id: "projects" as const, label: "Cadastro da obra", icon: Building2 }] },
  { label: "Execução da obra", items: [{ id: "dashboard" as const, label: "Painel da obra", icon: LayoutDashboard }], planned: ["Compras", "Pagamentos", "Cronograma", "Diário e qualidade"] },
  { label: "Pós-obra", items: [], planned: ["Entrega e garantias", "Venda", "Memorial da obra"] },
];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 * Primeira fatia da interface React. Os dados são uma demonstração identificada
 * e não são gravados no navegador; a API será a fonte oficial de valores e acesso.
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
        <div className="project-switcher">
          <label htmlFor="obra-ativa">Obra ativa</label>
          <div className="select-wrap"><select id="obra-ativa" value={projectId} onChange={(event) => setProjectId(event.target.value)}>{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown aria-hidden="true" size={16} /></div>
          <span className="project-location">{project.city}</span>
        </div>
        <div className="topbar-actions">
          <label className="search-box"><span className="sr-only">Pesquisar</span><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar" /></label>
          <div className="user-chip" aria-label="Usuário atual: Paulo, administrador"><span>PS</span><div><strong>Paulo</strong><small>Administrador</small></div></div>
        </div>
      </header>
      <main id="conteudo" className="content" tabIndex={-1}>
        <div className="demo-notice"><ShieldCheck size={16} /> Ambiente de demonstração — dados fictícios, sem persistência</div>
        {view === "dashboard" && <Dashboard projectName={project.name} />}
        {view === "catalog" && <Catalog query={query} />}
        {view === "suppliers" && <Suppliers query={query} />}
        {view === "projects" && <Projects selectedId={projectId} onSelect={setProjectId} />}
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

function Catalog({ query }: { query: string }) {
  const visible = stages.filter((item) => `${item.name} ${item.supplier}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="Pré-obra" title="Etapas e serviços" description="Estrutura base para configurar pesos, prazos e fornecedores de cada obra." action={<button className="primary-button" type="button" disabled title="Integração com a API pendente">Nova etapa</button>} /><div className="summary-strip"><div><ClipboardCheck /><span><b>18</b> etapas</span></div><div><PackageCheck /><span><b>146</b> serviços</span></div><div><TrendingDown /><span><b>100%</b> dos pesos</span></div></div><section className="panel table-panel"><div className="panel-heading"><div><span>Configuração da obra</span><h2>Etapas selecionadas</h2></div><Settings2 size={21} /></div><div className="responsive-table"><table><thead><tr><th>Etapa</th><th>Fornecedor</th><th>Conclusão</th><th>Término</th><th>Situação</th></tr></thead><tbody>{visible.map((stage) => <tr key={stage.name}><td><strong>{stage.name}</strong></td><td>{stage.supplier}</td><td><div className="inline-progress"><span style={{ width: `${stage.progress}%` }} /></div><small>{stage.progress}%</small></td><td>{stage.end}</td><td><Status value={stage.status} /></td></tr>)}</tbody></table></div></section></>;
}

function Suppliers({ query }: { query: string }) {
  const visible = suppliers.filter((item) => `${item.name} ${item.specialty}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="Pré-obra" title="Fornecedores" description="Empresas e profissionais qualificados para etapas, serviços e compras." action={<button className="primary-button" type="button" disabled title="Integração com a API pendente">Novo fornecedor</button>} /><section className="supplier-grid">{visible.map((supplier) => <article className="supplier-card" key={supplier.name}><div className="supplier-avatar"><Store size={22} /></div><div><h2>{supplier.name}</h2><p>{supplier.specialty}</p></div><dl><div><dt>Contratos ativos</dt><dd>{supplier.active}</dd></div><div><dt>Avaliação</dt><dd>{supplier.rating}</dd></div></dl><span className="verified"><ShieldCheck size={15} /> Cadastro verificado</span></article>)}</section></>;
}

function Projects({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  return <><PageHeading eyebrow="Cadastro da obra" title="Carteira de obras" description="Selecione uma obra para definir o contexto global do sistema." action={<button className="primary-button" type="button" disabled title="Integração com a API pendente">Nova obra</button>} /><section className="project-grid">{projects.map((project) => <button type="button" className={`project-card ${selectedId === project.id ? "selected" : ""}`} key={project.id} onClick={() => onSelect(project.id)}><span className="project-cover"><Building2 size={32} /></span><span className="project-copy"><small>{project.status}</small><strong>{project.name}</strong><span>{project.city}</span><span className="project-stats"><b>{project.id === "jardins" ? "38,4%" : "4,0%"}</b> concluído</span></span>{selectedId === project.id && <CheckCircle2 className="selected-check" size={21} />}</button>)}</section></>;
}

function Status({ value }: { value: string }) {
  const style = value === "No prazo" ? "status-ok" : value === "Atenção" ? "status-warn" : "status-neutral";
  return <span className={`status ${style}`}>{value}</span>;
}
