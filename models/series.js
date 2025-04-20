module.exports = (sequelize, DataTypes) => {
    const Series = sequelize.define("series", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
            
        },
        c_id: {
            type: DataTypes.INTEGER,
            unique:true,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        series_name: {
            type:DataTypes.STRING
        },
        series_title: {
            type: DataTypes.STRING
        },
        match_type: {
            type:DataTypes.STRING
        },
        status: {
            type:DataTypes.STRING
        },
        start_date: {
            type:DataTypes.DATE
        },
        end_date: {
            type:DataTypes.DATE
        },
        active: {
            type:DataTypes.INTEGER
        }
        
    })

    return Series
}