module.exports = (sequelize, DataTypes) => {
    const Transactions = sequelize.define('transactions', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        trans_type_id: {
            type: DataTypes.INTEGER
        },
        order_id: {
            type: DataTypes.STRING
        },
        txn_id: {
            type: DataTypes.STRING
        },
        banktxn_id: {
            type: DataTypes.STRING
        },
        txn_date: {
            type: DataTypes.DATE
        },
        txn_amount: {
            type: DataTypes.DECIMAL(10, 2)
        },
        currency: {
            type: DataTypes.INTEGER
        },
        gateway_name: {
            type: DataTypes.STRING
        },
        checksum: {
            type: DataTypes.INTEGER
        },
        local_txn_id: {
            type: DataTypes.INTEGER
        },
        merchantTransactionId: {
            type: DataTypes.STRING,
        },
        transactionId: {
            type: DataTypes.STRING,
        },
        pay_api_response: {
            type: DataTypes.STRING,
        },
        status: {
            type: DataTypes.INTEGER
        }
    })

    return Transactions
}