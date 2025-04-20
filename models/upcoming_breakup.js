module.exports = (sequelize, DataTypes) => {
    const Upcoming_breakup = sequelize.define('upcoming_breakup', {
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
    return Upcoming_breakup
}