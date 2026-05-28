<div align="center">

# 🏢 Orgres CRM

### AI-Powered Customer Relationship Management

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-orgres--crm.vercel.app-22c55e?style=for-the-badge)](https://orgres-crm.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-TiDB_Cloud-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://tidbcloud.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini_2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://ai.google.dev/)

**A full-stack, production-ready CRM platform with 5 AI-powered tools, drag-and-drop lead pipeline, real-time analytics, and premium editorial UI design.**

[Live Demo](https://orgres-crm.vercel.app) · [Report Bug](https://github.com/Saizade/orgres-crm/issues) · [Request Feature](https://github.com/Saizade/orgres-crm/issues)

</div>

---

## ✨ Features

### 📊 Smart Dashboard
- 4 real-time stat cards (Customers, Leads, Revenue, Deals)
- Monthly revenue area chart with green gradient fill
- Lead status donut chart
- Recent activity timeline

### 🎯 Lead Pipeline (Kanban Board)
- 5-stage pipeline: **New → Interested → Negotiation → Closed → Rejected**
- **Drag & drop** leads between columns (auto-saves to DB)
- Pipeline stats with total value and lead count
- Priority badges, follow-up dates, deal values in ₹

### 🤖 AI Command Center (5 Tools)
| Tool | What It Does |
|------|-------------|
| **Email Generator** | AI writes professional sales emails (follow-up, proposal, welcome) |
| **Customer Insights** | Analyzes all customer data for actionable recommendations |
| **Meeting Summary** | Paste transcript → get summary, key points, action items |
| **AI Chat** | Natural language queries about your CRM data |
| **Lead Scoring** | AI scores each lead's conversion probability (0-100%) |

### 👥 Customer Management
- Full CRUD operations with searchable table
- Status tracking (Active, Inactive, Prospect)
- Notes system per customer

### ✅ Task Management
- Create, assign, and track tasks
- Status cycling (Pending → In Progress → Completed)
- Priority levels, due dates, overdue warnings

### 🔍 Global Search
- Live search across Customers, Leads, and Tasks simultaneously
- Debounced (300ms) for performance
- Type-ahead dropdown with categorized results

### 🔐 Authentication
- JWT-based stateless authentication
- bcrypt password hashing
- Protected routes with auto-redirect

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI with hooks |
| **Vite** | Lightning-fast build tool & dev server |
| **React Router v6** | Client-side SPA routing |
| **Recharts** | Revenue charts & lead status visualization |
| **@hello-pangea/dnd** | Drag & drop for Kanban board |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | Modern icon library |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **Sequelize** | MySQL ORM |
| **JWT** | Stateless authentication |
| **bcryptjs** | Password hashing |
| **Google Generative AI SDK** | Gemini 2.5 Flash integration |

### Database & Deployment
| Service | Purpose |
|---------|---------|
| **MySQL (TiDB Cloud)** | Serverless relational database |
| **Vercel** | Frontend hosting & CDN |
| **Render** | Backend hosting |

---

## 📁 Project Structure

```
orgres-crm/
├── client/                       # React Frontend
│   ├── public/                   # Static assets & favicon
│   ├── src/
│   │   ├── assets/               # Images & logo
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Layout/           # Sidebar, Topbar, DashboardLayout
│   │   │   └── Modal.jsx         # Reusable modal
│   │   ├── context/              # React Context (Auth)
│   │   ├── pages/                # All page components
│   │   │   ├── Dashboard.jsx     # Analytics dashboard
│   │   │   ├── Customers.jsx     # Customer CRUD table
│   │   │   ├── Leads.jsx         # Kanban pipeline
│   │   │   ├── Tasks.jsx         # Task management
│   │   │   ├── AITools.jsx       # AI Command Center
│   │   │   ├── Settings.jsx      # User settings
│   │   │   ├── Login.jsx         # Auth - Login
│   │   │   └── Register.jsx      # Auth - Register
│   │   ├── services/api.js       # Axios API client
│   │   ├── index.css             # Design system & variables
│   │   └── App.jsx               # Routes
│   └── package.json
│
├── server/                       # Node.js Backend
│   ├── config/database.js        # Sequelize + MySQL connection
│   ├── controllers/              # Route handlers
│   │   ├── authController.js     # Register, Login, GetMe
│   │   ├── customerController.js # Customer CRUD
│   │   ├── leadController.js     # Lead CRUD
│   │   ├── taskController.js     # Task CRUD
│   │   ├── noteController.js     # Note CRUD
│   │   └── aiController.js       # 5 AI endpoints
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification
│   ├── models/                   # Sequelize models
│   ├── routes/                   # Express route definitions
│   ├── server.js                 # App entry point
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+
- **MySQL** (local or cloud)
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com/app/apikey)

### 1. Clone the Repository

```bash
git clone https://github.com/Saizade/orgres-crm.git
cd orgres-crm
```

### 2. Setup Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:

```env
PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orgres_crm
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../client
npm install
npm run dev
```

### 4. Open the App

Visit `http://localhost:5173` — register an account and start using the CRM!

---

## 🌐 Deployment

| Service | What | Free Tier |
|---------|------|-----------|
| **[Vercel](https://vercel.com)** | Frontend | ✅ Unlimited |
| **[Render](https://render.com)** | Backend | ✅ 750 hrs/mo |
| **[TiDB Cloud](https://tidbcloud.com)** | MySQL DB | ✅ 5GB free |

> See the [Deployment Guide](https://github.com/Saizade/orgres-crm/wiki) for step-by-step instructions.

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/register     # Create account
POST   /api/auth/login         # Login → JWT token
GET    /api/auth/me            # Get current user
```

### Resources (Protected)
```
GET    /api/customers          # List all customers
POST   /api/customers          # Create customer
PUT    /api/customers/:id      # Update customer
DELETE /api/customers/:id      # Delete customer

GET    /api/leads              # List all leads
POST   /api/leads              # Create lead
PUT    /api/leads/:id          # Update lead
DELETE /api/leads/:id          # Delete lead

GET    /api/tasks              # List all tasks
POST   /api/tasks              # Create task
PUT    /api/tasks/:id          # Update task
DELETE /api/tasks/:id          # Delete task
```

### AI Tools (Protected)
```
POST   /api/ai/generate-email      # AI email generation
POST   /api/ai/customer-insights   # AI customer analysis
POST   /api/ai/meeting-summary     # AI meeting summarizer
POST   /api/ai/chat                # AI chatbot
POST   /api/ai/lead-scoring        # AI lead scoring
```

---

## 🎨 Design

The UI follows a **warm cream/beige editorial theme** inspired by modern SaaS design:

- **Background**: `#F5F0EA` warm cream
- **Cards**: Pure white with soft shadows
- **Sidebar**: Dark `#111111` for contrast
- **Accent**: Green `#22c55e`
- **Headings**: DM Serif Display (serif)
- **Body**: Inter (sans-serif)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Saizade**

[![GitHub](https://img.shields.io/badge/GitHub-Saizade-181717?style=flat-square&logo=github)](https://github.com/Saizade)

---

<div align="center">

**⭐ Star this repo if you found it useful!**

Built with ❤️ using React, Node.js, MySQL & Google Gemini AI

</div>
