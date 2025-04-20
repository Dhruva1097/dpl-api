module.exports = (sequelize, DataTypes) => {
    const Referral = sequelize.define('referral', {
        referral_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        referral_code: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        referred_count: {
            type: DataTypes.INTEGER
        },
        referred_by: {
            type: DataTypes.INTEGER
        },
        status: {
            type: DataTypes.INTEGER
        }

    })

    return Referral
}