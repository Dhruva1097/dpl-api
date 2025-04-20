module.exports = (sequelize, DataTypes) => {
    const Teams = sequelize.define('teams', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        sports_id: {
            type:DataTypes.INTEGER
        },
        team_id: {
            type:DataTypes.INTEGER,
            primaryKey:true
        },
        team_name: {
            type:DataTypes.STRING
        },
        team_short_name: {
            type:DataTypes.STRING
        },
        team_flag: {
            type:DataTypes.STRING
        },
        status: {
            type:DataTypes.INTEGER
        }
    })

    return Teams
}