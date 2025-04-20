module.exports = (sequelize, DataTypes) => {
    const Live_breakup = sequelize.define('live_breakup', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fixture_id: {
            type: DataTypes.INTEGER
        },
        contest_id: {
            type: DataTypes.INTEGER
        },
        winning_amount : {
            type: DataTypes.INTEGER
        },
        size: {
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING
        },
        start: {
            type: DataTypes.INTEGER
        },
        end: {
            type: DataTypes.INTEGER
        },
        prize: {
            type: DataTypes.STRING
        },
        percentage: {
            type: DataTypes.DECIMAL(10,2)
        }
    })
    return Live_breakup
}