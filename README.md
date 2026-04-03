# StonksCare 💰
Sistema de Controle Financeiro Pessoal - Desenvolvimento Web 2

## Integrantes
- Anna Júlia Aleixo Cardoso
- Gustavo Covre Magalhães
- Victor Alberto Dos Passos

## Tecnologias
**Backend:** Python, FastAPI, SQLAlchemy, SQLite, Pandas  
**Frontend:** React, Vite, Tailwind CSS, Recharts, Lucide React

---

## Como rodar o projeto

### Pré-requisitos
- Python 3.10+
- Node.js 18+
- Git

---

### Clonar o repositório

```bash
git clone https://github.com/victor-alberto-dev/stonkscare
cd stonkscare
```

---

### Backend

**1. Entrar na pasta e criar o ambiente virtual**
```bash
cd backend
python -m venv venv
```

**2. Ativar o ambiente virtual**
```bash
# Windows
source venv/Scripts/activate
```

**3. Instalar as dependências**
```bash
pip install -r requirements.txt
```

**4. Rodar o servidor**
```bash
uvicorn main:app --reload
```

O backend estará disponível em `http://localhost:8000`  
Documentação da API: `http://localhost:8000/docs`

---

### Frontend

**1. Entrar na pasta e instalar as dependências**
```bash
cd frontend
npm install
```

**2. Rodar o servidor**
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

---

### Variáveis de ambiente (opcional)

Para ativar os conselhos financeiros via IA, crie um arquivo `.env` dentro da pasta `backend/`:

```
ANTHROPIC_API_KEY=sua_chave_aqui
```

Sem a chave, o sistema funciona normalmente com um conselho gerado automaticamente.
