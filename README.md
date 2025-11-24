# 🎉 Furduncinho047 - Sistema de Ingressos

Sistema completo de venda e validação de ingressos para eventos, com design futurista roxo neon.

## 🚀 Início Rápido

### 1. Instalar Dependências
```bash
pnpm install
```

### 2. Configurar Banco de Dados

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="mysql://usuario:senha@localhost:3306/furduncinho047"
```

### 3. Criar Banco e Aplicar Migrações

```bash
# No MySQL, crie o banco:
CREATE DATABASE furduncinho047;

# Aplique as migrações:
pnpm db:push
```

### 4. Iniciar o Servidor

```bash
pnpm dev
```

Acesse: http://localhost:3000

---

## 📚 Documentação Completa

Veja o arquivo `GUIA_CONFIGURACAO_MYSQL.md` para instruções detalhadas.

---

## 🎯 Funcionalidades

### Para Usuários:
- ✅ Cadastro e login
- ✅ Compra de ingressos (R$ 25,00)
- ✅ Pagamento via PIX
- ✅ Upload de comprovante
- ✅ Visualização de ingresso com QR Code

### Para Administradores:
- ✅ Dashboard com métricas
- ✅ Aprovação/rejeição de pagamentos
- ✅ Geração automática de QR Codes
- ✅ Scanner de ingressos (câmera)
- ✅ Logs de check-in
- ✅ Sistema anti-fraude

---

## 🗂️ Estrutura do Projeto

```
furduncinho047/
├── client/              # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/      # Páginas do site
│   │   ├── components/ # Componentes UI
│   │   └── lib/        # Utilitários
│   └── public/         # Arquivos estáticos
├── server/             # Backend (Express + tRPC)
│   ├── routers.ts     # Rotas da API
│   ├── db.ts          # Queries do banco
│   └── storage.ts     # Upload S3
├── drizzle/           # Schema do banco
│   └── schema.ts      # Definição das tabelas
└── shared/            # Código compartilhado
```

---

## 🔐 Tornar-se Administrador

Após fazer login, execute no MySQL:

```sql
UPDATE users SET role = 'admin' WHERE id = SEU_ID;
```

---

## 📱 Rotas Principais

### Públicas:
- `/` - Home
- `/comprar` - Comprar ingresso
- `/meus-ingressos` - Ver meus ingressos

### Administrativas:
- `/admin` - Dashboard
- `/admin/pagamentos` - Aprovar pagamentos
- `/admin/scanner` - Scanner de QR Code

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Iniciar produção
pnpm start

# Aplicar mudanças no banco
pnpm db:push
```

---

## 🎨 Tema e Design

- **Cores**: Preto + Roxo Neon (#A855F7)
- **Estilo**: Futurista/Cyberpunk
- **Framework**: Tailwind CSS 4
- **Componentes**: shadcn/ui

---

## 📦 Tecnologias

- **Frontend**: React 19, Vite, Tailwind CSS
- **Backend**: Express, tRPC
- **Banco**: MySQL + Drizzle ORM
- **Storage**: S3
- **QR Code**: qrcode + html5-qrcode
- **Auth**: Manus OAuth

---

## 🔒 Segurança

- Hash SHA-256 para QR Codes
- Validação server-side
- Sistema anti-fraude (uso único)
- Logs completos de validação
- Upload seguro para S3

---

## 📞 Suporte

Para problemas de configuração, consulte `GUIA_CONFIGURACAO_MYSQL.md`

---

## 📄 Licença

© 2026 Furduncinho047. Todos os direitos reservados.
