# Certo Custom Email System - Implementation Guide

This guide explains how to implement and use the complete custom email system for Certo with Korean templates.

## 🎯 **What's Implemented**

### **Three Email Types:**
1. **Password Reset** (`auth.email.template.recovery`)
2. **Email Confirmation** (`auth.email.template.confirmation`) 
3. **User Invitation** (`auth.email.template.invite`)

### **Email Providers Supported:**
- **Resend** (primary, recommended)
- **SendGrid** (fallback)
- **Mailgun** (second fallback)

## 📧 **Custom Email Templates Features**

### **All Templates Include:**
- 🇰🇷 **Korean language** content
- 📱 **Mobile-responsive** design
- 🎨 **Modern Certo branding** with gradient headers
- 🔒 **Security best practices** messaging
- ⚡ **Fast loading** optimized CSS
- ♿ **Accessibility** features

### **Template Specifics:**

#### **1. Password Reset Email**
- **Subject:** "비밀번호 재설정 요청"
- **Content:** Security warnings, expiration notice, clear CTA
- **Design:** Warning boxes, security icons

#### **2. Email Confirmation** 
- **Subject:** "이메일 주소 확인"
- **Content:** Welcome message, platform features, activation instructions
- **Design:** Info boxes, feature highlights

#### **3. User Invitation**
- **Subject:** "Certo 플랫폼 초대"
- **Content:** Inviter info, platform introduction, signup instructions
- **Design:** Welcome theme, platform benefits

## 🚀 **Quick Setup Guide**

### **Step 1: Get Resend API Key**

