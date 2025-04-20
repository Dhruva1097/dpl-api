module.exports = (sequelize, DataTypes) => {
    const Match_contest = sequelize.define('match_contest', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        fixture_id: {
            type: DataTypes.INTEGER,
        },
        contest_id: {
            type: DataTypes.INTEGER,
        },
        is_cancelled: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.INTEGER
        },
    })

    return Match_contest
}