# Especificação de produto — v1 para revisão

## Resultado esperado

Administrar uma ou várias obras residenciais de alto padrão, conciliando escopo, prazo, contratação, execução, venda e caixa. O primeiro cadastro do sistema é o catálogo reutilizável de etapas, serviços e fornecedores; depois o usuário cria uma ou várias obras selecionando e configurando esse catálogo. Cada número deve permitir chegar aos registros que o compõem. Dados demonstrativos devem ser separados das obras reais.

## Usuários

| Perfil | Responsabilidade | Limite proposto |
|---|---|---|
| Administrador da organização | Cadastro e acessos | Não altera histórico financeiro aprovado |
| Gestor | Planejamento, orçamento e contratação | Aprova dentro da alçada configurada |
| Financeiro | Obrigações, baixas e conciliação | Não aprova a própria exceção financeira |
| Responsável técnico | Medições, inspeções e diário | Acesso financeiro conforme concessão |
| Proprietário | Visão executiva e aprovações | Apenas obras às quais pertence |
| Fornecedor | Propostas, documentos e medições compartilhadas | Sem orçamento global, concorrentes ou outros contratos |

Papéis podem ser combinados, mas a regra de dupla aprovação para exceções deve ser configurável. A alçada é definida pelo proprietário, não pelo sistema. Membership por organização não concede automaticamente acesso a todas as obras.

## Ordem de configuração

1. **Catálogo-base:** cadastrar e versionar etapas, subetapas, serviços, unidades, categorias de custo, centros de custo e fornecedores/prestadores.
2. **Cadastro da obra:** criar uma ou várias obras; selecionar as etapas e serviços aplicáveis; definir pesos, ambientes, responsáveis, datas, fornecedores e custos específicos.
3. **Configuração da obra:** definir pré-requisitos, documentos, alçadas, categorias financeiras, contratos e regras de aprovação.
4. **Execução:** acompanhar cronograma, medições, diário, qualidade, documentos, compromissos, pagamentos e desvios.
5. **Pós-obra:** acompanhar entrega, garantias, manutenção e eventual venda, incluindo marketing, corretoras, comissões e relatórios comerciais.

## Mapa funcional e prioridade de entrega

P0 = primeira fatia operacional; P1 = completar o escopo; P2 = expansão opcional. P1 continua sendo parte do pedido original.

| ID | Capacidade | Entrega | Aceite principal |
|---|---|---|---|
| RF01 | Obras, participantes, ambientes, etapas e centros de custo | P0 | Obra A não acessa registros da B sem concessão |
| RF01A | Pré-requisitos e documentos de pré-obra | P0 | Obra pode ser criada com checklist por categoria e pendências visíveis |
| RF01B | Etapas e serviços configuráveis por obra | P0 | Gestor seleciona um template e edita etapas, serviços, datas, fornecedor e custos |
| RF02 | Orçamento hierárquico, composições, versões e contingência | P0 | Linha de base aprovada não é sobrescrita |
| RF03 | Solicitação, propostas, mapa comparativo e escolha | P0 | Propostas distintas em escopo ficam sinalizadas |
| RF04 | Contratos, compras diretas, parcelas, aditivos e supressões | P0 | Histórico original permanece; excedente requer autorização |
| RF05 | Medições e recebimentos parciais | P0 | Quantidade/valor acumulado não excede limite autorizado |
| RF06 | Obrigações, adiantamentos, retenções, baixas e estornos | P0 | Retry ou clique duplo não duplica lançamento |
| RF07 | Projeção final, desvios, caixa e prestação de contas | P0 | Totais reconciliam com os registros de origem |
| RF08 | Cronograma, dependências, Gantt, calendário e curva S | P1 | Alteração de prazo mostra atividades afetadas |
| RF09 | Diário, fotos, inspeções, não conformidades e pendências | P1 | Registro indica autor, data, etapa e ambiente |
| RF10 | Mudanças de escopo e especificações de acabamento | P1 | Impacto de mudança pendente não vira aprovado |
| RF11 | Documentos, versões, comentários e notificações internas | P0 base/P1 completo | Download exige autorização por obra e vínculo |
| RF12 | Importação XLSX/CSV, exportações XLSX/PDF e relatórios | P1 | Prévia valida linhas antes de gravar; exportação respeita filtros |
| RF13 | Perfis, alçadas, auditoria, backups e restauração | P0 | Testes negativos de acesso e ensaio de restauração |
| RF14 | Busca e filtros salvos; cenários de custo | P1 | Filtros não alteram a origem dos dados; cenários não mudam baseline |
| RF15 | Integrações externas, OCR e previsões por IA | P2 | Só incluir após pedido e especificação própria |
| RF16 | Catálogo global de etapas, serviços e fornecedores | P0 | Cadastro reutilizável em várias obras; cada obra personaliza a seleção |
| RF17 | Pós-obra, venda e custos comerciais | P1 | Marketing, corretora, comissão, venda, entrega, garantias e relatórios |

