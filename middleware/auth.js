const jwt = require('jsonwebtoken')
const {Users} = require('../models')

const verifyToken = async (req, res, next) => {
    try {
        if (!req?.headers?.authorization) {
            return (
            res.status(400).json({
                status: false,
                message : 'invalid token'
            })
            )
        }
        const token = req.headers.authorization.split(" ")[1]
        const {mobile_number} = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const findUser = await Users.findOne({where: { mobile_number }})
        if (findUser) {
            next()
        } else {
            res.status(400).send('session out')
        }
    } catch (error) {
        res.status(400).json({
            status: false,
            message: 'invalid token'
        })
    }
}

module.exports = verifyToken