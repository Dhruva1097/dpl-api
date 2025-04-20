
const OTP = require('otp-generator')

const message_serivce = async (mobile) => {
        const message =  OTP.generate(6, {lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false }) 

        const data = await fetch(`http://51.255.229.26/api/mt/SendSMS?user=Dayasara&password=Dayasara&senderid=DYASRA&channel=Trans&DCS=0&flashsms=0&number=${mobile}&text=Dear Users, Your OTP To Login on Mobile Application DPL11 Is ${message} Regards, DAYASARA ENTERTAINMENT&route=02&DLTTemplateId=1007490246835321052&PEID=1001182282532516235`).then((res) => console.log(res))
        
        return message    
}

module.exports = message_serivce