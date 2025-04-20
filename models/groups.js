module.exports = (sequelize, DataTypes) => {
    const Groups = sequelize.define('groups', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey:true
        },
        parent_g_id: {
            type:DataTypes.INTEGER
        },
        level: {
            type:DataTypes.INTEGER
        },
        left_leg: {
            type:DataTypes.INTEGER
        },
        right_leg: {
            type:DataTypes.INTEGER
        },
        status: {
            type:DataTypes.STRING
        },
        incomelevel: {
            type:DataTypes.INTEGER
        }
    })

    return Groups
}