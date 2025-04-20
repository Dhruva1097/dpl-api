const Joi = require('joi')

const validator = (schema) => (payload) => 
    schema.validate(payload, {abortEarly : false})


const contest_Validation = (role) => {
    const schema = Joi.object({
        match_id : Joi.number().required(),
        filter_key:  Joi.number().required(),
        filter_type: Joi.boolean().required()
    })
    return schema.validate(role);
  };  

  module.exports = {
    contest_Validation
  }

