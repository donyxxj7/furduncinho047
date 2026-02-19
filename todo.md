# Furduncinho047 - Lista de Tarefas

## Banco de Dados
- [x] Criar schema completo com tabelas: users, tickets, payments, checkin_logs
- [x] Configurar relacionamentos entre tabelas
- [x] Executar migração do banco de dados

## Backend - Rotas tRPC
- [x] Implementar rotas de autenticação (login/cadastro)
- [x] Implementar rotas de tickets (criar, listar, buscar por usuário)
- [x] Implementar rotas de pagamentos (criar, enviar comprovante, listar pendentes)
- [x] Implementar rotas administrativas (aprovar/rejeitar pagamentos)
- [x] Implementar rota de geração de QR Code e ingresso
- [x] Implementar rota de validação de QR Code (scanner)
- [x] Implementar rota de check-in e logs

## Frontend - Páginas Públicas
- [x] Criar página Home com informações do evento
- [x] Criar página de compra de ingresso
- [x] Criar página de acompanhamento de pedido
- [x] Criar página de envio de comprovante
- [x] Criar página "Meu Ingresso" (usuário autenticado)

## Frontend - Painel Administrativo
- [x] Criar dashboard com métricas gerais
- [x] Criar página de pagamentos pendentes
- [x] Criar interface de aprovação/rejeição de comprovantes
- [x] Criar página de lista de ingressos emitidos
- [x] Criar scanner de QR Code integrado
- [x] Criar página de logs de check-in
- [x] Criar página de configurações

## Funcionalidades de Segurança
- [x] Implementar geração de hash criptografada para QR Code
- [x] Implementar validação de QR Code no backend
- [x] Implementar sistema anti-fraude (ingresso usado apenas uma vez)
- [x] Implementar logs de todas as validações

## Integração e Upload
- [x] Configurar upload de comprovantes para S3
- [x] Configurar upload de ingressos gerados para S3
- [x] Implementar geração de ingresso em PNG/PDF

## Design e UX
- [x] Aplicar tema futurista (preto + roxo neon)
- [x] Implementar animações suaves
- [x] Garantir responsividade em todos os dispositivos
- [x] Adicionar logo do evento

## Testes e Validação
- [x] Testar fluxo completo do usuário
- [x] Testar fluxo completo do administrador
- [x] Testar scanner de QR Code
- [x] Validar segurança anti-fraude
