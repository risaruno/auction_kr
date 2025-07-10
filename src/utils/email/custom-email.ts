// Email template types for Supabase auth
export enum EmailType {
  RECOVERY = 'recovery',           // Password reset
  CONFIRMATION = 'confirmation',   // Email verification
  INVITE = 'invite'               // User invitation
}

// =================================================================
// MAIN EMAIL SENDING FUNCTIONS
// =================================================================

// Main email sending function for all auth emails
export async function sendAuthEmail(
  type: EmailType,
  toEmail: string,
  actionLink: string,
  additionalData?: { inviterName?: string; appName?: string }
): Promise<boolean> {
  const emailData = getEmailTemplate(type, toEmail, actionLink, additionalData)
  return await sendEmail(toEmail, emailData.subject, emailData.html, emailData.text)
}

// Legacy function for password reset (keeping for backward compatibility)
export async function sendCustomPasswordResetEmail(
  toEmail: string, 
  resetLink: string
): Promise<boolean> {
  return await sendAuthEmail(EmailType.RECOVERY, toEmail, resetLink)
}

// New dedicated functions for each email type
export async function sendInvitationEmail(
  toEmail: string,
  inviteLink: string,
  inviterName?: string
): Promise<boolean> {
  return await sendAuthEmail(EmailType.INVITE, toEmail, inviteLink, { inviterName })
}

export async function sendConfirmationEmail(
  toEmail: string,
  confirmationLink: string
): Promise<boolean> {
  return await sendAuthEmail(EmailType.CONFIRMATION, toEmail, confirmationLink)
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetLink: string
): Promise<boolean> {
  return await sendAuthEmail(EmailType.RECOVERY, toEmail, resetLink)
}

// =================================================================
// EMAIL SERVICE PROVIDERS INTEGRATION
// =================================================================

// Core email sending function using Resend (primary) with fallbacks
async function sendEmail(
  toEmail: string,
  subject: string,
  htmlContent: string,
  textContent?: string
): Promise<boolean> {
  try {
    // Option 1: Using Resend (Primary)
    const resendApiKey = process.env.RESEND_API_KEY
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Certo <noreply@${process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com'}>`,
          to: [toEmail],
          subject: subject,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (response.ok) {
        console.log(`Email sent successfully via Resend to ${toEmail}`)
        return true
      } else {
        console.error('Resend failed:', await response.text())
      }
    }

    // Option 2: Using SendGrid (Fallback)
    const sendGridApiKey = process.env.SENDGRID_API_KEY
    if (sendGridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: toEmail }],
          }],
          from: { 
            email: `noreply@${process.env.NEXT_PUBLIC_DOMAIN || 'yourdomain.com'}`,
            name: 'Certo'
          },
          subject: subject,
          content: [{
            type: 'text/html',
            value: htmlContent,
          }],
        }),
      })

      if (response.ok) {
        console.log(`Email sent successfully via SendGrid to ${toEmail}`)
        return true
      } else {
        console.error('SendGrid failed:', await response.text())
      }
    }

    // Option 3: Using Mailgun (Second Fallback)
    const mailgunApiKey = process.env.MAILGUN_API_KEY
    const mailgunDomain = process.env.MAILGUN_DOMAIN
    if (mailgunApiKey && mailgunDomain) {
      const formData = new FormData()
      formData.append('from', `Certo <noreply@${mailgunDomain}>`)
      formData.append('to', toEmail)
      formData.append('subject', subject)
      formData.append('html', htmlContent)
      if (textContent) {
        formData.append('text', textContent)
      }

      const response = await fetch(`https://api.mailgun.net/v3/${mailgunDomain}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${mailgunApiKey}`).toString('base64')}`,
        },
        body: formData,
      })

      if (response.ok) {
        console.log(`Email sent successfully via Mailgun to ${toEmail}`)
        return true
      } else {
        console.error('Mailgun failed:', await response.text())
      }
    }

    console.error('No email service configured or all services failed')
    return false
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// =================================================================
// EMAIL TEMPLATE SELECTOR
// =================================================================

// Get email template data based on type
function getEmailTemplate(
  type: EmailType,
  email: string,
  actionLink: string,
  additionalData?: { inviterName?: string; appName?: string }
): { subject: string; html: string; text: string } {
  switch (type) {
    case EmailType.RECOVERY:
      return {
        subject: '비밀번호 재설정 요청',
        html: generatePasswordResetEmailHTML(email, actionLink),
        text: generatePasswordResetEmailText(email, actionLink)
      }
    
    case EmailType.CONFIRMATION:
      return {
        subject: '이메일 주소 확인',
        html: generateConfirmationEmailHTML(email, actionLink),
        text: generateConfirmationEmailText(email, actionLink)
      }
    
    case EmailType.INVITE:
      return {
        subject: 'Certo 플랫폼 초대',
        html: generateInvitationEmailHTML(email, actionLink, additionalData?.inviterName),
        text: generateInvitationEmailText(email, actionLink, additionalData?.inviterName)
      }
    
    default:
      throw new Error(`Unknown email type: ${type}`)
  }
}

// =================================================================
// EMAIL TEMPLATES - Korean Language Templates for Certo
// =================================================================

// 1. PASSWORD RESET EMAIL TEMPLATE
function generatePasswordResetEmailHTML(email: string, resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>비밀번호 재설정</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="header">
        <h1>🔐 비밀번호 재설정</h1>
        <p>Certo 계정 보안을 위해 도움을 드리겠습니다</p>
      </div>
      
      <div class="content">
        <h2>안녕하세요!</h2>
        
        <p><strong>${email}</strong> 계정의 비밀번호 재설정을 요청하셨습니다.</p>
        
        <p>보안을 위해 아래 버튼을 클릭하여 새 비밀번호를 설정해주세요:</p>
        
        <div style="text-align: center;">
          <a href="${resetLink}" class="button">새 비밀번호 설정하기</a>
        </div>
        
        <div class="warning">
          <strong>⚠️ 중요한 보안 안내:</strong>
          <ul>
            <li>이 링크는 24시간 후에 만료됩니다</li>
            <li>이 요청을 하지 않으셨다면 이 이메일을 무시해주세요</li>
            <li>링크를 클릭하기 전에 이메일 주소를 확인해주세요</li>
          </ul>
        </div>
        
        <p>문제가 있으시거나 도움이 필요하시면 언제든지 고객지원팀으로 연락해주세요.</p>
        
        <p>감사합니다,<br>
        <strong>Certo 팀</strong></p>
      </div>
      
      ${getEmailFooter()}
    </body>
    </html>
  `
}