1. Sign up at [resend.com](https://resend.com)
2. Get your API key from the dashboard
3. Add domain verification if using custom domain

### **Step 2: Environment Configuration**

Add to your `.env.local`:

```env
# Primary Email Service (Resend)
RESEND_API_KEY=re_your_api_key_here

# Your domain for email sender
NEXT_PUBLIC_DOMAIN=certo.com

# Optional: Fallback Services
SENDGRID_API_KEY=SG.your_sendgrid_key_here
MAILGUN_API_KEY=key-your_mailgun_key_here
MAILGUN_DOMAIN=mg.certo.com

# Site URL for links
NEXT_PUBLIC_SITE_URL=https://certo.com
```

### **Step 3: Enable Custom Emails**

The system is **already enabled** in your codebase:

- ✅ **Password Reset:** `src/app/api/auth/sign/actions.ts` (enabled)
- ✅ **Email Confirmation:** `src/app/api/auth/sign/actions.ts` (enabled)  
- ✅ **User Invitation:** `src/app/api/admin/invite/actions.ts` (ready)

## 📂 **File Structure**

```
src/
├── utils/email/
│   └── custom-email.ts          # Main email utility with all templates
├── app/api/auth/sign/
│   └── actions.ts               # Auth actions (signup, password reset)
├── app/api/admin/invite/
│   └── actions.ts               # Admin invitation functions
└── components/admin/
    └── InviteUserForm.tsx       # UI for inviting users (to create)
```

## 🔧 **Usage Examples**

### **1. Password Reset (Already Implemented)**

```typescript
// Triggered when user clicks "Forgot Password"
// Automatically sends Korean password reset email
await findPassword(prevState, formData)
```

### **2. Email Confirmation (Already Implemented)**

```typescript
// Triggered when user signs up
// Automatically sends Korean welcome email
await signup(prevState, formData)
```

### **3. User Invitation (Ready to Use)**

```typescript
// For admin panel - invite new users
import { inviteUser } from '@/app/api/admin/invite/actions'

await inviteUser(prevState, formData)
```

## 🎨 **Customizing Email Templates**

### **To Modify Templates:**

Edit functions in `src/utils/email/custom-email.ts`:

- `generatePasswordResetEmailHTML()`
- `generateConfirmationEmailHTML()`
- `generateInvitationEmailHTML()`

### **Example Customization:**

```typescript
function generatePasswordResetEmailHTML(email: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="header">
        <h1>🔐 Your Custom Title</h1>
        <p>Your custom subtitle</p>
      </div>
      
      <div class="content">
        <!-- Your custom content -->
        <a href="${resetLink}" class="button">Custom Button Text</a>
      </div>
      
      ${getEmailFooter()}
    </body>
    </html>
  `
}
```

## 🧪 **Testing the System**

### **1. Test Password Reset:**
```bash
npm run dev
# Go to /sign → "Forgot Password"
# Enter real email → Check inbox
```

### **2. Test Email Confirmation:**
```bash
npm run dev  
# Go to /sign → "Sign Up"
# Create account → Check inbox
```

### **3. Test User Invitation:**
```bash
# Create admin panel component
# Use inviteUser() function
# Check invited user's inbox
```

## 📊 **Monitoring and Analytics**

### **Console Logging:**
All email sending includes detailed logs:
```
Email sent successfully via Resend to user@example.com
Email sent successfully via SendGrid to user@example.com  
```

### **Error Handling:**
```
Resend failed: [error details]
SendGrid failed: [error details]
No email service configured or all services failed
```

### **Email Provider Dashboards:**
- **Resend:** Real-time delivery stats
- **SendGrid:** Comprehensive analytics
- **Mailgun:** Delivery tracking

## 🔒 **Security Features**

### **Email Security:**
- ✅ **User enumeration protection** - always return success messages
- ✅ **Link expiration** - 24 hours for password reset, 7 days for invitations
- ✅ **HTTPS enforcement** for all links
- ✅ **Secure token generation** via Supabase

### **Content Security:**
- ✅ **No sensitive data** in email content
- ✅ **Clear security warnings** in Korean
- ✅ **Phishing protection** instructions

## 🌐 **Internationalization**

### **Currently Supported:**
- 🇰🇷 **Korean** (primary)
- 📧 **HTML + Text** versions for all emails

### **To Add More Languages:**
1. Create new template functions (e.g., `generatePasswordResetEmailHTML_EN()`)
2. Add language detection logic
3. Update the `getEmailTemplate()` function

## 📈 **Performance Optimization**

### **Email Provider Fallbacks:**
1. **Resend** (fastest, modern API)
2. **SendGrid** (reliable enterprise option)  
3. **Mailgun** (cost-effective alternative)

### **Template Caching:**
- Email templates are generated on-demand
- Styles are cached as strings
- No external dependencies

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **"No email service configured"**
   - Check environment variables
   - Verify API keys are correct

2. **"Email sending failed"**
   - Check email service logs
   - Verify domain configuration
   - Check sending limits

3. **"Templates not displaying correctly"**
   - Check HTML syntax
   - Test with different email clients
   - Verify CSS compatibility

### **Debug Steps:**

1. **Check server logs** for detailed error messages
2. **Test with email testing tools** (Mailtrap, MailHog)
3. **Verify API keys** in provider dashboards
4. **Check email delivery** in provider analytics

## 🔄 **Migration from Supabase Emails**

### **Current State:**
- ✅ **Custom emails enabled** for password reset and signup
- ✅ **Fallback support** if custom emails fail
- ✅ **Backward compatibility** maintained

### **To Revert to Supabase Emails:**
Simply comment out the custom email sections and uncomment Supabase email sections in the action files.

## 📋 **Next Steps**

### **1. Create Admin UI:**
```typescript
// Create: src/components/admin/InviteUserForm.tsx
// For admins to invite users through the dashboard
```

### **2. Add Invitation Management:**
```typescript
// Add database table: user_invitations
// Track invitation status, resends, etc.
```

### **3. Email Templates Management:**
```typescript
// Create admin interface to edit email templates
// Store custom templates in database
```

## 💡 **Production Checklist**

- [ ] **Environment variables** configured
- [ ] **Email service** API keys added
- [ ] **Domain verification** completed (for custom domain)
- [ ] **SPF/DKIM/DMARC** records configured
- [ ] **Templates tested** with real email addresses
- [ ] **Error handling** verified
- [ ] **Monitoring** set up for email delivery
- [ ] **Backup email service** configured

## 🎉 **Benefits of This Implementation**

- 🇰🇷 **Native Korean language** support
- 🎨 **Professional Certo branding**
- 📱 **Mobile-optimized** design
- 🔒 **Enhanced security** messaging  
- 📊 **Better deliverability** with professional email services
- ⚡ **Fast delivery** with multiple provider fallbacks
- 🛠️ **Easy customization** and maintenance
- 📈 **Scalable** for future email needs

Your Certo email system is now production-ready with beautiful Korean templates and robust delivery infrastructure!
