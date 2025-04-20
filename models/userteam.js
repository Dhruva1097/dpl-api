module.exports = (sequelize, DataTypes) => {
    const Userteams = sequelize.define('userteam', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sports_id: {
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        match_id: {
            type: DataTypes.INTEGER
        },
        player_id: {
            type: DataTypes.INTEGER,
        },
        team_id: {
            type:DataTypes.INTEGER
        },
        team_count: {
            type:DataTypes.INTEGER
        }
    })

    return Userteams
}