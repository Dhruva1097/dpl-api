module.exports = (sequelize, DataTypes) => {
    const Squads = sequelize.define('squads', {
        p_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        c_id: {
            type: DataTypes.INTEGER
        },
        series_id: {
            type: DataTypes.INTEGER
        },
        team_id: {
            type: DataTypes.INTEGER
        },
        team_name: {
            type: DataTypes.STRING
        },
        player_id: {
            type: DataTypes.INTEGER,
            foreignKey: true
        },
        player_name: {
            type: DataTypes.STRING
        },
        player_short_name: {
            type: DataTypes.STRING
        },
        player_type: {
            type: DataTypes.STRING
        },
        batting_style: {
            type:DataTypes.STRING
        },
        bowling_style: {
            type: DataTypes.STRING
        },
        nationality: {
            type: DataTypes.STRING
        },
        player_credit: {
            type: DataTypes.STRING
        },
        type: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.INTEGER
        },
        player_points: {
            type: DataTypes.INTEGER
        },
        is_playing: {
            type: DataTypes.INTEGER
        }
    })

    return Squads
}