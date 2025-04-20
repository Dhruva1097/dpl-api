module.exports = (sequelize, DataTypes) => {
    const Wallet_transaction = sequelize.define('wallet_transaction', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        user_id: {
            type:DataTypes.INTEGER
        },
        transaction_type: {
            type:DataTypes.STRING
        },
        join_contest_details_id: {
            type:DataTypes.INTEGER
        },
        debit_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        credit_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        group_id: {
            type:DataTypes.INTEGER
        },
        team_id: {
            type:DataTypes.INTEGER
        },
        level: {
            type:DataTypes.INTEGER
        },
        referral_income_level: {
            type:DataTypes.INTEGER
        },
        wallet_transaction_id: {
            type:DataTypes.INTEGER
        },
        referral_income_from: {
            type:DataTypes.INTEGER
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.NOW
        }
    })

    return Wallet_transaction
}