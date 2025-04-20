module.exports = (sequelize, DataTypes) => {
    const Setting = sequelize.define('setting', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        admin_email: {
            type: DataTypes.STRING,
        },
        admin_percentage: {
            type: DataTypes.INTEGER
        },
        vendor_percentage: {
            type: DataTypes.INTEGER
        },
        referral_bonus_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_code: {
            type: DataTypes.STRING,
        },
        default_ref: {
            type: DataTypes.STRING,
        },
        total_group_count: {
            type: DataTypes.INTEGER
        },
        min_withdraw_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        max_withdraw_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_first: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_second: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_third: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_four: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_five: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_six: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_seven: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_eight: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_nine: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_ten: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_eleven: {
            type: DataTypes.DECIMAL(10, 2)
        },
        level_twelve: {
            type: DataTypes.DECIMAL(10, 2)
        },
        status: {
            type: DataTypes.INTEGER
        },
        referral_income_l1: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l2: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l3: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l4: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l5: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l6: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l7: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l8: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l9: {
            type: DataTypes.DECIMAL(10, 2)
        },
        referral_income_l10: {
            type: DataTypes.DECIMAL(10, 2)
        }
    })

    return Setting
}