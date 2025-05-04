
import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();

    console.log('📧 Sending email to:', to);
    console.log('Subject:', subject);
    console.log('Text:', text);

    const info = await transporter.sendMail({
      from: `"Urban Trolly" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log('✅ Email sent:', info.response);
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
  }
};

export default sendEmail;
