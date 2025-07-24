# 📧 Gmail SMTP Setup Guide for SITEKOL

## 🎯 **Why Gmail SMTP?**

- ✅ **FREE** - No cost limits
- ✅ **Reliable** - 99.9% uptime
- ✅ **Send to ANY email** - No restrictions
- ✅ **No API keys needed** - Uses your Gmail account
- ✅ **Works immediately** - No verification required

## 🔧 **Setup Steps**

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Follow the setup process

### Step 2: Generate App Password
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select "Mail" and "Other (Custom name)"
5. Enter "SITEKOL Backend"
6. Click "Generate"
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace `your_gmail_app_password_here` in your `.env` file:

```env
# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=dev.ia.gabrielzapata@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=SITEKOL <dev.ia.gabrielzapata@gmail.com>
```

### Step 4: Test the Configuration
```bash
# Make sure your server is running
npm run dev

# Test the email service
node test-email.js
```

## 🚀 **Testing**

### Test with any email address:
```bash
curl -X POST http://localhost:3000/api/v1/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "any-email@example.com"}'
```

### Test welcome email:
```bash
curl -X POST http://localhost:3000/api/v1/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"email": "friend@example.com", "name": "John Doe"}'
```

### Test password reset:
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## 🔒 **Security Notes**

1. **App Password is NOT your Gmail password**
2. **App Password is specific to this application**
3. **You can revoke it anytime from Google Account settings**
4. **Never share your app password**

## 📊 **Gmail Limits**

- **Daily limit**: 500 emails per day
- **Per minute**: 100 emails per minute
- **Perfect for**: Development, small to medium applications

## 🛠 **Troubleshooting**

### "Invalid login" error:
- ✅ Make sure 2FA is enabled
- ✅ Use App Password, not Gmail password
- ✅ Remove spaces from App Password

### "Authentication failed" error:
- ✅ Check SMTP_USER is correct email
- ✅ Regenerate App Password
- ✅ Verify .env file is saved

### Emails not received:
- ✅ Check spam folder
- ✅ Verify recipient email is correct
- ✅ Check server logs for errors

## 🎯 **Production Ready**

This Gmail SMTP setup is suitable for:
- ✅ **Development environments**
- ✅ **Small applications** (< 500 emails/day)
- ✅ **MVP/Prototype applications**
- ✅ **Internal company applications**

For high-volume production (1000+ emails/day), consider:
- SendGrid (99,000 free emails/month)
- Mailgun (10,000 free emails/month)
- Amazon SES (62,000 free emails/month)

---

## 🎉 **You're Ready!**

Once you've set up the App Password, your SITEKOL email service will work with **any email address** without restrictions!

Test it now:
```bash
node test-email.js
```
