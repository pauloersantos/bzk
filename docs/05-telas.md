# Telas e jornadas — protótipo v1

O protótipo navegável desta revisão está apresentado inline na conversa e salvo no diretório de visualizações da tarefa como `prumo-menus-v3.html`. É um artefato de design, com dados fictícios e interações locais de navegação/filtro/detalhamento. Não é o frontend de produção. A interface declara essa condição.

## Direção visual

Nome do sistema: **BKZ Obras**. Paleta baseada em azul-marinho, azul médio e tons claros derivados, com detalhes discretos em bronze, tipografia sóbria e tabelas legíveis. Priorizar valores, situação e próxima ação. Evitar fotografias decorativas em áreas de gestão. O custo da obra é a informação central.

## Mapa de telas agrupado

| ID | Tela | Conteúdo e ação prevista no produto |
|---|---|---|
| Pré-obra | Catálogo | Etapas, serviços, unidades, categorias, centros de custo e fornecedores |
| Pré-obra | Obras | Uma ou várias obras; criação após selecionar catálogo e configuração inicial |
| Pré-obra | Configuração | Etapas/serviços selecionados, pesos, ambientes, pré-requisitos e alçadas |
| Pré-obra | Orçamento inicial | EAP, cenários, custos de pré-obra, baseline e reserva |
| Execução da obra | Painel | Orçado, contratado, executado, pago, projeção, avanço, texto, imagens e alertas |
| Execução da obra | Cotações e compras | Comparação, fornecedores, prazos e recebimentos |
| Execução da obra | Contratos e aditivos | Upload de contratos, anexos, valores, escopo e aditivos |
| Execução da obra | Medições e recebimentos | Percentual, quantidade, fotos, retenções e adiantamentos |
| Execução da obra | Financeiro | Pré-obra/construção; entradas e saídas por mês, etapa, fornecedor e obra |
| Execução da obra | Cronograma | Dependências, avanço físico ponderado, datas e Gantt |
| Execução da obra | Diário e qualidade | Registros por etapa/serviço/ambiente, fotos e pendências |
| Execução da obra | Documentos e equipe | Arquivos, versões, permissões, alçadas e auditoria |
| Pós-obra | Entrega e garantias | Vistorias, documentação final, garantias e manutenção |
| Pós-obra | Venda | Unidade, preço, comprador, status e documentos comerciais |
| Pós-obra | Marketing e corretoras | Campanhas, canais, corretora, comissão prevista/paga e custos |
| Pós-obra | Relatórios comerciais | Receita, custos de venda, margem e resultado líquido |

As telas agrupadas terão representação no protótipo. Formulários completos, autenticação, upload, exportação e gravação são escopo de implementação posterior e não são simulados como concluídos.

## Jornada para avaliação

1. Em **Catálogo**, cadastre etapas, serviços e fornecedores antes de criar a obra.
2. Em **Obras**, crie uma obra e selecione o conjunto de etapas e serviços aplicável.
3. Em **Configuração**, ajuste pesos, datas, fornecedores, custos, pré-requisitos e alçadas.
4. Em **Execução da obra**, acompanhe painel, orçamento, contratos, medições, financeiro, cronograma, diário e documentos.
5. Em **Pós-obra**, registre entrega, garantias, venda, marketing, corretoras, comissões e relatórios comerciais.
6. Confira uma carteira com mais de uma obra e filtre os números por obra.
7. Confira as mesmas telas em largura de celular.

## Responsividade e acessibilidade previstas

Desktop: navegação lateral, indicadores e tabelas comparáveis. Tablet: menu compacto e grades de duas colunas. Celular: seletor de módulo, valores empilhados, ações grandes e formulários em uma coluna; evitar depender de hover. Informações essenciais não desaparecem para caber na tela. Tabelas extensas podem rolar horizontalmente apenas quando a comparação exigir.

Teclado, foco visível, labels, contraste, texto junto ao status e mensagens acionáveis. Datas DD/MM/AAAA e valores BRL. Download e exportação oferecem progresso e falha recuperável.

## Estados a implementar

Toda tela de consulta: carregando, vazia, erro com tentativa, sucesso e sem permissão. Formulário: validação local, enviando, conflito de versão, rejeição de regra, rede indisponível preservando rascunho e sucesso confirmado. Upload: selecionado, enviando, em análise, disponível, rejeitado. Aprovação: motivo e consequência financeira visíveis antes da confirmação. Estado de protótipo não comprova esses comportamentos de backend.
