module.exports = (sequelize, DataTypes) => {
    const Fixtures = sequelize.define('fixtures', {
        id : {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        sports_id: {
            type: DataTypes.INTEGER,
        },
        c_id: {
            type: DataTypes.INTEGER
        },
        series_id: {
          type:DataTypes.INTEGER  
        },
        m_id: {
            type: DataTypes.INTEGER,
        },
        match_title: {
            type: DataTypes.STRING,
        },
        match_type: {
          type:DataTypes.STRING  
        },
        match_date: {
            type: DataTypes.DATE,
        },
        team_a_id: {
            type: DataTypes.INTEGER,
        },
        team_a: {
            type: DataTypes.STRING,
        },
        team_a_short: {
            type:DataTypes.STRING
        },
        team_a_flag: {
          type:DataTypes.STRING  
        },
        team_b_id: {
            type: DataTypes.INTEGER,
        },
        team_b: {
            type: DataTypes.STRING,
        },
        team_b_short: {
            type: DataTypes.STRING
        },
        team_b_flag: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
        },
        active: {
            type: DataTypes.INTEGER,
        },
        is_playing: {
            type: DataTypes.INTEGER,
        },
        lineup_out: {
            type:DataTypes.BOOLEAN
        },
        result_flag: {
            type: DataTypes.STRING,
        },
    })
    return Fixtures
}