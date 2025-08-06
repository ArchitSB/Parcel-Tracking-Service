# Parcel Tracking Service - Backend API

A comprehensive RESTful API for parcel tracking service built with Node.js, Express.js, and MongoDB. This service provides complete shipment lifecycle management with real-time tracking, notifications, and partner integration capabilities.

## 🚀 Features

### Core Functionality
- **Shipment Management**: Create, track, and manage shipments with detailed event sourcing
- **Real-time Tracking**: Live updates on package location and status
- **Event Sourcing**: Complete audit trail of all shipment events
- **Multi-partner Support**: Integration with multiple shipping partners
- **Notification System**: Email, SMS, and push notifications for status updates

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **API Key Management**: Partner authentication via API keys
- **Role-based Access Control**: User, partner, and admin roles
- **Rate Limiting**: API rate limiting to prevent abuse
- **Data Validation**: Comprehensive input validation with Joi

### API Features
- **RESTful Design**: Clean, consistent API endpoints
- **Pagination**: Efficient data pagination for large datasets
- **Search & Filter**: Advanced query capabilities
- **Error Handling**: Comprehensive error responses
- **Logging**: Detailed logging with Winston

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## 🛠 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Parcel-Tracking-Service/backend-part
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/parcel-tracking
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_HOST=smtp.gmail.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### User Registration
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

#### User Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Partner Registration
```http
POST /api/v1/auth/partner/register
Content-Type: application/json

{
  "companyName": "Express Logistics",
  "contactEmail": "partner@express.com",
  "contactPhone": "+1234567890",
  "partnerType": "logistics",
  "address": {
    "street": "123 Business St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  }
}
```

### Shipment Endpoints

#### Create Shipment (Partner Only)
```http
POST /api/v1/shipments
X-API-Key: your-api-key
Content-Type: application/json

{
  "sender": {
    "name": "John Sender",
    "email": "sender@example.com",
    "address": {
      "street": "123 Sender St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  },
  "recipient": {
    "name": "Jane Recipient",
    "email": "recipient@example.com",
    "address": {
      "street": "456 Recipient Ave",
      "city": "Los Angeles",
      "state": "CA",
      "zipCode": "90001",
      "country": "USA"
    }
  },
  "package": {
    "weight": {
      "value": 2.5,
      "unit": "kg"
    },
    "dimensions": {
      "length": 30,
      "width": 20,
      "height": 15,
      "unit": "cm"
    },
    "description": "Electronics"
  },
  "serviceType": "express"
}
```

#### Track Shipment (Public)
```http
GET /api/v1/shipments/PT1234567890ABCD
```

#### Add Tracking Event (Partner Only)
```http
POST /api/v1/shipments/PT1234567890ABCD/events
X-API-Key: your-api-key
Content-Type: application/json

{
  "eventType": "in_transit",
  "status": "in_transit",
  "description": "Package arrived at sorting facility",
  "location": {
    "city": "Chicago",
    "state": "IL",
    "country": "USA",
    "coordinates": {
      "latitude": 41.8781,
      "longitude": -87.6298
    }
  }
}
```

### User Endpoints

#### Get User Profile
```http
GET /api/v1/users/me
Authorization: Bearer your-jwt-token
```

#### Subscribe to Notifications
```http
POST /api/v1/users/me/subscriptions
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "trackingNumber": "PT1234567890ABCD",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false,
    "pushNotifications": true
  }
}
```

### Partner Endpoints

#### Get Partner Statistics
```http
GET /api/v1/partners/me/stats?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer your-jwt-token
```

#### Update Webhook URL
```http
PUT /api/v1/partners/me/webhook
Authorization: Bearer your-jwt-token
Content-Type: application/json

{
  "webhookUrl": "https://your-api.com/webhooks/shipment-updates"
}
```

### Notification Endpoints

#### Subscribe to Notifications (Public)
```http
POST /api/v1/notifications/subscribe
Content-Type: application/json

{
  "trackingNumber": "PT1234567890ABCD",
  "email": "customer@example.com",
  "preferences": {
    "emailNotifications": true
  }
}
```

## 🏗 Project Structure

```
src/
├── controllers/         # Route controllers
│   ├── authController.js
│   └── shipmentController.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── validation.js
├── models/             # Database models
│   ├── User.js
│   ├── Partner.js
│   ├── Shipment.js
│   └── Notification.js
├── routes/             # API routes
│   ├── auth.js
│   ├── shipments.js
│   ├── users.js
│   ├── partners.js
│   └── notifications.js
├── services/           # Business logic services
│   └── notificationService.js
├── utils/              # Utility functions
│   ├── logger.js
│   └── database.js
└── server.js           # Main application file
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/parcel-tracking` |
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `EMAIL_HOST` | SMTP host | Required for notifications |
| `EMAIL_USER` | SMTP username | Required for notifications |
| `EMAIL_PASS` | SMTP password | Required for notifications |
| `NODE_ENV` | Environment mode | `development` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📈 API Rate Limits

- **General API**: 100 requests per 15 minutes per IP
- **Partner API**: 1000 requests per hour per API key
- **Public Tracking**: No rate limit (cached responses)

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: Joi schema validation
- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT**: Secure token-based authentication
- **API Key**: Partner authentication
- **Rate Limiting**: Request rate limiting

## 📊 Monitoring & Logging

- **Winston Logger**: Structured logging with multiple transports
- **Error Tracking**: Comprehensive error handling and logging
- **Request Logging**: HTTP request/response logging
- **Health Check**: `/health` endpoint for monitoring

## 🚀 Deployment

### Using Docker (Recommended)

1. **Build Docker image**
   ```bash
   docker build -t parcel-tracking-api .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Set environment variables**
2. **Install dependencies**: `npm install --production`
3. **Start application**: `npm start`

## 🔄 Workflow Examples

### 1. Partner Creates a Shipment
1. Partner authenticates with API key
2. Partner creates shipment via POST `/api/v1/shipments`
3. System generates tracking number
4. Initial tracking event is created
5. Notifications are sent to recipient

### 2. Delivery Partner Updates Location
1. Partner authenticates with API key
2. Partner adds tracking event via POST `/api/v1/shipments/{tracking}/events`
3. Shipment status is updated
4. Notifications are sent to interested parties

### 3. Customer Tracks Package
1. Customer visits tracking page
2. System retrieves shipment via GET `/api/v1/shipments/{tracking}`
3. Customer can subscribe to notifications
4. Customer receives updates via email/SMS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support and questions, please contact [your-email@example.com]

---

**Note**: This is a production-ready API with comprehensive features for parcel tracking. Make sure to review and update security configurations before deploying to production.
