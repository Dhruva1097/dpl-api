module.exports = (sequelize, DataTypes) => {
    const Full_scorecard = sequelize.define('full_scorecard', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        match_id: {
            type: DataTypes.INTEGER
        },
        score_card: {
            type: DataTypes.JSON
        }
    })

    return Full_scorecard
}