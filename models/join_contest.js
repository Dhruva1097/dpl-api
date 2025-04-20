module.exports = (sequelize, DataTypes) => {
    const Join_contest = sequelize.define('join_contest', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        group_id: {
            type: DataTypes.INTEGER,
        },
        player_team_id: {
            type: DataTypes.INTEGER,
        },
        player_points: {
          type:DataTypes.DECIMAL(10,2)  
        },
        previous_rank: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        current_rank: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        position: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        contest_id: {
            type: DataTypes.INTEGER,
        },
        series_id: {
            type: DataTypes.INTEGER,
        },
        fixture_id: {
            type: DataTypes.INTEGER,
        },
        admin_comission: {
            type: DataTypes.INTEGER,
        },
        bonus_amount: {
            type: DataTypes.INTEGER,
        },
        winning_amount: {
            type: DataTypes.INTEGER,
        },
        total_amount: {
            type: DataTypes.INTEGER,
        },
        deposit_cash: {
            type: DataTypes.INTEGER,
        },
        wallet_type: {
            type: DataTypes.INTEGER,
        },
        status: {
            type: DataTypes.INTEGER
        },
        winning_amount_notification: {
            type:DataTypes.INTEGER
        },
        winning_amount_distributed: {
            type:DataTypes.INTEGER
        }
    })

    return Join_contest
}