
const jwt = require('jsonwebtoken')
const {Users} = require('../models')

const fetch_user = async (token) => {
    try {
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const findUser = await Users.findOne({
            where: { mobile_number },
            attributes: { exclude: ['createdAt', 'updatedAt', 'active'] }
        })
        return findUser
    } catch (error) {
        console.log(error);
    }
}

module.exports = fetch_user
