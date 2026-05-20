import nodemailer from 'nodemailer';

// Reuse existing SMTP configuration if it exists, or create a default one
// For production, these should be properly set in .env
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS || '';

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, 
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendVerificationEmail = async (doctorEmail: string, doctorName: string) => {
  if (!doctorEmail) {
    console.warn('No email provided for doctor, skipping verification email.');
    return;
  }

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP credentials not configured, skipping email send. Would have sent to:', doctorEmail);
    return;
  }

  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.jinnicare.com'}/login`;
  
  const mailOptions = {
    from: `"JivniCare Partner Network" <${SMTP_USER}>`,
    to: doctorEmail,
    subject: 'Welcome to JivniCare! Your Profile is Verified.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0f766e; margin: 0;">JivniCare</h1>
          <p style="color: #64748b; font-size: 14px; margin-top: 5px;">Partner Network</p>
        </div>
        
        <h2 style="color: #1e293b; font-size: 20px;">Verification Successful</h2>
        <p style="font-size: 16px; line-height: 1.5;">Dear ${doctorName},</p>
        <p style="font-size: 16px; line-height: 1.5;">
          Congratulations! Your professional doctor profile has been successfully verified by our clinical audit team. 
          Welcome to the JivniCare Partner Network.
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #0f766e; padding: 15px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #0f766e; font-size: 16px;">Next Steps for Public Visibility</h3>
          <p style="font-size: 14px; margin-bottom: 0;">
            To ensure patient trust and safety, your profile will only become visible to patients once you complete your mandatory profile setup.
          </p>
          <ul style="font-size: 14px; color: #475569; padding-left: 20px;">
            <li>Upload a professional Profile Image</li>
            <li>Add your Clinic/Hospital Image</li>
            <li>Set your Consultation Fee</li>
            <li>Add your Timings</li>
            <li>Write a brief Biography</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${loginUrl}" style="background-color: #0f766e; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
            Access Doctor Dashboard
          </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px;">
          If you have any questions, please reply to this email or contact our partner support team.
          <br><br>
          Best regards,<br>
          <strong>JivniCare Clinical Operations Team</strong>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${doctorEmail}`);
  } catch (error) {
    console.error(`Failed to send verification email to ${doctorEmail}:`, error);
  }
};
