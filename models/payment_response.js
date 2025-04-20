module.exports = (sequelize, DataTypes) => {
    const Payment_Response = sequelize.define("payment_response", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement:true
        },
        response: {
            type: DataTypes.JSON
        }
    })

    return Payment_Response
}