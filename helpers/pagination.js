
const pagination = (page, limit) => {
    const offset = (page - 1) * limit    
    return {
        offset,
        limit
    }
}

module.exports = pagination