module.exports = (sequelize, DataTypes) => {
    const Scorecard = sequelize.define('scorecard', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        match_id: {
            type: DataTypes.INTEGER
        },
        team_id: {
            type: DataTypes.INTEGER
        },
        toss_won: {
            type: DataTypes.INTEGER
        },
        total_score: {
            type: DataTypes.STRING
        },
        byes: {
          type:DataTypes.INTEGER  
        },
        legbyes: {
          type:DataTypes.INTEGER  
        },
        wides: {
            type: DataTypes.INTEGER
        },
        noballs: {
            type: DataTypes.INTEGER
        },
        extras: {
            type: DataTypes.INTEGER
        },
        winning_id: {
            type: DataTypes.INTEGER
        },
        winning_comment: {
            type: DataTypes.STRING
        }
    })

    return Scorecard
}