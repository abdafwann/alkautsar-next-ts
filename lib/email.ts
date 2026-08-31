import { Resend } from 'resend';

// Initialize the external email provider
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

/**
 * Standardized email wrapper.
 * If we switch from Resend to NodeMailer, SendGrid, or AWS SES, 
 * we only need to change the implementation inside this function.
 */
export async function sendEmail({ 
  to, 
  subject, 
  html, 
  from = 'Alkautsar Herbal <onboarding@resend.dev>' 
}: EmailPayload) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email Delivery Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email Unexpected Error:', error);
    return { success: false, error };
  }
}
