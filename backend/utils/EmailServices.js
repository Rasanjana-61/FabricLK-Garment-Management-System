// //backend/utils/EmailServices.js
// const fs = require("fs");
// const path = require("path");
// const nodemailer = require("nodemailer");

// async function createTransporter() {
//   if (process.env.EMAIL_TRANSPORT === "ethereal") {
//     const testAccount = await nodemailer.createTestAccount();
//     console.log("📧 Using Ethereal test account:", testAccount.user);
//     return nodemailer.createTransport({
//       host: "smtp.ethereal.email",
//       port: 587,
//       secure: false,
//       auth: {
//         user: testAccount.user,
//         pass: testAccount.pass,
//       },
//     });
//   }

//   if (process.env.EMAIL_TRANSPORT === "gmail") {
//     return nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });
//   }

//   throw new Error(
//     '❌ EMAIL_TRANSPORT not set or unsupported. Use "ethereal" or "gmail".'
//   );
// }

// async function sendWelcomeEmail(toEmail, userName) {
//   try {
//     const transporter = await createTransporter();
//     const subject = "🎉 Welcome to Our App!";
//     const templatePath = path.join(__dirname, "welcome.html");
//     let html = fs.readFileSync(templatePath, "utf8");
//     html = html
//       .replace("{{username}}", userName)
//       .replace("{{year}}", new Date().getFullYear());

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: toEmail,
//       subject,
//       html,
//     });

//     if (process.env.EMAIL_TRANSPORT === "ethereal") {
//       console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
//     }

//     console.log(`✅ Welcome email sent to ${toEmail}`);
//     return info;
//   } catch (err) {
//     console.error("❌ Error sending welcome email:", err.message);
//     throw err;
//   }
// }

// // ✅ Only export what exists
// module.exports = { sendWelcomeEmail };

const fs = require("fs");
const path = require("path");
const nodemailer = require("nodemailer");

async function createTransporter() {
  if (process.env.EMAIL_TRANSPORT === "ethereal") {
    const testAccount = await nodemailer.createTestAccount();
    console.log("📧 Using Ethereal test account:", testAccount.user);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  if (process.env.EMAIL_TRANSPORT === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  throw new Error(
    '❌ EMAIL_TRANSPORT not set or unsupported. Use "ethereal" or "gmail".'
  );
}

async function sendWelcomeEmail(toEmail, userName) {
  try {
    const transporter = await createTransporter();
    const subject = "🎉 Welcome to FabricLK!";
    const templatePath = path.join(__dirname, "welcome.html");

    // Read HTML template
    let html = fs.readFileSync(templatePath, "utf8");

    // Replace all placeholders
    html = html
      .replace(/{{username}}/g, userName)
      .replace(/{{year}}/g, new Date().getFullYear());

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject,
      html,
    });

    if (process.env.EMAIL_TRANSPORT === "ethereal") {
      console.log("🔗 Preview URL:", nodemailer.getTestMessageUrl(info));
    }

    console.log(`✅ Welcome email sent to ${toEmail}`);
    return info;
  } catch (err) {
    console.error("❌ Error sending welcome email:", err.message);
    throw err;
  }
}

module.exports = { sendWelcomeEmail };