// 2. EMAIL CONFIRMATION TEMPLATE
function generateConfirmationEmailHTML(email: string, confirmationLink: string): string {
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>이메일 주소 확인</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="header">
        <h1>📧 이메일 주소 확인</h1>
        <p>Certo에 오신 것을 환영합니다!</p>
      </div>
      
      <div class="content">
        <h2>환영합니다!</h2>
        
        <p><strong>${email}</strong>로 Certo 계정이 생성되었습니다.</p>
        
        <p>계정을 활성화하고 모든 기능을 사용하려면 아래 버튼을 클릭하여 이메일 주소를 확인해주세요:</p>
        
        <div style="text-align: center;">
          <a href="${confirmationLink}" class="button">이메일 주소 확인하기</a>
        </div>
        
        <div class="info-box">
          <strong>✨ Certo에서 할 수 있는 일:</strong>
          <ul>
            <li>전문가 매칭 서비스 이용</li>
            <li>부동산 입찰 참여</li>
            <li>전문가 컨설팅 예약</li>
            <li>맞춤형 부동산 정보 받기</li>
          </ul>
        </div>
        
        <p>이메일 확인이 완료되면 모든 서비스를 이용하실 수 있습니다.</p>
        
        <p>감사합니다,<br>
        <strong>Certo 팀</strong></p>
      </div>
      
      ${getEmailFooter()}
    </body>
    </html>
  `
}

// 3. USER INVITATION TEMPLATE
function generateInvitationEmailHTML(email: string, inviteLink: string, inviterName?: string): string {
  const inviterText = inviterName ? `${inviterName}님이` : '관리자가'
  
  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certo 플랫폼 초대</title>
      ${getEmailStyles()}
    </head>
    <body>
      <div class="header">
        <h1>🎉 Certo 플랫폼 초대</h1>
        <p>전문가 부동산 서비스에 초대되셨습니다</p>
      </div>
      
      <div class="content">
        <h2>초대받으셨습니다!</h2>
        
        <p><strong>${email}</strong>님, 안녕하세요!</p>
        
        <p>${inviterText} Certo 플랫폼에 초대하셨습니다.</p>
        
        <div class="info-box">
          <strong>🏢 Certo 플랫폼 소개:</strong>
          <ul>
            <li>전문가와 고객을 연결하는 부동산 서비스</li>
            <li>투명한 입찰 시스템</li>
            <li>전문가 인증 및 평가 시스템</li>
            <li>안전한 거래 보장</li>
          </ul>
        </div>
        
        <p>아래 버튼을 클릭하여 초대를 수락하고 계정을 생성해주세요:</p>
        
        <div style="text-align: center;">
          <a href="${inviteLink}" class="button">초대 수락하고 가입하기</a>
        </div>
        
        <div class="warning">
          <strong>📝 안내사항:</strong>
          <ul>
            <li>이 초대 링크는 7일 후에 만료됩니다</li>
            <li>초대를 수락하면 이메일 인증이 필요합니다</li>
            <li>계정 생성 후 프로필을 완성해주세요</li>
          </ul>
        </div>
        
        <p>궁금한 점이 있으시면 언제든지 고객지원팀으로 연락해주세요.</p>
        
        <p>감사합니다,<br>
        <strong>Certo 팀</strong></p>
      </div>
      
      ${getEmailFooter()}
    </body>
    </html>
  `
}

