module.exports = (sequelize, DataTypes) => {
    const PointSystem = sequelize.define('pointsystem', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        match_type: {
            type:DataTypes.INTEGER
        },
        bat_run: {
            type:DataTypes.INTEGER
        },
        bat_four: {
            type:DataTypes.INTEGER
        },
        bat_six: {
            type:DataTypes.INTEGER
        },
        bat_half_century: {
            type:DataTypes.INTEGER
        },
        bat_century: {
            type:DataTypes.INTEGER
        },
        bat_duck: {
            type:DataTypes.INTEGER
        },
        bowl_wicket: {
            type:DataTypes.INTEGER
        },
        bowl_4wicket: {
            type:DataTypes.INTEGER
        },
        bowl_5wicket: {
            type:DataTypes.INTEGER
        },
        bowl_maiden: {
            type:DataTypes.INTEGER
        },
        bowl_dotball: {
            type:DataTypes.INTEGER
        },
        field_catch: {
            type:DataTypes.INTEGER
        },
        field_runout_direct: {
            type:DataTypes.INTEGER
        },
        field_runout_thrower: {
            type: DataTypes.INTEGER
        },
        field_runout_catcher: {
            type: DataTypes.INTEGER
        },
        captain: {
            type: DataTypes.FLOAT
        },
        vice_captain: {
            type: DataTypes.FLOAT
        },
        starting_11: {
            type: DataTypes.INTEGER
        },
        t10_bonus30_runs: {
            type: DataTypes.INTEGER
        },
        t10_bonus50_runs: {
            type: DataTypes.INTEGER
        },
        t10_bowling2_wicket: {
            type: DataTypes.INTEGER
        },
        t10_bowling3_wicket: {
            type: DataTypes.INTEGER
        },
        t20_eco_lt4runs: {
            type: DataTypes.INTEGER
        },
        t20_eco_gt4runs: {
            type: DataTypes.INTEGER
        },
        t20_eco_gt5runs: {
            type: DataTypes.INTEGER
        },
        t20_eco_gt9runs: {
            type: DataTypes.INTEGER
        },
        t20_eco_gt10runs: {
            type: DataTypes.INTEGER
        },
        t20_eco_gt11runs: {
            type: DataTypes.INTEGER
        },
        odi_eco_lt2_5runs: {
            type: DataTypes.INTEGER
        },
        odi_eco_gt2_5runs: {
            type: DataTypes.INTEGER
        },
        odi_eco_gt3_5runs: {
            type: DataTypes.INTEGER
        },
        odi_eco_gt5runs: {
            type: DataTypes.INTEGER
        },
        odi_eco_gt8runs: {
            type: DataTypes.INTEGER
        },
        odi_eco_gt9runs: {
            type: DataTypes.INTEGER
        },
        t10_eco_lt6runs: {
            type: DataTypes.INTEGER
        },
        t10_eco_gt6runs: {
            type: DataTypes.INTEGER
        },
        t10_eco_bt7_8runs: {
            type: DataTypes.INTEGER
        },
        t10_eco_bt11_12runs: {
            type: DataTypes.INTEGER
        },
        t10_eco_bt12_13runs: {
            type: DataTypes.INTEGER
        },
        t10_eco_gt13_runs: {
            type: DataTypes.INTEGER
        },
        t20_strike_lt50runs: {
            type: DataTypes.INTEGER
        },
        t20_strike_gt50runs: {
            type: DataTypes.INTEGER
        },
        t20_strike_gt60runs: {
            type: DataTypes.INTEGER
        },
        odi_strike_lt40runs: {
            type: DataTypes.INTEGER
        },
        odi_strike_gt40runs: {
            type: DataTypes.INTEGER
        },
        odi_strike_gt50runs: {
            type: DataTypes.INTEGER
        },
        t10_strike_lt80runs: {
            type: DataTypes.INTEGER
        },
        t10_strike_bt80_90runs: {
            type: DataTypes.INTEGER
        },
        t10_strike_gt90runs: {
            type: DataTypes.INTEGER
        }
    })

    return PointSystem
}