// const { console } = require('inspector')
const { Squads, Fixtures, Performance, Sequelize, Lineup, UserTeam, CaptainViceCaptain } = require('../models')
const { Op } = require('sequelize')

const getSquads = async (req, res) => {
    try {
        const { series_id, match_id } = await req.body

        const fixtures = await Fixtures.findOne({
            where: { id: match_id },
            attributes: ["c_id", "team_a_id", "team_b_id"],
            raw: true
        })
        // console.log(fixtures.length,"test")
        var squads = await Squads.findAll({
            where: { 'c_id': fixtures.c_id, 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } },
            attributes: { exclude: ["updatedAt", "createdAt"] },
            raw: true
        })

        /*  const lineup = await Lineup.findAll({
             where: { 'm_id': match_id },
             raw: true
         })
         const lineUpSquad = await Squads.findAll({
             include: [{
                 model: Lineup,
                 attributes: ["player_id"],
                 where: { m_id: match_id }
             }],
             where: { 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } }
         }) */

        const lineUpSquad = await Lineup.findAll({
            where: { 'm_id': match_id, 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } }
        })
        // console.log(lineUpSquad)
        const playingList = lineUpSquad.filter(player => player).map(id => id.player_id)
        const unique_squaddata = [... new Set(squads.map(x => x.player_id))]
        let unique_squad = []
        for (let i = 0; i < unique_squaddata.length; i++) {
            unique_squad.push(squads.find(e => e.player_id === unique_squaddata[i]))
        }

        const series_fixtures = {}
        for (let e of unique_squad) {
            const data = await Fixtures.findAll({
                include: [{
                    model: Performance,
                    attributes: ["player_points"],
                    where: { 'p_id': e.p_id },
                    /* include: [{
                        model: Squads
                    }] */
                }],
                where: { 'series_id': series_id }
            })

            series_fixtures[e.p_id] = data
        }

        const userteams = await CaptainViceCaptain.findAll({
            include: [{
                model: UserTeam
            }],
            where: { 'match_id': match_id }
        })

        await unique_squad.forEach(element => {
            let selected_count = 0
            for (let e of userteams) {
                if (e.userteams.map(e => e.player_id).includes(element.player_id)) {
                    selected_count++
                }
            }
            element.player_image = "",
                element.selected_by = (selected_count / userteams.length) ? `${((selected_count / userteams.length) * 100).toFixed(1)} %` : `${0} %`
            element.fantasy_points = series_fixtures[element.p_id]?.reduce((sum, player) => Number(sum) + Number(player.performances[0].player_points), 0)
        });

        if (lineUpSquad.length) {
            console.log(unique_squad.length)
            for (const dataItem of unique_squad) {
                const entry = lineUpSquad.find(l => l.player_id === dataItem.p_id);
                const isPlaying = entry?.is_playing;
                // if(!entry){
                //     console.log(lineUpSquad)
                // }
                if (isPlaying == 0) {
                    dataItem.is_playing = 0;
                    dataItem.announced = false;
                } else if (isPlaying == 1) {
                    dataItem.is_playing = 1;
                    dataItem.announced = true;
                } else if (isPlaying == 2) {
                    dataItem.is_playing = 2;
                    dataItem.announced = false;
                } else {
                    dataItem.is_playing = 1;
                    dataItem.announced = true;
                }
                // const code = entry?.is_playing ?? 0;  // default to 0 if missing
                // // Set is_playing for API (substitute and announced both become 1)
                // dataItem.is_playing = (code === 1 || code === 2) ? 1 : 0;
                // // announced only when originally announced code = 1
                // dataItem.announced = (code === 1);
                // console.log(dataItem)
                dataItem.player_image = "";
            }

            return res
                .status(200)
                .json({ status: true, message: 'Data Found', data: { lineup: 1, data: unique_squad } });
        }
        else {
            return res.status(200).json({ status: true, message: 'Data Found', data: { lineup: 0, data: unique_squad } })
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error.message })
    }
}

