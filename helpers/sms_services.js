const accountSid = process.env.NODE_TWILIO_SID
const authToken = process.env.NODE_TWILIO_TOKEN
// const client = require('twilio')(accountSid, authToken)

// const sms_twilio = async (otp, mobile) => {

// await client.messages.create({
//     body:`your otp is ${otp}`,
//     messagingServiceSid: accountSid,
//     to: mobile
// })
// .then(message => console.log(message, 'success'))
// .catch(err => console.log(err, 'error'))
// }

const sms_twilio = () => {}

module.exports = sms_twilio