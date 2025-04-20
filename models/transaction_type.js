module.exports = (sequelize, DataTypes) => {
    const Transactions_type = sequelize.define('transactions_type', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        transactions_name: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.INTEGER
        }
    })

    return Transactions_type
}