# Decisões e situação — 19/09/2026

## Confirmado pelo usuário

- Sistema de gestão de obra residencial de alto padrão com controle financeiro e de execução.
- Web responsivo, interface, API e banco de dados.
- Preferência por open source; React; API pode ser Node.js; banco Supabase ou PostgreSQL.
- Avaliar os pacotes KAPPITA/EQ HUB e converter agentes para Codex.
- Entregar documentação e telas antes do código do sistema.

## Proposto para revisão

- Nome provisório PRUMO.
- React/TypeScript + Vite, API Node.js/TypeScript + NestJS, PostgreSQL.
- Monólito modular; API como autoridade financeira; auth/storage substituíveis.
- Supabase opcional como plataforma; comparar Cloud e operação própria antes da implantação.
- Primeira entrega com registro de pagamentos, sem movimentar dinheiro em bancos.
- Múltiplas obras e organizações com acesso por membership; uso inicial pode ser uma organização.
- Fórmulas, arredondamento e tratamento de contingência conforme PRD.

## Decisões de negócio antes das respectivas funcionalidades

| Questão | Proposta de partida | Momento necessário |
|---|---|---|
| Uso próprio ou comercialização para várias empresas? | Estrutura preparada para organização/obra; uma organização inicial | Antes de cadastro e acesso |
| Hospedagem gerenciada ou própria? | Supabase gerenciado se não houver exigência operacional contrária | Antes de implantar |
| Quem aprova e quais os limites? | Perfis configuráveis; nenhum valor real presumido | Antes de aprovação financeira real |
| Compra por administração e taxas da construtora? | Modelar como custo explícito | Antes do contrato correspondente |
| Tributos, reajuste e retenções? | Parâmetros por contrato, validados pelo responsável | Antes de cálculo fiscal/contratual real |
| Reserva integra o teto exibido? | Teto = serviços + reserva; ambos discriminados | Na revisão dos indicadores |
| Área do custo por m²? | Área construída informada da obra; mostrar base | Antes de relatório real |
| RPO/RTO e retenção documental? | Proposta no documento de arquitetura | Antes de entrada em produção |

Essas perguntas não impediram produzir os documentos e as telas; propostas não foram apresentadas como respostas do usuário.

## Estado real

Documentação e telas: entregues para revisão, não aprovadas automaticamente.
Agentes: adaptados em arquivos do projeto; ver relatório de validação para sintaxe e limites.
Software: não implementado. Sem API, banco, autenticação, pagamento, upload, backup ou teste funcional de negócio executados nesta etapa.
Infraestrutura: não contratada. O registro privado de Sites criado antes da mudança de direção não foi publicado e não será usado como substituto da stack proposta sem decisão futura.

## Próximo passo

Receber ajustes das telas e documentos. Um pedido explícito posterior para implementar a primeira fatia autoriza avançar nessa fatia; não é necessário criar ritual de aprovação além da intenção expressa pelo usuário.
