module.exports = (sequelize, DataTypes) => {
    const Contest_category = sequelize.define('contest_category', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        contest_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        description: {
            type: DataTypes.STRING
        },
        image: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.INTEGER
        },     
    })

    return Contest_category
}