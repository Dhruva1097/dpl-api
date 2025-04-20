module.exports = (sequelize, DataTypes) => {
    const Performance = sequelize.define('performance', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        m_id: {
            type: DataTypes.INTEGER
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
        p_id: {
            type: DataTypes.INTEGER
        },
        player_name: {
            type: DataTypes.STRING
        },
        player_type: {
            type: DataTypes.STRING
        },
        total_points: {
            type: DataTypes.DECIMAL(10, 2)
        },
        player_points: {
            type: DataTypes.INTEGER
        },
        is_playing: {
            type: DataTypes.BOOLEAN
        },
        total_score: {
            type: DataTypes.INTEGER
        },
        run_scored: {
            type: DataTypes.INTEGER
        },
        balls_faced: {
            type: DataTypes.INTEGER
        },
        fours_hit: {
            type: DataTypes.INTEGER
        },
        sixes_hit: {
            type: DataTypes.INTEGER
        },
        batting_strikerate: {
            type: DataTypes.INTEGER
        },
        batting_position: {
            type: DataTypes.INTEGER
        },
        is_current_batsman: {
            type: DataTypes.BOOLEAN
        },
        extra_runs_scored: {
            type: DataTypes.INTEGER
        },
        out_status: {
            type: DataTypes.BOOLEAN
        },
        out_comment: {
            type: DataTypes.STRING
        },
        overs_bowled: {
            type: DataTypes.INTEGER
        },
        maidens_bowled: {
            type: DataTypes.INTEGER
        },
        wides_bowled: {
            type: DataTypes.INTEGER
        },
        noballs_bowled: {
            type: DataTypes.INTEGER
        },
        runs_given: {
            type: DataTypes.INTEGER
        },
        wickets_taken: {
            type: DataTypes.INTEGER
        },
        bowled_made: {
            type: DataTypes.INTEGER
        },
        lbw_made: {
            type: DataTypes.INTEGER
        },
        economy: {
            type: DataTypes.INTEGER
        },
        is_current_bowler: {
            type: DataTypes.BOOLEAN
        },
        runout_thrower: {
            type: DataTypes.INTEGER
        },
        runout_catcher: {
            type: DataTypes.INTEGER
        },
        runout_direct_hit: {
            type: DataTypes.INTEGER
        },
        stumping: {
            type: DataTypes.INTEGER
        },
        catches: {
            type: DataTypes.INTEGER
        },
        test_player_points: {
            type: DataTypes.DECIMAL(10, 2)
        },
        test_is_playing: {
            type: DataTypes.BOOLEAN
        },
        test_total_score: {
            type: DataTypes.INTEGER
        },
        test_run_scored: {
            type: DataTypes.INTEGER
        },
        test_balls_faced: {
            type: DataTypes.INTEGER
        },
        test_fours_hit: {
            type: DataTypes.INTEGER
        },
        test_sixes_hit: {
            type: DataTypes.INTEGER
        },
        test_batting_strikerate: {
            type: DataTypes.INTEGER
        },
        test_batting_position: {
            type: DataTypes.INTEGER
        },
        test_is_current_batsman: {
            type: DataTypes.BOOLEAN
        },
        test_extra_runs_scored: {
            type: DataTypes.INTEGER
        },
        test_out_status: {
            type: DataTypes.BOOLEAN
        },
        test_out_comment: {
            type: DataTypes.STRING
        },
        test_overs_bowled: {
            type: DataTypes.INTEGER
        },
        test_maidens_bowled: {
            type: DataTypes.INTEGER
        },
        test_wides_bowled: {
            type: DataTypes.INTEGER
        },
        test_noballs_bowled: {
            type: DataTypes.INTEGER
        },
        test_runs_given: {
            type: DataTypes.INTEGER
        },
        test_wickets_taken: {
            type: DataTypes.INTEGER
        },
        test_bowled_made: {
            type: DataTypes.INTEGER
        },
        test_lbw_made: {
            type: DataTypes.INTEGER
        },
        test_economy: {
            type: DataTypes.INTEGER
        },
        test_is_current_bowler: {
            type: DataTypes.BOOLEAN
        },
        test_runout_thrower: {
            type: DataTypes.INTEGER
        },
        test_runout_catcher: {
            type: DataTypes.INTEGER
        },
        test_runout_direct_hit: {
            type: DataTypes.INTEGER
        },
        test_stumping: {
            type: DataTypes.INTEGER
        },
        test_catches: {
            type: DataTypes.INTEGER
        }
    })

    return Performance
}