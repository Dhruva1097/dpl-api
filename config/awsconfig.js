
const AWS = require('aws-sdk')

AWS.config.update({region : process.env.AWS_REGION})

const s3 = new AWS.S3({
    credentials : { 
        accessKeyId: '',
        secretAccessKey: ''
    }
})

module.exports = s3