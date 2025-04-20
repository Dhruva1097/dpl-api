module.exports = (sequelize, DataTypes) => {
    const Captain_Vicecaptain = sequelize.define('userteam_cap_vice', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        sports_id: {
          type:DataTypes.INTEGER  
        },
        match_id: {
            type:DataTypes.INTEGER
        },
        user_id: {
            type:DataTypes.INTEGER
        },
        captain_id: {
            type: DataTypes.INTEGER
        },
        viceCaptain_id: {
            type: DataTypes.INTEGER
        }
    })

    return Captain_Vicecaptain
}