## Estrutura da obra

Organização → obra → etapa → subetapa → item. Ambiente é uma dimensão adicional; uma alocação pode distribuir um item entre ambientes com soma de 100%. Cadastro de fornecedor é da organização, com dados restritos. Anexos e rateios sempre mantêm vínculo à obra e ao documento de origem.

Template inicial editável: estudos e sondagem; arquitetura/interiores/projetos; licenças; canteiro/demolições; terraplenagem/contenções; fundações; estrutura; vedações; cobertura; impermeabilização; hidráulica/sanitária/gás; elétrica; climatização/aquecimento/solar; automação/dados/segurança; esquadrias/vidros/fachada; contrapisos/revestimentos/pedras; forros/pintura; louças/metais/iluminação; marcenaria/mobiliário; piscina/gourmet/paisagismo; testes/limpeza/vistorias; entrega/garantias. Custos indiretos, administração, locações e consumo ficam identificados; contingência fica separada dos serviços.

### Cadastro de etapas e serviços

Na criação da obra, o gestor escolhe um template de etapas e serviços. Cada etapa pode ser ativada, desativada, reordenada e editada; serviços podem ser adicionados, duplicados, excluídos antes de qualquer lançamento ou encerrados com histórico depois de usados. Cada registro contém código, nome, descrição, ambiente, unidade, quantidade, fornecedor/prestador, responsável, data planejada de início e término, datas reais, custo previsto, contratado, executado, pago, peso físico e status.

O percentual de conclusão de cada serviço avança por marcos de 0%, 25%, 50%, 75% e 100%, com opção de percentual livre justificado quando a medição permitir. Status e percentual devem ser coerentes: planejado = 0%; em contratação = 0%; contratado = 0%; em execução = 1%–99%; concluído = 100%; suspenso mantém percentual e registra motivo; cancelado não participa do avanço futuro, mas conserva o histórico. Uma etapa é calculada pelo peso de seus serviços; a obra é calculada pela soma dos pesos das etapas, configurados na baseline e normalizados para 100%. O sistema deve mostrar “não calculável” enquanto os pesos não totalizarem 100%.

O avanço da obra é físico e ponderado, nunca derivado apenas de pagamento. Deve ser possível consultar o avanço por período, etapa e serviço, além de comparar avanço planejado versus realizado. Alterar pesos após o início exige nova versão da baseline e preserva os percentuais anteriores.

### Pré-obra e pré-requisitos

Antes da execução, a obra tem uma área de pré-requisitos com categorias configuráveis: aquisição/custo do terreno; contrato de compra e venda; projetos; licenças e aprovações da prefeitura; ligação de luz; ligação de água; taxas; condomínio; seguros; sondagem; topografia; ART/RRT; matrícula e documentos do imóvel; orçamento preliminar. Cada requisito tem responsável, status (pendente, recebido, em análise, aprovado, vencido ou dispensado), data limite, data de recebimento, observação, documento e dependência.

