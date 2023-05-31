import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config()

const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: process.env.USER,
        pass: process.env.PASS
    }
});

export default transport; 