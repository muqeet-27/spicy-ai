# 🎨 MuqeetAI - Nude AI Image Generator

A full-stack web application for AI image generation with user authentication, payment processing, and admin dashboard.

## 📋 Project Features

✅ **User Authentication**
- Register & Login system
- JWT token-based authentication
- Password hashing with bcryptjs

✅ **Payment System**
- 3 subscription plans (2 weeks, 4 months, 12 months)
- Payment verification with Transaction ID & UTR Number
- Real-time payment status checking
- Admin verification system

✅ **Admin Dashboard**
- View all payment records
- Verify/Reject payments
- Real-time statistics
- Search & filter payments
- No authentication required (open access)

✅ **Image Generator**
- AI image generation (Unsplash placeholder)
- 30-minute fake processing time
- Animated loading spinner
- Download functionality

## 🚀 Deployment Guide

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

### Local Development Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd muqeetai-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```bash
cp .env.example .env
```

4. **Update .env with your credentials**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/muqeetai?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=3000
NODE_ENV=development
```

5. **Start development server**
```bash
npm start
```

6. **Access the application**
- Main Website: http://localhost:3000/index.html
- Admin Dashboard: http://localhost:3000/admin-dashboard.html

### Production Deployment (Heroku/Railway/Render)

1. **Create .env file with production variables**
```
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<your-strong-jwt-secret>
NODE_ENV=production
PORT=3000
```

2. **Deploy to Heroku**
```bash
heroku login
heroku create muqeetai-app
git push heroku main
```

3. **Deploy to Railway**
- Connect GitHub repository
- Set environment variables in Railway dashboard
- Deploy automatically

4. **Deploy to Render**
- Connect GitHub repository
- Set environment variables
- Deploy from Git

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `production` |

## 📁 Project Structure

```
muqeetai-website/
├── index.html              # Login & Register page
├── payment.html            # Payment page
├── main.html               # Image generator
├── admin-dashboard.html    # Admin panel
├── script.js               # Auth logic
├── payment.js              # Payment logic
├── main.js                 # Image generator logic
├── style.css               # Global styling
├── server.js               # Express server & API
├── package.json            # Dependencies
└── .env.example            # Environment variables template
```

## 🔗 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/admin/login` - Admin login (deprecated)

### Payment
- `POST /api/payment` - Submit payment details
- `GET /api/payment/status/:paymentId` - Check payment status

### Admin
- `GET /api/admin/payments/all` - Get all payments
- `POST /api/admin/verify-payment` - Verify payment
- `POST /api/admin/reject-payment` - Reject payment

### Image Generation
- `POST /api/generate` - Generate image (requires auth)

### Health Check
- `GET /api/health` - Server health status

## 🧪 Testing Checklist

- [ ] User Registration works
- [ ] User Login works
- [ ] Payment submission works
- [ ] Admin can verify payments
- [ ] User automatically redirects after verification
- [ ] Admin dashboard loads and displays payments
- [ ] Image generator works after payment verified
- [ ] 30-minute loading timer works
- [ ] Search functionality works
- [ ] Statistics update correctly
- [ ] All styling renders properly

## 🐛 Troubleshooting

### "Failed to fetch" error
- Ensure server is running on correct port
- Check browser console for specific errors
- Verify CORS is enabled in server.js
- Clear browser cache (Ctrl+Shift+Delete)

### MongoDB connection error
- Verify MongoDB URI is correct
- Check network access in MongoDB Atlas
- Ensure IP whitelist includes your server IP
- Test connection string in MongoDB Compass

### Payment status not updating
- Ensure payment ID is saved in localStorage
- Check browser console for fetch errors
- Verify `/api/payment/status/:paymentId` endpoint
- Check server logs for errors

## 📝 Default Admin Credentials

**Auto-initialized on first startup:**
- Username: `admin`
- Password: `Demo@1234`

## 🔐 Security Notes

⚠️ **Before Production Deployment:**

1. Change JWT_SECRET to a strong random string
2. Update MongoDB connection credentials
3. Enable HTTPS/SSL
4. Set NODE_ENV=production
5. Configure CORS for your domain
6. Set secure password hashing salt rounds
7. Add rate limiting for API endpoints
8. Implement request validation
9. Add error logging service
10. Monitor admin dashboard access

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed)
}
```

### Payments Collection
```javascript
{
  userId: String,
  name: String,
  email: String,
  plan: String,
  amount: Number,
  transactionId: String,
  utrNumber: String,
  status: String (pending/verified/rejected),
  createdAt: Date
}
```

### Admin Collection
```javascript
{
  username: String (unique),
  password: String (hashed)
}
```

## 📞 Support

For issues or questions:
1. Check browser console for error messages
2. Review server logs
3. Verify all environment variables are set
4. Check MongoDB Atlas connection status
5. Test API endpoints with Postman

## 📄 License

This project is private and confidential.

---

**Last Updated:** February 1, 2026
**Version:** 1.0.0
**Status:** Ready for Deployment ✅