### Pós-obra e venda

O grupo Pós-obra começa após a conclusão ou entrega e inclui vistoria final, documentação, garantias, manutenção, assistência e venda. A venda possui imóvel/unidade, preço de anúncio, preço de venda, comprador, canal, corretora, corretor, comissão prevista, comissão paga, marketing, fotos e documentos comerciais. Marketing, corretoras e comissões ficam em categorias próprias e não alteram o custo de construção; relatórios comerciais mostram receita, despesas de venda, margem bruta e resultado líquido. Dados de comprador e contrato têm acesso restrito.

### Visão financeira ampliada

O financeiro separa **pré-obra**, **construção** e **custos gerais**. Pré-obra inclui terreno, projetos, condomínio, taxas, licenças, seguros, sondagem e aprovações. Construção usa os itens e etapas cadastrados. Custos gerais incluem administração, fretes, locações, consumo de canteiro e contingência. O painel permite filtrar por obra, etapa, fornecedor, categoria e período, alternando entrada prevista, entrada realizada, saída prevista, saída realizada e saldo.

As visões mínimas são: por mês; por etapa; por fornecedor; por obra; por categoria pré-obra/construção; e consolidada da carteira. Entradas podem representar aportes, recebimentos ou créditos autorizados; saídas representam obrigações e pagamentos, sem transformar pagamento em custo adicional. Cada gráfico exibe fonte, data de corte, filtro e denominador.

## Jornada principal

1. Gestor cadastra obra, equipe e estrutura de serviços.
2. Orçamento é preparado e enviado para aprovação; versão aprovada se torna baseline.
3. Solicitação vinculada a um item recebe propostas comparáveis; escolha tem justificativa.
4. Aprovação gera contrato/pedido com escopo, limites e condições de pagamento.
5. Responsável técnico mede execução ou confirma recebimento; aprovação reconhece o custo.
6. Financeiro gera obrigação, descontando compensações/retenções aplicáveis; parcela prevista já existente é vinculada, não duplicada.
7. Pagamento efetivo liquida total ou parcialmente a obrigação; requer conta, data e evidência.
8. Painel e prestação de contas mostram orçamento, compromisso, execução e caixa em perspectivas separadas.

## Regras financeiras candidatas

Valores monetários em BRL; cálculos decimais exatos. Quantidades admitem até quatro casas e preços unitários até seis; total da linha é arredondado a centavos com regra half-up, e o total do documento é a soma das linhas arredondadas. Tributos e índices de reajuste são parâmetros contratuais validados, não regras fiscais inventadas.

- **B**: orçamento vigente aprovado dos serviços; **R**: reserva de contingência ainda não alocada. Teto vigente = B + R.
- **C**: contratos/pedidos autorizados atualizados, com aditivos aprovados, já incluindo parcelas executadas.
- **E**: custo reconhecido por medição ou recebimento aprovado, líquido de reversões do reconhecimento. Reconhecer cada unidade de escopo apenas uma vez.
- **CR**: valor contratado correspondente ao escopo ainda não executado. Em contratos fixos sem cancelamentos, CR = C − E vinculado a esses contratos. Compras diretas integram o mesmo registro de compromissos.
- **U**: estimativa explícita do escopo restante não contratado. Não é automaticamente todo o orçamento menos contratos: a estimativa precisa indicar o escopo coberto.
- **F**: custo final projetado = E + CR + U. Não somar pagamentos a F. R fica visível como cobertura de risco; não vira custo executado automaticamente.
- **Desvio**: F − (B + R); mostrar também F − B para distinguir uso previsto de contingência. Desvio percentual usa denominador explícito; orçamento zero gera “não aplicável”.
- **Pago**: desembolsos efetivos menos estornos, incluindo adiantamentos. Mostrar separadamente valor aplicado a obrigações e adiantamento ainda não compensado.
- **Saldo contratual de caixa**: compromisso atualizado menos desembolsos líquidos vinculados, com retenções e créditos discriminados. Não confundir com obrigações já constituídas e vencidas.
- **Avanço físico**: soma do percentual físico dos serviços ponderado pelo orçamento-base dos mesmos serviços, excluindo reserva. O peso fica congelado com a baseline e o percentual não é inferido do pagamento.
- **Avanço financeiro de caixa**: pago / teto vigente; exibir o denominador e não chamar esse valor de execução física.

