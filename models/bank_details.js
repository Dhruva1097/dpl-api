module.exports = (sequelize, DataTypes) => {
    const Bank_details = sequelize.define('bank_details', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        account_number: {
            type: DataTypes.STRING,
        },
        ifsc_code: {
            type:DataTypes.STRING
        },
        bank_name: {
            type:DataTypes.STRING
        },
        branch: {
            type:DataTypes.STRING
        },
        bank_image: {
            type:DataTypes.STRING
        },
        is_verified: {
            type: DataTypes.INTEGER,
        },
        beneficiary_id: {
            type: DataTypes.INTEGER,
        }  
    })

    return Bank_details
}