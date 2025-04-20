module.exports = (sequelize, DataTypes) => {
    const Withdraw_Request = sequelize.define('withdraw_request', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull:false
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull:false
        },
        refund_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull:false
        },
        request_status: {
            type:DataTypes.INTEGER
        },
        email: {
            type:DataTypes.STRING
        },
        type: {
            type:DataTypes.STRING
        },
        reference_id: {
            type:DataTypes.STRING
        },
        transfer_id: {
            type:DataTypes.STRING
        },
        tx_id: {
            type:DataTypes.STRING
        },
        refund_initiate: {
            type:DataTypes.INTEGER
        }
    })

    return Withdraw_Request
}