Uma transferência da reserva para serviço aumenta B e reduz R pelo mesmo valor. Aumento do teto por aporte adicional é uma revisão distinta. Histórico preserva ambos.

### Exemplo conciliável do protótipo

B = R$ 4.600.000; R = R$ 200.000; teto = R$ 4.800.000. C = R$ 3.500.000; E = R$ 1.920.000; CR = R$ 1.580.000; U = R$ 1.420.000. F = R$ 4.920.000. Desvio sobre o teto = R$ 120.000 (2,5%); necessidade acima dos serviços = R$ 320.000. Pago = R$ 1.680.000, dos quais R$ 120.000 são adiantamentos ainda não compensados. O valor pago não altera F.

### Medição, adiantamento e retenção

Exemplo isolado CT-014: contrato R$ 100.000, adiantamento já pago R$ 20.000, medição bruta R$ 40.000, retenção R$ 2.000 e compensação R$ 10.000. Nova obrigação líquida = R$ 28.000. Executado = R$ 40.000; após pagar essa obrigação, desembolsado = R$ 48.000; adiantamento aberto = R$ 10.000; retenção a liberar = R$ 2.000. O executado permanece R$ 40.000. Não adicionar a retenção de novo ao custo quando for liberada.

## Estados e exceções

- Orçamento: rascunho → em análise → aprovado → superado por nova versão; rejeitado retorna para revisão rastreável.
- Contrato: rascunho → em aprovação → aprovado → em execução → concluído; suspensão e cancelamento têm motivo e tratamento dos saldos.
- Medição: rascunho → enviada → aprovada/rejeitada; correção de aprovada cria reversão vinculada e nova medição.
- Obrigação: aberta → parcialmente liquidada → liquidada; vencida é derivada de data e saldo; estorno reabre o saldo corretamente.
- Aditivo: solicitado → impacto avaliado → aprovado/rejeitado; só aprovado atualiza C e cronograma.
- Recebimento rejeitado ou devolvido gera evento reverso, ajuste de estoque quando aplicável e crédito do fornecedor, sem apagar evidência.

## Critérios críticos de aceite

CA01: reenviar a mesma baixa com a mesma chave retorna a baixa existente e um único efeito no caixa.
CA02: duas medições concorrentes que juntas ultrapassariam o contrato não podem ambas ser aprovadas.
CA03: estornar R$ 5.000 de um pagamento reduz o pago líquido em R$ 5.000; custo reconhecido não muda.
CA04: substituir fornecedor cancela apenas o compromisso restante; não elimina medição ou pagamento histórico.
CA05: mudança de orçamento sem aprovação permanece fora dos totais aprovados e aparece na fila de pendências.
CA06: fornecedor A não lê proposta de B, mesmo alterando ID na URL ou chamando a API diretamente.
CA07: parcelas do cartão representam fluxo de caixa da aquisição original, nunca novas aquisições.
CA08: exportação reconcilia com o painel para o mesmo filtro e data de corte.
CA09: indisponibilidade mantém o formulário e não informa sucesso antes da confirmação do servidor.
CA10: restauração recupera registros e arquivos, incluindo vínculos, e é verificada em ambiente isolado.

## Fora da primeira versão

Transferir dinheiro por integração bancária, emitir nota fiscal, assinatura eletrônica certificada, contabilidade fiscal completa, BIM, app nativo, execução offline de aprovações e IA autônoma. O sistema registra pagamentos; integração para movimentar dinheiro exige novo escopo. Não interpretar controle de ART/RRT como emissão ou validação jurídica desses documentos.
