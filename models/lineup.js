module.exports = (sequelize, DataTypes) => {
    const Lineup = sequelize.define('lineup', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        m_id: {
            type:DataTypes.INTEGER  
        },
        team_type: {
            type: DataTypes.STRING
        },
        team_id: {
            type: DataTypes.INTEGER
        },
        team_name: {
            type: DataTypes.STRING
        },
        player_id: {
            type: DataTypes.INTEGER
        },
        player_name: {
            type: DataTypes.STRING
        },
        player_type: {
            type: DataTypes.STRING
        },
        is_playing: {
            type: DataTypes.BOOLEAN
        }
    })

    return Lineup
}