# Payment OTP System - Getting Started

## ⚡ Quick Start (5 minutes)

### 1️⃣ Run Setup Script
```bash
chmod +x start.sh
./start.sh
```

### 2️⃣ Start Development
```bash
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Admin**: http://localhost:3000 → Admin Login

### 3️⃣ Demo Accounts
```
User Login:
  Email: user@test.com
  Password: test123

Admin Login:
  Password: admin123
```

---

## 🐳 Docker Quick Start

If you prefer Docker:
```bash
docker-compose up
```

Same URLs as above!

---

## 📁 Project Structure

```
webkuhmanis/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── db/          # Database setup & migrations
│   │   ├── routes/      # API endpoints
│   │   ├── middleware/  # Auth, validation
│   │   ├── utils/       # OTP, JWT helpers
│   │   └── index.ts     # Server entry
│   └── package.json
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, Admin
│   │   ├── components/  # OTP, Animations
│   │   ├── hooks/       # Auth context
│   │   ├── utils/       # API, sounds
│   │   └── App.tsx
│   └── package.json
├── DEPLOYMENT.md        # Production deployment guide
├── README.md           # Full documentation
└── docker-compose.yml  # Docker setup
```

---

## 🔐 How It Works

### User Flow
1. **Upload Payment Proof** → Upload screenshot of transfer
2. **Wait for Admin** → Status shows "⏳ Pending"
3. **Admin Approves** → Generate OTP code
4. **Receive OTP** → See in dashboard (15 min expiry)
5. **Confirm OTP** → Enter 6-digit code
6. **Get Coins** → Balance updates! 🎉

### Admin Flow
1. **Review Payments** → See pending uploads
2. **Check Image** → View transfer proof
3. **Approve** → System generates OTP
4. **Manage OTP** → Regenerate or reject payment

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev              # Start both frontend & backend

# Backend only
npm run dev -w backend
npm build -w backend
npm start -w backend

# Frontend only
npm run dev -w frontend
npm run build -w frontend

# Database
npm run migrate -w backend    # Run migrations
```

---

## ⚙️ Configuration

Edit `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webkuhmanis
DB_USER=postgres
DB_PASSWORD=postgres

# Security
JWT_SECRET=change_me_in_production

# OTP
OTP_EXPIRY_MINUTES=15   # Change to 60 for longer window

# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 🎨 Customization

### Change Colors
Edit `frontend/tailwind.config.js` or `frontend/src/index.css`

### Change OTP Length
Edit `backend/src/utils/otp.ts`:
```typescript
// Default is 6, change to 8:
export const generateOTP = (length: number = 8)
```

### Add Sound Effects
Add audio files to `frontend/public/sounds/`:
- `beep.wav` (OTP digit enter)
- `success.wav` (Payment confirmed)
- `error.wav` (Failed attempt)
- `click.wav` (Button click)
- `digital-loop.mp3` (Background)

---

## 🚀 Next Steps

- ✅ Development running?
- → Read [README.md](./README.md) for full documentation
- → See [DEPLOYMENT.md](./DEPLOYMENT.md) for production
- → Deploy to GitHub: `git push origin main`
- → Deploy to Railway/Vercel for free!

---

## ❓ Troubleshooting

**Port 5000 in use?**
```bash
lsof -ti:5000 | xargs kill -9
```

**Database connection failed?**
```bash
# Start PostgreSQL (if using local)
docker run -d -p 5432:5432 \
  -e POSTGRES_PASSWORD=postgres \
  postgres:16-alpine
```

**Stuck? Check logs**
```bash
npm run dev  # Shows all logs
```

---

**Ready? Let's go!** 🚀

```bash
npm run dev
```

Visit http://localhost:3000 and enjoy! 🎉
