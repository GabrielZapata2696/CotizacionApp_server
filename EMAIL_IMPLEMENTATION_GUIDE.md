# SITEKOL Email Service Implementation Guide

## 📧 Overview

This implementation adds comprehensive email functionality to the SITEKOL backend using Resend.com, a modern email service provider. The system includes multiple email types with beautiful HTML templates and fallback text versions.

## 🚀 Features Implemented

### 1. **Email Service Architecture**
- **Provider**: Resend.com (with SMTP fallback)
- **Templates**: Professional HTML templates with responsive design
- **Types**: Test, Welcome, Password Reset, and Custom emails
- **Configuration**: Environment-based configuration with provider switching

### 2. **Email Types**

#### Test Email
- **Purpose**: Verify email service functionality
- **Template**: Simple confirmation with timestamp
- **Use Case**: Development testing and service verification

#### Welcome Email
- **Purpose**: Greet new users upon registration
- **Template**: Professional welcome with feature highlights
- **Use Case**: Automatic sending after user registration

#### Password Reset Email
- **Purpose**: Secure password recovery
- **Template**: Branded reset with secure link
- **Use Case**: Forgot password functionality

#### Custom Email
- **Purpose**: Flexible email sending for any content
- **Template**: User-defined HTML and text
- **Use Case**: Admin notifications, marketing, announcements

## 🛠 Implementation Details

### API Endpoints

All endpoints are under `/api/v1/email/`:

#### 1. Test Email
```
POST /api/v1/email/test
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 2. Welcome Email
```
POST /api/v1/email/welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name"
}
```

#### 3. Password Reset Email
```
POST /api/v1/email/password-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 4. Custom Email
```
POST /api/v1/email/custom
Content-Type: application/json

{
  "to": "user@example.com",
  "subject": "Your Subject",
  "html": "<h1>Your HTML Content</h1>",
  "text": "Your plain text content (optional)"
}
```

### Configuration

#### Environment Variables (Required)
```env
# Email Provider Configuration
EMAIL_PROVIDER=resend

# Resend Configuration
RESEND_API_KEY=re_5GR9ZWte_CMbaSFzDyrz97uVv99WCagem
RESEND_FROM=onboarding@resend.dev

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:4200
```

#### Optional SMTP Fallback
```env
# SMTP Configuration (Fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=SITEKOL <noreply@sitekol.com>
```

## 🧪 Testing

### Method 1: Using Node.js Script
```bash
# Make sure your server is running (npm run dev)
node test-email.js
```

### Method 2: Using cURL

#### Test Email
```bash
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

#### Welcome Email
```bash
curl -X POST http://localhost:3000/api/v1/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com", "name": "Your Name"}'
```

#### Password Reset Email
```bash
curl -X POST http://localhost:3000/api/v1/email/password-reset \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

#### Custom Email
```bash
curl -X POST http://localhost:3000/api/v1/email/custom \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Subject",
    "html": "<h1>Hello World</h1><p>This is a test email</p>",
    "text": "Hello World - This is a test email"
  }'
```

### Method 3: Using Postman

#### Collection Setup
1. **Base URL**: `http://localhost:3000/api/v1`
2. **Headers**: `Content-Type: application/json`
3. **Create requests** for each endpoint with appropriate JSON bodies

#### Sample Postman Requests

**Test Email Request:**
- URL: `POST {{base_url}}/email/test`
- Body:
```json
{
  "email": "your-email@example.com"
}
```

**Welcome Email Request:**
- URL: `POST {{base_url}}/email/welcome`
- Body:
```json
{
  "email": "your-email@example.com",
  "name": "John Doe"
}
```

**Password Reset Request:**
- URL: `POST {{base_url}}/email/password-reset`
- Body:
```json
{
  "email": "your-email@example.com"
}
```

**Custom Email Request:**
- URL: `POST {{base_url}}/email/custom`
- Body:
```json
{
  "to": "your-email@example.com",
  "subject": "SITEKOL - Important Update",
  "html": "<div style='font-family: Arial, sans-serif;'><h2>Hello!</h2><p>This is a custom message from SITEKOL.</p><p>Best regards,<br>SITEKOL Team</p></div>",
  "text": "Hello! This is a custom message from SITEKOL. Best regards, SITEKOL Team"
}
```

## 📱 Frontend Integration

### Using Fetch API
```javascript
// Test Email
async function sendTestEmail(email) {
  try {
    const response = await fetch('/api/v1/email/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    console.log('Email sent:', result);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Welcome Email
async function sendWelcomeEmail(email, name) {
  try {
    const response = await fetch('/api/v1/email/welcome', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name })
    });
    
    const result = await response.json();
    console.log('Welcome email sent:', result);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
}

// Password Reset Email
async function sendPasswordResetEmail(email) {
  try {
    const response = await fetch('/api/v1/email/password-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const result = await response.json();
    console.log('Password reset email sent:', result);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
}
```