const getSquadf = async (req, res) => {
    try {
        const { series_id, match_id } = await req.body

        const fixtures = await Fixtures.findOne({
            where: { id: match_id },
            attributes: ["c_id", "team_a_id", "team_b_id"],
            raw: true
        })
        var squads = await Squads.findAll({
            where: { 'c_id': fixtures.c_id, 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } },
            include: [{
                model: Lineup,
                where: { 'm_id': match_id, 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } }
            }],
            attributes: { exclude: ["updatedAt", "createdAt"] },
            // raw: true
        })

        const lineUpSquad = squads.map(e => e.lineups).flat()

        /*  const lineup = await Lineup.findAll({
             where: { 'm_id': match_id },
             raw: true
         })
         const lineUpSquad = await Squads.findAll({
             include: [{
                 model: Lineup,
                 attributes: ["player_id"],
                 where: { m_id: match_id }
             }],
             where: { 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } }
         }) */

        /*  const lineUpSquad = await Lineup.findAll({
             where: { 'm_id': match_id, 'team_id': { [Op.in]: [fixtures.team_a_id, fixtures.team_b_id] } }
         }) */

        // const playingList = lineUpSquad.filter(player => player).map(id => id.player_id)
        const playingList = squads.map(e => e.lineups.filter(player => player).map(id => id.player_id)).flat()
        const unique_squaddata = [... new Set(squads.map(x => x.player_id))]
        let unique_squad = []
        for (let i = 0; i < unique_squaddata.length; i++) {
            unique_squad.push(squads.find(e => e.player_id === unique_squaddata[i]))
        }

        const series_fixtures = {}
        for (let e of unique_squad) {
            const data = await Fixtures.findAll({
                include: [{
                    model: Performance,
                    attributes: ["player_points"],
                    where: { 'p_id': e.p_id },
                    /* include: [{
                        model: Squads
                    }] */
                }],
                where: { 'series_id': series_id }
            })
            delete e.lineups
            series_fixtures[e.p_id] = data
        }

        /* const unique_ids = unique_squad.map(e => e.p_id)
        const series_data = await Fixtures.findAll({
            include: [{
                model: Performance,
                attributes: ["p_id", "player_points"],
                where: { 'p_id': { [Op.in]: unique_ids } },
            }],
            where: { 'series_id': series_id }
        })

        const filter_seri_data = await series_data.map(e => e.performances.map(e => e)).flat()

        const series_fixtures = {}

        for (let e of unique_ids) {
            console.log(e)
            console.log(filter_seri_data.find(e => e.p_id == e))
            series_fixtures[e] = filter_seri_data.find(e)
        }*/

        return res.status(200).json({ d: squads })



        const userteams = await CaptainViceCaptain.findAll({
            include: [{
                model: UserTeam
            }],
            where: { 'match_id': match_id }
        })

        await unique_squad.forEach(element => {
            let selected_count = 0
            for (let e of userteams) {
                if (e.userteams.map(e => e.player_id).includes(element.player_id)) {
                    selected_count++
                }
            }
            element.player_image = "",
                element.selected_by = (selected_count / userteams.length) ? `${((selected_count / userteams.length) * 100).toFixed(1)} %` : `${0} %`
            element.fantasy_points = series_fixtures[element.p_id]?.reduce((sum, player) => Number(sum) + Number(player.performances[0].player_points), 0)
        });


        if (lineUpSquad.length) {
            await unique_squad.map(async data => {
                if (await playingList.includes(data.p_id)) {
                    data.is_playing = 1
                }
            })
            await unique_squad.forEach(element => {
                element.player_image = ""
            });
            await res.status(200).json({ status: true, message: 'Data Found', data: { lineup: 1, data: unique_squad } })
        } else {
            await res.status(200).json({ status: true, message: 'Data Found', data: { lineup: 0, data: unique_squad } })
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error.message })
    }
}


module.exports = {
    getSquads
}