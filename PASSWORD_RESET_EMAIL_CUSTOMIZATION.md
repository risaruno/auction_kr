# Password Reset Email Customization Guide

This guide explains how to customize the password reset email content in your Certo application.

## Current Implementation

The password reset functionality is implemented in `src/app/api/auth/sign/actions.ts` with two options:

1. **Supabase Built-in Emails** (default)
2. **Custom Email Service** (for full control)

## Option 1: Customize Supabase Email Templates (Recommended for Quick Setup)

### Steps:

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to **Authentication** → **Email Templates**

2. **Select "Reset Password" Template**
   - Click on the "Reset Password" template
   - You'll see the default HTML and text templates

3. **Customize the Template**
   - Edit the HTML content with your branding
   - Use variables like:
     - `{{ .ConfirmationURL }}` - The password reset link
     - `{{ .Email }}` - User's email address
     - `{{ .SiteName }}` - Your site name

4. **Example Customization:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Password Reset - Certo</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { 
            background: #007bff; 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 5px; 
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Certo 비밀번호 재설정</h1>
        <p>안녕하세요 {{ .Email }}님,</p>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 버튼을 클릭하여 새 비밀번호를 설정해주세요:</p>
        <a href="{{ .ConfirmationURL }}" class="button">새 비밀번호 설정</a>
        <p>이 링크는 24시간 후에 만료됩니다.</p>
        <p>감사합니다,<br>Certo 팀</p>
    </div>
</body>
</html>
```

### Pros:
- ✅ Easy to set up - no code changes needed
- ✅ Automatic email delivery handling
- ✅ Built-in security features
- ✅ No additional email service costs

### Cons:
- ❌ Limited customization compared to custom solutions
- ❌ Depends on Supabase's email infrastructure
- ❌ Cannot use external email service features

## Option 2: Custom Email Service (Full Control)

### Available Email Services:

The custom email utility (`src/utils/email/custom-email.ts`) supports:
- **Resend** (recommended for Next.js)
- **SendGrid**
- **Mailgun**

### Setup Steps:

#### 1. Choose and Setup Email Service

**Option A: Resend (Recommended)**
```bash
# Sign up at https://resend.com
# Get your API key from the dashboard
```

**Option B: SendGrid**
```bash
# Sign up at https://sendgrid.com
# Get your API key from Settings → API Keys
```

**Option C: Mailgun**
```bash
# Sign up at https://mailgun.com
# Get your API key and domain from the dashboard
```

#### 2. Add Environment Variables

Add to your `.env.local` file:

```env
# For Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx

# For SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxx

# For Mailgun
MAILGUN_API_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxxxx
MAILGUN_DOMAIN=mg.yourdomain.com

# Your domain for email sender (required)
NEXT_PUBLIC_DOMAIN=yourdomain.com
```

#### 3. Enable Custom Email Service

In `src/app/api/auth/sign/actions.ts`, switch the code:

**Comment out Supabase email:**
```typescript
// Option 1: Use Supabase built-in email (with custom template from dashboard)
/*
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo,
})
*/
```

**Uncomment custom email:**
```typescript
// Option 2: Custom email service (enabled)
let error = null
const { data, error: tokenError } = await supabase.auth.admin.generateLink({
  type: 'recovery',
  email: email,
  options: {
    redirectTo: redirectTo
  }
})

if (tokenError) {
  console.error('Token generation error:', tokenError.message)
  error = tokenError
} else if (data.properties?.action_link) {
  const emailSent = await sendCustomPasswordResetEmail(email, data.properties.action_link)
  if (!emailSent) {
    error = { message: 'Failed to send email' }
  }
}
```

### Custom Email Template Features:

The custom email template includes:
- 🎨 **Beautiful Korean-language design** with modern styling
- 📱 **Responsive layout** that works on all devices
- 🔒 **Security warnings** and best practices
- 🏢 **Professional branding** with gradient header
- 🔗 **Clear call-to-action** button
- ♿ **Accessibility features** and proper HTML structure

### Customizing the Email Template:

Edit the `generatePasswordResetEmailHTML` function in `src/utils/email/custom-email.ts`:

```typescript
function generatePasswordResetEmailHTML(email: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <!-- Your custom styles here -->
    </head>
    <body>
      <!-- Your custom email content here -->
      <a href="${resetLink}">Reset Password</a>
    </body>
    </html>
  `
}
```

### Pros:
- ✅ Complete control over email design and content
- ✅ Use professional email services with better deliverability
- ✅ Advanced analytics and tracking features
- ✅ Support for complex email workflows
- ✅ Better spam filtering and reputation management

### Cons:
- ❌ More setup required
- ❌ Additional cost for email service
- ❌ Need to manage email service credentials

## Testing Password Reset Emails

### 1. Test with Real Email:
```bash
# Start your development server
npm run dev

# Navigate to the sign-in page
# Click "Forgot Password"
# Enter a real email address you can access
```

### 2. Check Email Delivery:
- Check your inbox (and spam folder)
- Verify the email content and styling
- Test the password reset link functionality

### 3. Monitor Logs:
- Check browser console for any errors
- Check server logs for email sending status
- Monitor your email service dashboard for delivery stats

## Best Practices

### Security:
- ✅ Never expose sensitive information in emails
- ✅ Use HTTPS for all password reset links
- ✅ Set appropriate link expiration times (24 hours)
- ✅ Log security events for monitoring

### User Experience:
- ✅ Clear and concise messaging
- ✅ Consistent branding with your application
- ✅ Mobile-friendly email design
- ✅ Clear instructions and call-to-action

### Deliverability:
- ✅ Use reputable email service providers
- ✅ Configure SPF, DKIM, and DMARC records
- ✅ Monitor bounce rates and spam complaints
- ✅ Use proper from addresses and reply-to settings

## Troubleshooting

### Common Issues:

1. **Emails not being received:**
   - Check spam/junk folders
   - Verify email service credentials
   - Check email service sending limits
   - Verify domain configuration

2. **Custom email not working:**
   - Check environment variables
   - Verify API key permissions
   - Check email service logs
   - Ensure proper imports in code

3. **Styling issues:**
   - Test email in multiple clients
   - Use inline CSS for better compatibility
   - Check responsive design on mobile

### Debug Steps:

1. **Check server logs** for error messages
2. **Verify environment variables** are loaded correctly
3. **Test with email testing tools** like Mailtrap or MailHog
4. **Check email service dashboards** for delivery status

## Support

If you need help with email customization:
1. Check the email service documentation
2. Review the custom email utility code
3. Test with different email providers
4. Monitor email delivery metrics

## Summary

- **For quick setup:** Use Supabase email templates (Option 1)
- **For full control:** Use custom email service (Option 2)
- **Always test** password reset functionality thoroughly
- **Monitor** email delivery and user feedback
- **Keep security** as the top priority

The current implementation provides both options with detailed examples and best practices for a production-ready password reset email system.