### Using Angular HttpClient
```typescript
import { HttpClient } from '@angular/common/http';

@Injectable()
export class EmailService {
  private apiUrl = 'http://localhost:3000/api/v1/email';

  constructor(private http: HttpClient) {}

  sendTestEmail(email: string) {
    return this.http.post(`${this.apiUrl}/test`, { email });
  }

  sendWelcomeEmail(email: string, name: string) {
    return this.http.post(`${this.apiUrl}/welcome`, { email, name });
  }

  sendPasswordResetEmail(email: string) {
    return this.http.post(`${this.apiUrl}/password-reset`, { email });
  }

  sendCustomEmail(to: string, subject: string, html: string, text?: string) {
    return this.http.post(`${this.apiUrl}/custom`, { to, subject, html, text });
  }
}
```

## 🎨 Email Templates

### Template Features
- **Responsive Design**: Works on desktop and mobile
- **Professional Styling**: Clean, modern appearance
- **Brand Consistency**: SITEKOL colors and typography
- **Accessibility**: Alt text, semantic HTML structure
- **Fallback Text**: Plain text versions for all emails

### Template Customization
Templates can be easily customized by modifying the methods in `EmailService.ts`:
- `getTestEmailTemplate()`
- `getWelcomeEmailTemplate(name: string)`
- `getPasswordResetEmailTemplate(resetUrl: string)`

## 🔧 Integration Points

### 1. User Registration
The welcome email is automatically sent when a new user registers:
```typescript
// In AuthController.register()
try {
  await this.emailService.sendWelcomeEmail(newUser.email, newUser.nombre);
} catch (emailError) {
  logger.warn('Failed to send welcome email:', emailError);
  // Registration continues even if email fails
}
```

### 2. Password Reset
The password reset email is sent via the forgot password endpoint:
```typescript
// In AuthController.forgotPassword()
await this.emailService.sendPasswordResetEmail(user.email, resetToken);
```

## 📊 Monitoring & Logging

### Email Status Tracking
- All email attempts are logged with winston logger
- Success/failure status is tracked
- Email service errors are captured without breaking user flows

### Log Examples
```
info: Email sent successfully: {"messageId":"abc123","to":"user@example.com","subject":"Welcome to SITEKOL"}
warn: Failed to send welcome email: Error: Invalid API key
error: Error sending email: Network timeout
```

## 🔐 Security Features

### 1. Input Validation
- Email format validation using express-validator
- HTML content sanitization for custom emails
- Rate limiting on email endpoints

### 2. Error Handling
- Graceful degradation (registration continues if welcome email fails)
- Generic error messages to prevent information disclosure
- Secure token generation for password resets

### 3. API Key Security
- Environment variable storage
- No hardcoded credentials
- Provider switching capability

## 📈 Resend Account Status

### Current Plan
- **Provider**: Resend.com
- **Plan**: Free tier
- **Limits**: 1000 emails/month, 100 emails/day
- **API Key**: `re_5GR9ZWte_CMbaSFzDyrz97uVv99WCagem`
- **From Address**: `onboarding@resend.dev`

### Usage Monitoring
Monitor your Resend dashboard at https://resend.com/dashboard to track:
- Daily/monthly email usage
- Delivery rates
- Bounce/complaint rates
- Account status

## 🚨 Troubleshooting

### Common Issues

#### 1. "Resend API key not configured"
**Solution**: Check that `RESEND_API_KEY` is set in your `.env` file

#### 2. "Email service not properly configured"
**Solution**: Verify that:
- `EMAIL_PROVIDER=resend` is set
- `RESEND_API_KEY` is valid
- Server has been restarted after configuration changes

#### 3. Email validation errors
**Solution**: Ensure email addresses are in valid format (e.g., `user@domain.com`)

#### 4. Rate limiting errors
**Solution**: Check Resend dashboard for daily/monthly limits

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file to see detailed email processing logs.

## 🎯 Next Steps

### Recommended Enhancements
1. **Email Templates Management**: Create a template management system
2. **Batch Email Support**: Add support for sending emails to multiple recipients
3. **Email Analytics**: Track open rates, click-through rates
4. **Queue System**: Implement email queue for high-volume sending
5. **Template Variables**: Dynamic content injection system
6. **Localization**: Multi-language email templates

### Production Considerations
1. **Upgrade Resend Plan**: Higher limits for production usage
2. **Custom Domain**: Configure custom sending domain
3. **Email Monitoring**: Set up alerts for delivery failures
4. **Backup Provider**: Configure SMTP fallback for reliability
5. **Compliance**: GDPR, CAN-SPAM compliance features

---

✅ **The email service is now fully implemented and ready for testing!**

Use the provided endpoints to test functionality, and check your email inbox to verify that the beautiful, professional templates are being delivered successfully.
