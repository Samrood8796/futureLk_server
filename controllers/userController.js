import User from "../models/User.js"
import bcrypt from 'bcrypt'
import transport from '../config/nodemailer.js';
import crypto from 'crypto'
import ResetToken from "../models/ResetToken.js";

export const register = async (req, res) => {
    console.log("hgggggggggggggg");
    try {
        console.log(req.body);
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(403).json({ msg: "Email Already Exist" })
        }
        const saltRounds = await bcrypt.genSalt(10)
        const hashedpassword = await bcrypt.hash(req.body.password, saltRounds)
        user = await User.create({ 
            name: req.body.name,
            userName: req.body.userName,
            email: req.body.email,
            password: hashedpassword,
            phoneNumber: req.body.phoneNumber 
        }) 
        res.status(200).json("registered successfully ") 
    } catch (err) {  
        console.log(err);
        return res.status(500).json("internal error Occured" + err)
    }
}

//login
export const login = async (req, res) => {
    try {
        const userData = await User.findOne({ email: req.body.email }) 
        if (!userData) {
            return res.status(400).json({ msg: "user Not Exist" })
        }
        const comparePassword = await bcrypt.compare(req.body.password, userData.password)
        if (!comparePassword) {
            return res.status(401).json({ msg: "incorrect password" })
        }  
     
        const { password, ...user } = userData._doc
        console.log("user===========");
        console.log(user);
        res.status(200).json({ user })  

    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message })
    }
}

//forgot password
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        let user = await User.findOne({ email: email })
        if (!user) return res.status(400).json({ msg: 'acccount not found' })
        let userId = user._id
        const randomText = crypto.randomBytes(20).toString('hex')
        const resetToken = new ResetToken({ 
            user: user._id,
            token: randomText
        })
        await resetToken.save()
        transport.sendMail({
            from: "sender@server.com",
            to: user.email,
            subject: "reset token",
            html: `<a href="https://main.dwnq1g7weluka.amplifyapp.com/resetPassword?token=${randomText}&userId=${userId}">password reset link</a>`
        })
        return res.status(200).json({ msg: 'check your email to reset password' })

    } catch (err) {
        console.log(err);
        return res.status(500).json({msg:'internal error'})
    }
} 

//reset Password 
export const resetPassword = async (req, res) => {
    try {
        const { token, userId } = req.query
        if (!token || !userId) return res.status(400).json({ msg: 'invalid request' })

        const user = await User.findOne({ _id: userId })
        if (!user) return res.status(400).json('user not found')
        const resetToken = await ResetToken.findOne({ user: user._id })
        if (!resetToken) return res.status(400).json({ msg: "Already changed password" })
        const isMatch = await bcrypt.compare(token, resetToken.token)
        if (!isMatch) { return res.status(400).json({ msg: 'token is not valid' }) }
        await ResetToken.deleteOne({ user: user._id })

        const { password } = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        user.password = hashedPassword
        await user.save()

        transport.sendMail({
            from: "sender@server.com",
            to: user.email,
            subject: "your password reset successfull",
            html: `now you can login`
        })
        return res.status(200).json({ msg: 'you can login now' })
    } catch (err) {
        console.log(err);
        return res.status(500).json('internal error')
    }
}