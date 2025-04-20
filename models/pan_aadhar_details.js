module.exports = (sequelize, DataTypes) => {
    const Pan_aadhar_details = sequelize.define('pan_aadhar_details', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        pan_card: {
            type:DataTypes.STRING
        },
        pan_image: {
            type:DataTypes.STRING
        },
        pan_name: {
            type:DataTypes.STRING
        },
        aadhar_card: {
            type:DataTypes.STRING
        },
        is_verified: {
            type: DataTypes.INTEGER,
        },
        date_of_birth: {
            type: DataTypes.DATE,
        },
        state: {
            type:DataTypes.STRING
        }    
    })

    return Pan_aadhar_details
}