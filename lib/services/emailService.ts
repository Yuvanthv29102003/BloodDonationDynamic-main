import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = process.env.EXPO_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EXPO_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.EXPO_PUBLIC_EMAILJS_PUBLIC_KEY;

interface EmailParams {
  to_email: string;
  from_name: string;
  subject: string;
  message: string;
}

export const sendEmail = async (params: EmailParams): Promise<void> => {
  try {
    // Initialize EmailJS with the public key
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY!,
      // Enable strict mode for enhanced security
    //   strict: true,
    });

    await emailjs.send(
      EMAILJS_SERVICE_ID!,
      EMAILJS_TEMPLATE_ID!,
      {
        to_email: params.to_email,
        from_name: params.from_name,
        subject: params.subject,
        message: params.message,
      }
    );
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};