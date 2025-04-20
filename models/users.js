module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define('users', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_name: {
            type: DataTypes.STRING,
        },
        email: {
            type: DataTypes.STRING
        },
        gender: {
            type: DataTypes.INTEGER
        },
        date_of_birth: {
            type: DataTypes.STRING
        },
        mobile_number: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        referred_by: {
            type: DataTypes.INTEGER
        },
        invite_code: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        fcm: {
            type: DataTypes.STRING,
        },
        user_team: {
            type: DataTypes.STRING
        },
        image: {
            type: DataTypes.STRING
        },
        address: {
            type: DataTypes.STRING
        },
        country: {
            type: DataTypes.STRING
        },
        state: {
            type: DataTypes.STRING
        },
        city: {
            type: DataTypes.STRING
        },
        pincode: {
            type: DataTypes.STRING
        },
        device_type: {
            type: DataTypes.STRING
        },
        is_updated: {
            type: DataTypes.INTEGER
        },
        is_verified: {
            type: DataTypes.INTEGER
        },
        cash_balance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        winning_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        cashback: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        level_income: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        bonus_amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0
        },
        active: {
            type:DataTypes.INTEGER
        }
    })

    return Users
}