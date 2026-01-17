# Webkuhmanis - Payment OTP Confirmation System

🔐 **Full-stack payment confirmation system with animated digital world interface**

## Features

✨ **Core Features**
- 🔐 OTP-based payment confirmation
- 💰 Manual payment proof upload
- ⏱️ Auto-expiring OTP (15-60 minutes)
- 🎨 Animated digital world interface
- 🔊 Sound effects & audio feedback
- 📱 Mobile responsive design

🛠️ **Admin Features**
- Approve/reject payments
- Generate & regenerate OTP codes
- Real-time payment monitoring
- Audit logs

👤 **User Features**
- Upload payment proof (screenshot)
- Automated balance updates
- Payment history tracking
- Animated OTP input with 6 digits

## Tech Stack

**Backend**
- Node.js + Express.js + TypeScript
- PostgreSQL with secure OTP hashing
- JWT authentication
- Rate limiting on OTP attempts

**Frontend**
- React 18 + TypeScript
- Framer Motion animations
- Tailwind CSS styling
- Howler.js for sound effects
- Vite for fast development

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### 1. Clone & Install

```bash
git clone <your-repo>
cd webkuhmanis
npm install
```

### 2. Setup Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials
```

### 3. Database Setup

```bash
npm run migrate -w backend
```

### 4. Development

```bash
npm run dev
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

### 5. Demo Accounts

**User Login:**
- Email: user@test.com
- Password: test123

**Admin Login:**
- Password: admin123

## Docker Deployment

```bash
docker-compose up
```

Visit:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: localhost:5432

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login

### Payments
- `POST /api/payments/upload` - Submit payment proof
- `GET /api/payments/:id` - Get payment status
- `POST /api/payments/:id/verify-otp` - Verify OTP
- `GET /api/payments/balance` - Get user balance
- `GET /api/payments/history` - Payment history

### Admin
- `GET /api/admin/payments` - List all payments
- `POST /api/admin/payments/:id/approve` - Approve & generate OTP
- `POST /api/admin/payments/:id/regenerate-otp` - Regenerate OTP
- `POST /api/admin/payments/:id/reject` - Reject payment

## Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR UNIQUE,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  coins DECIMAL(10,2),
  created_at TIMESTAMP
);

-- Manual payments table
CREATE TABLE manual_payments (
  id UUID PRIMARY KEY,
  user_id UUID,
  amount DECIMAL(10,2),
  proof_image VARCHAR,
  status VARCHAR (pending|approved|completed|rejected),
  otp_code VARCHAR (hashed),
  otp_expires_at TIMESTAMP,
  otp_used_at TIMESTAMP
);

-- OTP attempts table (rate limiting)
CREATE TABLE otp_attempts (
  id UUID PRIMARY KEY,
  user_id UUID,
  payment_id UUID,
  attempt_count INT,
  locked_until TIMESTAMP
);
```

## Security Features

🔒 **Password Security**
- Bcryptjs for password hashing
- JWT token-based authentication

🔐 **OTP Security**
- SHA256 hashing for OTP storage
- Single-use OTP validation
- Auto-expiry mechanism
- Rate limiting (5 attempts = 15 min lockout)
- OTP bound to user + payment

✅ **Validation**
- All inputs sanitized
- CORS protection
- Request size limiting

## Deployment Options

### Vercel (Frontend)
```bash
npm run build -w frontend
vercel deploy frontend/dist
```

### Railway/Render (Backend)
```bash
# Set environment variables
# Deploy with docker-compose or Dockerfile
```

### AWS/GCP/Azure
```bash
docker build -t webkuhmanis .
docker run -p 5000:5000 webkuhmanis
```

## Customization

### Change OTP Expiry
Edit `backend/.env`:
```
OTP_EXPIRY_MINUTES=60  # Default: 15 minutes
```

### Change OTP Length
Edit `backend/src/utils/otp.ts`:
```typescript
export const generateOTP = (length: number = 8) // Default: 6
```

### Add Sound Effects
Place .wav/.mp3 files in `frontend/public/sounds/`:
- beep.wav
- success.wav
- error.wav
- click.wav
- digital-loop.mp3

## File Structure

```
webkuhmanis/
├── backend/
│   ├── src/
│   │   ├── db/          # Database connection & migrations
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   ├── utils/       # OTP, auth helpers
│   │   └── index.ts     # Express app
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/       # Login, Dashboard, Admin
│   │   ├── components/  # OTP input, animations
│   │   ├── hooks/       # Auth context
│   │   ├── utils/       # API, sounds
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Database connection error?**
```bash
# Check PostgreSQL is running
psql -h localhost -U postgres -d webkuhmanis
```

**Migrations failed?**
```bash
# Run migrations manually
npm run migrate -w backend
```

## Support

For issues, create a GitHub issue or contact: support@webkuhmanis.local

---

**Made with ❤️ for seamless payment confirmations**