// =================================================================
// TEXT VERSIONS FOR EMAIL CLIENTS THAT DON'T SUPPORT HTML
// =================================================================

function generatePasswordResetEmailText(email: string, resetLink: string): string {
  return `
비밀번호 재설정 요청

안녕하세요!

${email} 계정의 비밀번호 재설정을 요청하셨습니다.

아래 링크를 클릭하여 새 비밀번호를 설정해주세요:
${resetLink}

중요한 보안 안내:
- 이 링크는 24시간 후에 만료됩니다
- 이 요청을 하지 않으셨다면 이 이메일을 무시해주세요
- 링크를 클릭하기 전에 이메일 주소를 확인해주세요

문제가 있으시거나 도움이 필요하시면 언제든지 고객지원팀으로 연락해주세요.

감사합니다,
Certo 팀

---
이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.
© ${new Date().getFullYear()} Certo. All rights reserved.
  `
}

function generateConfirmationEmailText(email: string, confirmationLink: string): string {
  return `
이메일 주소 확인

환영합니다!

${email}로 Certo 계정이 생성되었습니다.

계정을 활성화하고 모든 기능을 사용하려면 아래 링크를 클릭하여 이메일 주소를 확인해주세요:
${confirmationLink}

Certo에서 할 수 있는 일:
- 전문가 매칭 서비스 이용
- 부동산 입찰 참여  
- 전문가 컨설팅 예약
- 맞춤형 부동산 정보 받기

이메일 확인이 완료되면 모든 서비스를 이용하실 수 있습니다.

감사합니다,
Certo 팀

---
이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.
© ${new Date().getFullYear()} Certo. All rights reserved.
  `
}

function generateInvitationEmailText(email: string, inviteLink: string, inviterName?: string): string {
  const inviterText = inviterName ? `${inviterName}님이` : '관리자가'
  
  return `
Certo 플랫폼 초대

초대받으셨습니다!

${email}님, 안녕하세요!

${inviterText} Certo 플랫폼에 초대하셨습니다.

Certo 플랫폼 소개:
- 전문가와 고객을 연결하는 부동산 서비스
- 투명한 입찰 시스템
- 전문가 인증 및 평가 시스템
- 안전한 거래 보장

아래 링크를 클릭하여 초대를 수락하고 계정을 생성해주세요:
${inviteLink}

안내사항:
- 이 초대 링크는 7일 후에 만료됩니다
- 초대를 수락하면 이메일 인증이 필요합니다
- 계정 생성 후 프로필을 완성해주세요

궁금한 점이 있으시면 언제든지 고객지원팀으로 연락해주세요.

감사합니다,
Certo 팀

---
이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.
© ${new Date().getFullYear()} Certo. All rights reserved.
  `
}

// =================================================================
// SHARED EMAIL STYLES AND COMPONENTS
// =================================================================

function getEmailStyles(): string {
  return `
    <style>
      body {
        font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #f5f5f5;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #ffffff;
        padding: 30px;
        border-radius: 0 0 10px 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .button {
        display: inline-block;
        background: #007bff;
        color: white !important;
        padding: 15px 30px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
        font-weight: bold;
        transition: background-color 0.3s;
      }
      .button:hover {
        background: #0056b3;
      }
      .footer {
        text-align: center;
        margin-top: 30px;
        color: #666;
        font-size: 14px;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 5px;
      }
      .warning {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        color: #856404;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      .info-box {
        background: #e7f3ff;
        border: 1px solid #b3d9ff;
        color: #0c5460;
        padding: 15px;
        border-radius: 5px;
        margin: 20px 0;
      }
      ul {
        margin: 10px 0;
        padding-left: 20px;
      }
      li {
        margin: 5px 0;
      }
      h1 {
        margin: 0;
        font-size: 24px;
      }
      h2 {
        color: #333;
        font-size: 20px;
        margin-bottom: 15px;
      }
      p {
        margin: 15px 0;
      }
      @media only screen and (max-width: 600px) {
        body {
          padding: 10px;
        }
        .header, .content {
          padding: 20px;
        }
        .button {
          display: block;
          text-align: center;
          margin: 20px auto;
        }
      }
    </style>
  `
}

function getEmailFooter(): string {
  return `
    <div class="footer">
      <p>이 이메일은 자동으로 발송되었습니다. 회신하지 마세요.</p>
      <p><strong>Certo</strong> - 신뢰할 수 있는 부동산 전문가 플랫폼</p>
      <p>© ${new Date().getFullYear()} Certo. All rights reserved.</p>
    </div>
  `
}
