const jwt = require('jsonwebtoken')
const { Users, CaptainViceCaptain, UserTeam, Squads, Lineup, Performance, PointSystem, Series, Join_contest, Teams, Fixtures } = require('../models')
const { fetch_user } = require('../helpers')
const { Op } = require('sequelize')
const e = require('express')

const creatUserTeam = async (req, res) => {
    try {
        const { captain_id, vice_captain_id, match_id, sports_id, player_id, team_id, series_id } = await req.body
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const { id } = await Users.findOne({ where: { 'mobile_number': mobile_number }, raw: true })
        const user_token = await fetch_user(req.headers.authorization.split(" ")[1])
        const check_cap = await CaptainViceCaptain.findAll({
            where: {
                [Op.and]: [
                    { captain_id },
                    { viceCaptain_id: vice_captain_id },
                    { match_id },
                    { user_id: id }
                ]
            }
        })

        const validate_team = []

        if (check_cap.length) {
            let check_team = ''
            for (let i = 0; i < check_cap.length; i++) {
                if (team_id === "") {
                    check_team = await UserTeam.findAll({
                        where: {
                            [Op.and]: [
                                { match_id },
                                { user_id: id },
                                { player_id: { [Op.in]: player_id } }
                            ]
                        }
                    })
                } else {
                    check_team = await UserTeam.findAll({
                        where: {
                            [Op.and]: [
                                { match_id },
                                { user_id: id },
                                { team_id: team_id },
                                { player_id: { [Op.in]: player_id } }
                            ]
                        }
                    })
                }
                validate_team.push(check_team)
            }
        }

        const fetch_length = await CaptainViceCaptain.count({
            where: {
                [Op.and]: [
                    { match_id },
                    { user_id: id }
                ]
            }
        })

        if (team_id === '' && fetch_length > 19) {
            return (
                res.status(400).json({
                    status: false,
                    message: "Cannot create more than 20 teams",
                    data: {}
                })
            )
        }

        if (validate_team[0]?.length >= 11) {
            return (
                res.status(400).json({
                    status: false,
                    message: "team already exist",
                    data: {}
                })
            )
        }

        const fetch_squad = await Squads.findAll({
            where: {
                series_id,
                player_id: { [Op.in]: player_id }
            }
        })

        let userTeamCapVice = ""
        if (team_id === "") {
            userTeamCapVice = await CaptainViceCaptain.create({
                match_id,
                sports_id,
                user_id: id,
                captain_id,
                viceCaptain_id: vice_captain_id
            })
        } else {
            const data = await CaptainViceCaptain.update({
                captain_id,
                viceCaptain_id: vice_captain_id
            }, {
                where: {
                    match_id,
                    user_id: id,
                    id: team_id
                }
            })
            const dat = await CaptainViceCaptain.findAll({
                where: {
                    id: data
                }, raw: true
            })
            userTeamCapVice = dat[0]
        }
        const count = await CaptainViceCaptain.count({ where: { 'user_id': id, 'match_id': match_id } })
        const userTeams = await CaptainViceCaptain.findAll({ where: { 'user_id': user_token.id, 'match_id': match_id }, raw: true })
        const test = await UserTeam.findAll({ where: { 'user_id': id }, raw: true })
        const testIdList = await test.map(teamid => teamid.team_id)
        const userTeamIdList = [...new Set(userTeams.map(id => id.id))]
        let fetch_team = ''
        if (team_id === "") {
            fetch_team = await UserTeam.findAll({
                where: {
                    match_id,
                    user_id: id
                }
            })
        } else {
            fetch_team = await UserTeam.findAll({
                where: {
                    match_id,
                    team_id,
                    user_id: id
                }
            })
        }

        let fetch_id = fetch_team.length ? fetch_team[0].id : 1
        await userTeamIdList.map(async teamid => {
            await player_id.map(async (playerId, i) => {
                if (!testIdList.includes(teamid)) {
                    if (team_id === "") {
                        await UserTeam.create({
                            match_id,
                            sports_id,
                            user_id: id,
                            player_id: playerId,
                            team_id: teamid,
                            team_count: count
                        })
                    }
                }
                if (team_id !== "") {
                    await UserTeam.update({
                        player_id: playerId,

                    }, {
                        where: {
                            id: (fetch_id + i)
                        }
                    })
                }
            })
        })
        // await res.status(200).json({ status: true, message: "Data Found", data: { userTeamCapVice } })
        await res.status(200).json({
            status: true, message: "Data Found", data: team_id ? {
                userTeamCapVice: {
                    id: Number(team_id)
                }
            } : { userTeamCapVice }
        })
    }

    catch (error) {
        console.log(error.message)
        await res.status(400).json({ status: false, message: error.message })
    }
}

const getUserTeam = async (req, res) => {
    try {
        const { match_id, series_id, contest_id } = await req.body
        const token = await req.headers.authorization.split(" ")[1]
        const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        const { id } = await Users.findOne({ where: { 'mobile_number': mobile_number }, raw: true })
        const fetch_contest = await Join_contest.findAll({
            where: {
                user_id: id,
                fixture_id: match_id,
                contest_id: contest_id
            }
        })
        const team_players = await Fixtures.findOne({
            where: {
                id: match_id
            }
        })
        const userteam = await CaptainViceCaptain.findAll({ attributes: { exclude: ['sports_id', 'user_id', 'createdAt', 'updatedAt'] }, include: [UserTeam], where: { 'match_id': match_id, 'user_id': id } })
        const teamData = await JSON.parse(JSON.stringify(userteam)).filter(data => data.userteams)
        const playerData = await teamData.map(data => data.userteams)
        const playeridlist = await playerData.map(data => data.map(data => data.player_id))
        const captainIdList = await teamData.map(data => data.captain_id)
        const viceCapIdList = await teamData.map(data => data.viceCaptain_id)
        const playerTeamIdList = await teamData.map(data => data.id)
        var teamplayers = []
        const fetch_team_name = []
        for (ids in playeridlist) {
            const data = await Squads.findAll({ attributes: { exclude: ['c_id', 'series_id', 'createdAt', 'updatedAt'] }, where: { 'series_id': series_id, 'player_id': { [Op.in]: playeridlist[ids] } }, raw: true })
            var no_of_bat = data.filter(e => e.player_type === 'bat').length
            var no_of_bowl = data.filter(e => e.player_type === 'bowl').length
            var no_of_wk = data.filter(e => e.player_type === 'wk').length
            var no_of_ar = data.filter(e => e.player_type === 'ar').length
            var captain = data.filter(e => e.player_id === captainIdList[ids])[0].player_short_name
            var vice_captain = data.filter(e => e.player_id === viceCapIdList[ids])[0].player_short_name
            var fetch_unique = [... new Set(data.map(x => x.team_name))]
            if (!fetch_team_name.length) {
                fetch_team_name.push(...fetch_unique)
            }
            // console.log(data, ids);
            var team_a_count = data.filter(e => e.team_name === fetch_unique[0]).length
            var team_b_count = data.filter(e => e.team_name === fetch_unique[1]).length
            var cap_team = data.filter(e => e.player_id === captainIdList[ids])[0].team_id === team_players.team_a_id
            var vc_team = data.filter(e => e.player_id === viceCapIdList[ids])[0].team_id === team_players.team_a_id
            // console.log(captainIdList[ids])
            // console.log(data.filter(e => console.log('res', e.player_id)))
            // console.log(data)
            // console.log(data.filter(e => e.player_id === captainIdList[ids]))
            // console.log(data.filter(e => e.player_id === captainIdList[ids])[0].player_short_name)
            var team_name = teamData[ids].userteams[0].team_count
            var team_id = playerTeamIdList[ids]
            var team_a_name = ''
            var team_b_name = ''
            var is_joined = contest_id === "" ? false : fetch_contest.find(con => con.player_team_id === playerTeamIdList[ids]) ? true : false
            teamplayers.push({
                captain, team_a_count,
                team_name,
                cap_team,
                team_a_name,
                team_b_name,
                vc_team,
                is_joined,
                team_b_count,
                vice_captain,
                team_id,
                no_of_bat,
                no_of_bowl,
                no_of_wk,
                no_of_ar,
                teamplayers: data
            })
        }

        const team = await Teams.findAll({
            where: {
                team_name: fetch_team_name
            }
        })

        teamplayers.forEach(e => {
            e.team_a_name = team[0]?.team_short_name,
                e.team_b_name = team[1]?.team_short_name
        })

        await res.status(200).json({
            status: true,
            message: "Data Found",
            data: {
                data: teamplayers
            }
        })
    }
    catch (error) {
        console.log(error.message)
        res.status(400).json({ status: false, message: error.message })
    }
}

const getUserTeambyId = async (req, res) => {
    try {
        const { team_id, series_id } = await req.body
        const token = await req.headers.authorization.split(" ")[1]
        // const { mobile_number } = jwt.verify(token, process.env.NODE_SECRET_KEY)
        // const { id } = await Users.findOne({ where: { 'mobile_number': mobile_number } })
        const userteam = await CaptainViceCaptain.findAll({ attributes: { exclude: ['sports_id', 'user_id', 'createdAt', 'updatedAt'] }, include: [UserTeam], where: { 'id': team_id, /* 'user_id': id */ } })
        const teamData = await JSON.parse(JSON.stringify(userteam)).filter(data => data.userteams).map(data => data.userteams)
        const playerIdList = await teamData[0].map(data => data.player_id)
        var teamPlayers = []
        const cap_id = JSON.parse(JSON.stringify(userteam))[0].captain_id
        const vc_id = JSON.parse(JSON.stringify(userteam))[0].viceCaptain_id
        const match_id = JSON.parse(JSON.stringify(userteam))[0].match_id
        const lineup = await Lineup.findAll({ where: { 'm_id': match_id }, raw: true })
        // console.log(lineup)
        for (i in playerIdList) {
            const data = await Squads.findAll({
                attributes: { exclude: ['c_id', 'series_id', 'player_points','createdAt', 'updatedAt'] },
                include: [{
                    model: Lineup,
                    where: { 'm_id': match_id },
                    required: false
                }, {
                    model: Performance,
                    where: { 'm_id': match_id },
                    required: false,
                    attributes:["player_points"]
                }],
                where: { 'player_id': { [Op.in]: [playerIdList[i]] }, 'series_id': series_id }
            })
            if (JSON.parse(JSON.stringify(data))[0].lineups.length) {
                data[0].is_playing = 1
            }
            teamPlayers.push(data)
        }
        const result = await JSON.parse(JSON.stringify(teamPlayers)).map(e => {
            delete e[0].lineups
            e[0].player_id == cap_id ? e[0].is_captain = 1 : e[0].is_captain = 0
            e[0].player_id == vc_id ? e[0].is_vice_captain = 1 : e[0].is_vice_captain = 0
            if (e[0].player_id == cap_id) {
                e[0].player_points = e[0].performances[0]?.player_points ? (e[0].performances[0]?.player_points * 2) : 0                
            } 
            else if (e[0].player_id == vc_id) {
                e[0].player_points = e[0].performances[0]?.player_points ? (e[0].performances[0]?.player_points * 1.5) : 0
            }
            else {
                e[0].player_points = e[0].performances[0]?.player_points ? e[0].performances[0]?.player_points : 0
            }
            delete e[0].performances
            console.log(e[0])
            return (
                e[0]
            )
        })
        // console.log(series_id, 'id')
        /* const pts = await getuserPlayerPoints(lineup, series_id, match_id)
 
        const { match_type } = await Series.findOne({ where: { id: series_id }, raw: true })
        const mat = match_type?.toLowerCase() == 'odi' ? 2 : match_type?.toLowerCase() == 'lista' ? 2 : match_type?.toLowerCase() == 't20' ? 1 : match_type?.toLowerCase() == 't20i' ? 1 : match_type?.toLowerCase() == 'test' ? 3 : match_type?.toLowerCase() == 't10' ? 4 : ''

        const points = await PointSystem.findAll({ where: { match_type: mat }, raw: true }) */
        /* await pts.map(async pts => {
            await result.forEach(async (e, i) => {
                if (Object.keys(pts)[0] == e.player_id) {
                    if (e.is_captain && e.is_playing) {
                        e.player_points = Object.values(pts)[0] * points[0].captain
                    }
                    else if (e.is_vice_captain && e.is_playing) {
                        e.player_points = Object.values(pts)[0] * points[0].vice_captain
                    }
                    else {
                        if (e.is_playing) {
                            e.player_points = Object.values(pts)[0]
                        }
                        else e.player_points = 0
                    }
                }
            })
        }) */
        // const team_points = result.map(e => e.player_points)
        // let sum = 0
        // await team_points.forEach(num => sum += num)
        await res.status(200).json({ status: true, message: "Data Found", data: { lineup: lineup.length ? 1 : 0, data: result } })
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ status: false, message: error.message })
    }
}

const getuserPlayerPoints = async (data, series_id, match_id) => {
    try {
        // console.log(data)
        const playerIdList = await data.map(e => e.player_id)
        // console.log(playerIdList)
        const pId = await Squads.findAll({ where: { 'p_id': { [Op.in]: playerIdList } }, raw: true })
        const pIdList = await pId.map(e => e.p_id)
        // console.log(pIdList);
        const performance = await Performance.findAll({ where: { p_id: { [Op.in]: pIdList }, m_id: match_id }, raw: true })
        // console.log(performance.length, 'lll')
        const { match_type } = await Series.findOne({ where: { id: series_id }, raw: true })
        // console.log(match_type?.toLowerCase(), 'match')
        const mat = match_type?.toLowerCase() == 'odi' ? 2 : match_type?.toLowerCase() == 'lista' ? 2 : match_type?.toLowerCase() == 't20' ? 1 : match_type?.toLowerCase() == 't20i' ? 1 : match_type?.toLowerCase() == 'test' ? 3 : match_type?.toLowerCase() == 't10' ? 4 : ''
        const points = await PointSystem.findAll({ where: { match_type: mat }, raw: true })
        // console.log(points[0])
        const { bat_run, bat_four, bat_six, bat_half_century, bat_century, bat_duck, bowl_wicket, bowl_4wicket, bowl_5wicket, bowl_maiden, bowl_dotball, field_catch, field_runout_direct, field_runout_thrower, field_runout_catcher, captain, vice_captain, starting_11, t10_bonus30_runs, t10_bonus50_runs, t10_bowling2_wicket, t10_bowling3_wicket, t20_eco_lt4runs, t20_eco_gt4runs, t20_eco_gt5runs, t20_eco_gt9runs, t20_eco_gt10runs, t20_eco_gt11runs, odi_eco_lt2_5runs, odi_eco_gt2_5runs, odi_eco_gt3_5runs, odi_eco_gt5runs, odi_eco_gt8runs, odi_eco_gt9runs, t10_eco_lt6runs, t10_eco_gt6runs, t10_eco_bt7_8runs, t10_eco_bt11_12runs, t10_eco_bt12_13runs, t10_eco_gt13_runs, t20_strike_lt50runs, t20_strike_gt50runs, t20_strike_gt60runs, odi_strike_lt40runs, odi_strike_gt40runs, odi_strike_gt50runs, t10_strike_lt80runs, t10_strike_bt80_90runs, t10_strike_gt90runs } = points[0]
        // console.log(performance[0])
        var pts = 0
        var ecorate_points
        var ecorate
        var century_halfcentury_point
        var century_halfcentury
        var duckout_points
        var duckOut
        var bonusPoints
        var bonus
        var strike
        var strike_points
        var total_pts

        return player_points = await performance.map(performance => {
            pts = starting_11 + (performance.run_scored * bat_run) + (performance.fours_hit * bat_four) + (performance.sixes_hit * bat_six)
            if (performance.run_scored >= 50 && performance.run_scored <= 99) {
                pts = pts + bat_half_century
                century_halfcentury_point = bat_half_century
                century_halfcentury = 1
            }
            if (performance.run_scored >= 100) {
                pts = pts + bat_century
                century_halfcentury_point = bat_century
                century_halfcentury_point = 1
            }
            if (performance.run_scored == 0 && performance.player_type !== 'bowl' && performance.out_status == 1) {
                pts = pts + bat_duck
                duckout_points = bat_duck
                duckOut = 1
            }
            if (performance.wickets_taken !== "") {
                pts = pts + (performance.wickets_taken * bowl_wicket)
            }
            if (performance.wickets_taken == 4) {
                pts = pts + bowl_4wicket
                bonusPoints = bowl_4wicket
                bonus = 1
            }
            if (performance.wickets_taken >= 5) {
                pts = pts + bowl_5wicket
                bonusPoints = bowl_5wicket
                bonus = 1
            }
            if (performance.maidens_bowled != '') {
                pts = pts + (performance.maidens_bowled * bowl_maiden)
            }
            pts = pts + (performance.catches * field_catch)
            pts = pts + ((performance.runout_thrower ? ((performance.runout_thrower * field_runout_thrower) + (performance.runout_catcher * field_runout_catcher) + (performance.runout_direct_hit * field_runout_direct) + (performance.stumping * field_runout_direct)) : performance.runout_catcher ? ((performance.runout_thrower * field_runout_thrower) + (performance.runout_catcher * field_runout_catcher) + (performance.runout_direct_hit * field_runout_direct) + (performance.stumping * field_runout_direct)) : performance.runout_direct_hit ? ((performance.runout_thrower * field_runout_thrower) + (performance.runout_catcher * field_runout_catcher) + (performance.runout_direct_hit * field_runout_direct) + (performance.stumping * field_runout_direct)) : performance.stumping ? ((performance.runout_thrower * field_runout_thrower) + (performance.runout_catcher * field_runout_catcher) + (performance.runout_direct_hit * field_runout_direct) + (performance.stumping * field_runout_direct)) : 0))
            // pts = pts + ((performance.runout_thrower + performance.runout_catcher + performance.runout_direct_hit) * (field_runout_thrower + field_runout_catcher + field_runout_direct))
            // pts = pts + (performance.stumping * field_runout_direct)
           
            if ((match_type?.toLowerCase() == 't20' || match_type?.toLowerCase() == 't20i') || match_type?.toLowerCase() == 't10') {
                if (performance.overs_bowled >= 2) {
                    if (performance.economy < 4) {
                        pts = pts + t20_eco_lt4runs
                        ecorate = performance.economy
                        ecorate_points = t20_eco_lt4runs
                    }
                    if (performance.economy >= 4 && performance.economy <= 4.99) {
                        pts = pts + t20_eco_gt4runs
                        ecorate = performance.economy
                        ecorate_points = t20_eco_gt4runs
                    }
                    if (performance.economy > 5 && performance.economy <= 8.99) {
                        pts = pts + t20_eco_gt5runs
                        ecorate = performance.economy
                        ecorate_points = t20_eco_gt5runs
                    }
                    if (performance.economy >= 9 && performance.economy <= 10) {
                        pts = pts + t20_eco_gt9runs
                        ecorate = performance.economy
                        ecorate_points = t20_eco_gt9runs
                    }
                    if (performance.economy >= 10.1 && performance.economy <= 11) {
                        pts = pts + t20_eco_gt10runs
                        ecorate = performance.economy
                        ecorate_points = t20_eco_gt10runs
                    }
                    if (performance.economy > 11) {
                        pts = pts + t20_eco_gt11runs
                        ecorate = performance.economy
                        ecorate_points = t20_eco_gt11runs
                    }
                }
            } else {
                if (performance.overs_bowled >= 5) {
                    if (performance.economy < 2.5) {
                        pts = pts + odi_eco_lt2_5runs
                        ecorate = performance.economy
                        ecorate_points = odi_eco_lt2_5runs
                    }
                    if (performance.economy >= 2.5 && performance.economy <= 3.49) {
                        pts = pts + odi_eco_gt2_5runs
                        ecorate = performance.economy
                        ecorate_points = odi_eco_gt2_5runs
                    }
                    if (performance.economy > 3.5 && performance.economy <= 4.9) {
                        pts = pts + odi_eco_gt3_5runs
                        ecorate = performance.economy
                        ecorate_points = odi_eco_gt3_5runs
                    }
                    if (performance.economy >= 5 && performance.economy <= 8) {
                        pts = pts + odi_eco_gt5runs
                        ecorate = performance.economy
                        ecorate_points = odi_eco_gt5runs
                    }
                    if (performance.economy >= 8.1 && performance.economy <= 9) {
                        pts = pts + odi_eco_gt8runs
                        ecorate = performance.economy
                        ecorate_points = odi_eco_gt8runs
                    }
                    if (performance.economy > 9) {
                        pts = pts + odi_eco_gt9runs
                        ecorate = performance.economy
                        ecorate_points = odi_eco_gt9runs
                    }
                }
            }


            if ((match_type?.toLowerCase() == 't20' || match_type?.toLowerCase() == 't20i') || match_type?.toLowerCase() == 't10') {
                if (performance.balls_faced > 20) {
                    if (performance.batting_strikerate <= 49.99) {
                        pts = pts + t20_strike_lt50runs
                        strike = performance.batting_strikerate
                        strike_points = t20_strike_lt50runs
                    }
                    if (performance.batting_strikerate >= 50 && performance.batting_strikerate <= 59.99) {
                        pts = pts + t20_strike_gt50runs
                        strike = performance.batting_strikerate
                        strike_points = t20_strike_gt50runs
                    }
                    if (performance.batting_strikerate >= 60 && performance.batting_strikerate <= 70) {
                        pts = pts + t20_strike_gt60runs
                        strike = performance.batting_strikerate
                        strike_points = t20_strike_gt60runs
                    }
                }
            } else {
                if (performance.balls_faced > 20) {
                    if (performance.batting_strikerate <= 39.99) {
                        pts = pts + odi_strike_lt40runs
                        strike = performance.batting_strikerate
                        strike_points = odi_strike_lt40runs
                    }
                    if (performance.batting_strikerate >= 40 && performance.batting_strikerate <= 49.99) {
                        pts = pts + odi_strike_gt40runs
                        strike = performance.batting_strikerate
                        strike_points = odi_strike_gt40runs
                    }
                    if (performance.batting_strikerate >= 50 && performance.batting_strikerate <= 60) {
                        pts = pts + odi_strike_gt50runs
                        strike = performance.batting_strikerate
                        strike_points = odi_strike_gt50runs
                    }
                }
            }

            total_pts = starting_11 + (performance.run_scored * bat_run) + (performance.fours_hit * bat_four) + (performance.sixes_hit * bat_six) + strike_points + (century_halfcentury * century_halfcentury_point) + duckout_points + (performance.wickets_taken * bowl_wicket) + (performance.maidens_bowled * bowl_maiden) + ecorate_points + bonusPoints + (performance.catches * field_catch) + (performance.stumping * field_runout_direct) + ((performance.runout_thrower + performance.runout_catcher + performance.runout_direct_hit) * (field_runout_thrower + field_runout_catcher + field_runout_direct))
            var point = {}
            point[performance.player_id] = pts
            // console.log(point, 'kkk')
            return point
        })
    }
    catch (error) {
        console.log(error.message)
    }
}

const getuserPlayerPointsTest = async (data, series_id, match_id) => {
    try {
        const playerIdList = await data.map(e => e.player_id)
        const pId = await Squads.findAll({ where: { 'p_id': { [Op.in]: playerIdList } }, raw: true })
        const pIdList = await pId.map(e => e.p_id)
        const performance = await Performance.findAll({ where: { p_id: { [Op.in]: pIdList, m_id: match_id } }, raw: true })
        const { match_type } = await Series.findOne({ where: { id: series_id }, raw: true })
        const mat = match_type?.toLowerCase() == 'odi' ? 2 : match_type?.toLowerCase() == 'lista' ? 2 : match_type?.toLowerCase() == 't20' ? 1 : match_type?.toLowerCase() == 't20i' ? 1 : match_type?.toLowerCase() == 'test' ? 3 : match_type?.toLowerCase() == 't10' ? 4 : ''
        const points = await PointSystem.findAll({ where: { match_type: mat }, raw: true })

        const { bat_run, bat_four, bat_six, bat_half_century, bat_century, bat_duck, bowl_wicket, bowl_4wicket, bowl_5wicket, bowl_maiden, bowl_dotball, field_catch, field_runout_direct, field_runout_thrower, field_runout_catcher, captain, vice_captain, starting_11, t10_bonus30_runs, t10_bonus50_runs, t10_bowling2_wicket, t10_bowling3_wicket, t20_eco_lt4runs, t20_eco_gt4runs, t20_eco_gt5runs, t20_eco_gt9runs, t20_eco_gt10runs, t20_eco_gt11runs, odi_eco_lt2_5runs, odi_eco_gt2_5runs, odi_eco_gt3_5runs, odi_eco_gt5runs, odi_eco_gt8runs, odi_eco_gt9runs, t10_eco_lt6runs, t10_eco_gt6runs, t10_eco_bt7_8runs, t10_eco_bt11_12runs, t10_eco_bt12_13runs, t10_eco_gt13_runs, t20_strike_lt50runs, t20_strike_gt50runs, t20_strike_gt60runs, odi_strike_lt40runs, odi_strike_gt40runs, odi_strike_gt50runs, t10_strike_lt80runs, t10_strike_bt80_90runs, t10_strike_gt90runs } = points[0]

        var pts = 0
        var ecorate_points
        var ecorate
        var century_halfcentury_point
        var century_halfcentury
        var duckout_points
        var duckOut
        var bonusPoints
        var bonus
        var strike
        var strike_points
        var total_pts

        return player_points = await performance.map(performance => {
            pts = starting_11 + (performance.test_run_scored * bat_run) + (performance.test_fours_hit * bat_four) + (performance.test_sixes_hit * bat_six)
            if (performance.test_run_scored >= 50 && performance.test_run_scored <= 99) {
                pts = pts + bat_half_century
                century_halfcentury_point = bat_half_century
                century_halfcentury = 1
            }
            if (performance.test_run_scored >= 100) {
                pts = pts + bat_century
                century_halfcentury_point = bat_century
                century_halfcentury_point = 1
            }
            if (performance.test_run_scored == 0 && performance.player_type !== 'bowl' && performance.test_out_status === 1) {
                pts = pts + bat_duck
                duckout_points = bat_duck
                duckOut = 1
            }
            if (performance.test_wickets_taken !== "") {
                pts = pts + (performance.test_wickets_taken * bowl_wicket)
            }
            if (performance.test_wickets_taken == 4) {
                pts = pts + (performance.test_wickets_taken * bowl_4wicket)
                bonusPoints = bowl_4wicket
                bonus = 1
            }
            if (performance.test_wickets_taken >= 5) {
                pts = pts + bowl_5wicket
                bonusPoints = bowl_5wicket
                bonus = 1
            }
            if (performance.test_maidens_bowled != '') {
                pts = pts + (performance.test_maidens_bowled * bowl_maiden)
            }
            pts = pts + (performance.test_catches * field_catch)
            pts = pts + ((performance.test_runout_thrower + performance.test_runout_catcher + performance.test_runout_direct_hit) * (field_runout_thrower + field_runout_catcher + field_runout_direct))
            pts = pts + (performance.test_stumping * field_runout_direct)
            if (performance.test_overs_bowled >= 5) {
                if (performance.test_economy < 2.5) {
                    pts = pts + odi_eco_lt2_5runs
                    ecorate = performance.test_economy
                    ecorate_points = odi_eco_lt2_5runs
                }
                if (performance.test_economy >= 2.5 && performance.test_economy <= 3.49) {
                    pts = pts + odi_eco_gt2_5runs
                    ecorate = performance.test_economy
                    ecorate_points = odi_eco_gt2_5runs
                }
                if (performance.test_economy > 3.5 && performance.test_economy <= 4.9) {
                    pts = pts + odi_eco_gt3_5runs
                    ecorate = performance.test_economy
                    ecorate_points = odi_eco_gt3_5runs
                }
                if (performance.test_economy >= 5 && performance.test_economy <= 8) {
                    pts = pts + odi_eco_gt5runs
                    ecorate = performance.test_economy
                    ecorate_points = odi_eco_gt5runs
                }
                if (performance.test_economy >= 8.1 && performance.test_economy <= 9) {
                    pts = pts + odi_eco_gt8runs
                    ecorate = performance.test_economy
                    ecorate_points = odi_eco_gt8runs
                }
                if (performance.test_economy > 9) {
                    pts = pts + odi_eco_gt9runs
                    ecorate = performance.test_economy
                    ecorate_points = odi_eco_gt9runs
                }
            }
            if (performance.test_overs_bowled >= 2) {
                if (performance.test_balls_faced > 20) {
                    if (performance.test_batting_strikerate <= 39.99) {
                        pts = pts + odi_strike_lt40runs
                        strike = performance.test_batting_strikerate
                        strike_points = odi_strike_lt40runs
                    }
                    if (performance.test_batting_strikerate >= 40 && performance.test_batting_strikerate <= 49.99) {
                        pts = pts + odi_strike_gt40runs
                        strike = performance.test_batting_strikerate
                        strike_points = odi_strike_gt40runs
                    }
                    if (performance.test_batting_strikerate >= 50 && performance.test_batting_strikerate <= 60) {
                        pts = pts + odi_strike_gt50runs
                        strike = performance.test_batting_strikerate
                        strike_points = odi_strike_gt50runs
                    }
                }
            }
            total_pts = starting_11 + (performance.test_run_scored * bat_run) + (performance.test_fours_hit * bat_four) + (performance.test_sixes_hit * bat_six) + strike_points + (century_halfcentury * century_halfcentury_point) + duckout_points + (performance.test_wickets_taken * bowl_wicket) + (performance.test_maidens_bowled * bowl_maiden) + ecorate_points + bonusPoints + (performance.test_catches * field_catch) + (performance.test_stumping * field_runout_direct) + ((performance.test_runout_thrower + performance.test_runout_catcher + performance.test_runout_direct_hit) * (field_runout_thrower + field_runout_catcher + field_runout_direct))
            var point = {}
            point[performance.player_id] = pts
            return point
        })
    }
    catch (error) {
        console.log(error.message)
    }
}

const switch_team = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { match_id, contest_id, old_team, new_team } = req.body
        const contest = await Join_contest.update({
            player_team_id: new_team
        }, {
            where: {
                player_team_id: old_team,
                user_id: token.id,
                contest_id,
                fixture_id: match_id
            }
        })

        res.status(200).json({
            status: true,
            message: 'teams switched successfully',
            data: {}
        })

    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: {}
        })
    }
}

const getPlayerStats = async (req, res) => {
    try {
        const { match_id, series_id } = await req.body
        console.log(match_id, series_id)
        const performance = await Performance.findAll({
            where: { 'm_id': match_id },
            attributes: {
                exclude: ["test_player_points", "test_is_playing", "test_total_score", "test_run_scored", "test_balls_faced", "test_fours_hit", "test_sixes_hit", "test_batting_strikerate", "test_batting_position", "test_is_current_batsman", "test_extra_runs_scored", "test_out_status", "test_out_comment", "test_overs_bowled", "test_maidens_bowled", "test_wides_bowled", "test_noballs_bowled", "test_runs_given", "test_wickets_taken", "test_bowled_made", "test_lbw_made", "test_economy", "test_is_current_bowler", "test_runout_thrower", "test_runout_catcher", "test_runout_direct_hit", "test_stumping", "test_catches", "createdAt","updatedAt"
                ]
            },
            include: [{
                model: Squads,
                include: [{
                    model: Series,
                    attributes:["match_type"]
                }]
            }]
        })
 
        const team_player = await Fixtures.findOne({
            where: {
                id: match_id
            }
        })
 
        const userteams = await CaptainViceCaptain.findAll({
            include: [{
                model: UserTeam
            }],
            where: { 'match_id': match_id }
        })
 
        const match_type = await performance[0]?.squad?.series?.match_type
        const mat = match_type?.toLowerCase() == 'odi' ? 2 : match_type?.toLowerCase() == 'lista' ? 2 : match_type?.toLowerCase() == 't20' ? 1 : match_type?.toLowerCase() == 't20i' ? 1 : match_type?.toLowerCase() == 'test' ? 3 : match_type?.toLowerCase() == 't10' ? 4 : ''
        // console.log(mat, 'mat', match_type)
        const points = await PointSystem.findAll({ where: { match_type: mat }, raw: true })
        const { bat_run, bat_four, bat_six, bat_half_century, bat_century, bat_duck, bowl_wicket, bowl_4wicket, bowl_5wicket, bowl_maiden, bowl_dotball, field_catch, field_runout_direct, field_runout_thrower, field_runout_catcher, captain, vice_captain, starting_11, t10_bonus30_runs, t10_bonus50_runs, t10_bowling2_wicket, t10_bowling3_wicket, t20_eco_lt4runs, t20_eco_gt4runs, t20_eco_gt5runs, t20_eco_gt9runs, t20_eco_gt10runs, t20_eco_gt11runs, odi_eco_lt2_5runs, odi_eco_gt2_5runs, odi_eco_gt3_5runs, odi_eco_gt5runs, odi_eco_gt8runs, odi_eco_gt9runs, t10_eco_lt6runs, t10_eco_gt6runs, t10_eco_bt7_8runs, t10_eco_bt11_12runs, t10_eco_bt12_13runs, t10_eco_gt13_runs, t20_strike_lt50runs, t20_strike_gt50runs, t20_strike_gt60runs, odi_strike_lt40runs, odi_strike_gt40runs, odi_strike_gt50runs, t10_strike_lt80runs, t10_strike_bt80_90runs, t10_strike_gt90runs } = points[0]
        console.log(points[0],)
        var result = []
        for (let e of performance) {
            let selected_count = 0
            for (let team of userteams) {
                if (team.userteams.map(k => k.player_id).includes(e.player_id)) {
                    selected_count++
                }
            }
 
            var ecorate_points = 0
            var strike_points = 0
 
            if ((match_type?.toLowerCase() == 't20' || match_type?.toLowerCase() == 't20i') || match_type?.toLowerCase() == 't10') {
                if (e.overs_bowled >= 2) {
                    if (e.economy < 4) {
                        ecorate_points = t20_eco_lt4runs
                    }
                    if (e.economy >= 4 && e.economy <= 4.99) {
                        ecorate_points = t20_eco_gt4runs
                    }
                    if (e.economy > 5 && e.economy <= 8.99) {
                        ecorate_points = t20_eco_gt5runs
                    }
                    if (e.economy >= 9 && e.economy <= 10) {
                        ecorate_points = t20_eco_gt9runs
                    }
                    if (e.economy >= 10.1 && e.economy <= 11) {
                        ecorate_points = t20_eco_gt10runs
                    }
                    if (e.economy > 11) {
                        ecorate_points = t20_eco_gt11runs
                    }
                }
            } else {
                if (e.overs_bowled >= 5) {
                    if (e.economy < 2.5) {
                        ecorate_points = odi_eco_lt2_5runs
                    }
                    if (e.economy >= 2.5 && e.economy <= 3.49) {
                        ecorate_points = odi_eco_gt2_5runs
                    }
                    if (e.economy > 3.5 && e.economy <= 4.9) {
                        ecorate_points = odi_eco_gt3_5runs
                    }
                    if (e.economy >= 5 && e.economy <= 8) {
                        ecorate_points = odi_eco_gt5runs
                    }
                    if (e.economy >= 8.1 && e.economy <= 9) {
                        ecorate_points = odi_eco_gt8runs
                    }
                    if (e.economy > 9) {
                        ecorate_points = odi_eco_gt9runs
                    }
                }
            }
 
            if ((match_type?.toLowerCase() == 't20' || match_type?.toLowerCase() == 't20i') || match_type?.toLowerCase() == 't10') {
                if (e.balls_faced > 20) {
                    if (e.batting_strikerate <= 49.99) {
                        strike_points = t20_strike_lt50runs
                    }
                    if (e.batting_strikerate >= 50 && e.batting_strikerate <= 59.99) {
                        strike_points = t20_strike_gt50runs
                    }
                    if (e.batting_strikerate >= 60 && e.batting_strikerate <= 70) {
                        strike_points = t20_strike_gt60runs
                    }
                }
            } else {
                if (e.balls_faced > 20) {
                    if (e.batting_strikerate <= 39.99) {
                        strike_points = odi_strike_lt40runs
                    }
                    if (e.batting_strikerate >= 40 && e.batting_strikerate <= 49.99) {
                        strike_points = odi_strike_gt40runs
                    }
                    if (e.batting_strikerate >= 50 && e.batting_strikerate <= 60) {
                        strike_points = odi_strike_gt50runs
                    }
                }
            }
 
            var data = {
                p_id: e.p_id,
                team_a: team_player.team_a_id === e.team_id,
                team_id: e.team_id,
                player_id: e.player_id,
                player_name: e.player_name,
                player_credit: e.player_credit,
                player_points: e.player_points,
                player_image: '',
                selection_percent: (selected_count / userteams.length) ? `${((selected_count / userteams.length) * 100).toFixed(1)} %` : `${0} %`,
                in_contest: true,
                in_dream_team: false,
                player_breakup: {
                    staring11: {
                        actual: e.is_playing ? 1 : 0,
                        points: e.is_playing * starting_11
                    },
                    runs: {
                        actual: e.run_scored ? e.run_scored : 0,
                        points: e.run_scored * bat_run
                    },
                    fours: {
                        actual: e.fours_hit ? e.fours_hit : 0,
                        points: e.fours_hit * bat_four
                    },
                    sixes: {
                        actual: e.sixes_hit ? e.sixes_hit : 0,
                        points: e.sixes_hit * bat_six
                    },
                    strke_rate: {
                        actual: e.batting_strikerate ? e.batting_strikerate : 0,
                        points: strike_points ? strike_points : 0
                    },
                    half_century: {
                        actual: e.run_scored >= 50 && e.run_scored <= 99,
                        points: (e.run_scored >= 50 && e.run_scored <= 99) ? bat_half_century : 0
                    },
                    century: {
                        actual: e.run_scored >= 100,
                        points: e.run_scored >= 100 ? bat_century : 0
                    },
                    duck: {
                        actual: (e.run_scored == 0 && e.out_status == 1),
                        points: (e.run_scored == 0 && e.player_type !== 'bowl' && e.out_status == 1) ? bat_duck : 0
                    },
                    wickets: {
                        actual: e.wickets_taken ? e.wickets_taken : 0,
                        points: e.wickets_taken * bowl_wicket
                    },
                    maiden_overs: {
                        actual: e.maidens_bowled ? e.maidens_bowled : 0,
                        points: e.maidens_bowled * bowl_maiden
                    },
                    economy: {
                        actual: e.economy ? e.economy : 0,
                        points: ecorate_points ? ecorate_points : 0
                    },
                    catches: {
                        actual: e.catches ? e.catches : 0,
                        points: e.catches * field_catch
                    },
                    run_out: {
                        actual: (e.runout_thrower + e.runout_catcher + e.runout_direct_hit + e.stumping) ? (e.runout_thrower + e.runout_catcher + e.runout_direct_hit + e.stumping) : 0,
                        points: (e.runout_thrower ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : e.runout_catcher ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : e.runout_direct_hit ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : e.stumping ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : 0)
                    },
                    bonus: {
                        actual: 0,
                        points: ((e.player_points) - ((e.is_playing * starting_11) + (e.run_scored * bat_run) + (e.fours_hit * bat_four) + (e.sixes_hit * bat_six) + (strike_points ? strike_points : 0) + ((e.run_scored >= 50 && e.run_scored <= 99) ? bat_half_century : 0) + (e.run_scored >= 100 ? bat_century : 0) + ((e.run_scored == 0 && e.player_type !== 'bowl' && e.out_status == 1) ? bat_duck : 0) + (e.wickets_taken * bowl_wicket) + (e.maidens_bowled * bowl_maiden) + (ecorate_points ? ecorate_points : 0) + (e.catches * field_catch) + ((e.runout_thrower ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : e.runout_catcher ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : e.runout_direct_hit ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : e.stumping ? ((e.runout_thrower * field_runout_thrower) + (e.runout_catcher * field_runout_catcher) + (e.runout_direct_hit * field_runout_direct) + (e.stumping * field_runout_direct)) : 0))))
                    },
                    total_point: {
                        actual: 0,
                        points: e.player_points
                    }
                }
 
            }
            result.push(data)
        }
 
        await res.status(200).json({ status: true, message: 'Data Found', data: result })
    }
    catch (error) {
        console.log(error)
        res.status(404).json({ status: false, message: error.message })
    }
}

const series_player_details = async (req, res) => {
    try {
        const token = await fetch_user(req.headers.authorization.split(" ")[1])
        const { series_id, match_id, player_id } = req.body
        const fixtures = await Fixtures.findAll({
            include: [{
                model: Performance,
                where: { 'p_id': player_id },
                include: [{
                    model: Squads
                }]
            }],
            where: { 'series_id': series_id, 'status': 'completed' }
        })

        const team_player = await Fixtures.findAll({
            where: {
                id: match_id
            }
        })

        const player_data = await Squads.findAll({
            where: { 'p_id': player_id }
        })

        const userteams = []
        for (let e of fixtures) {
            const data = await CaptainViceCaptain.findAll({
                include: [{
                    model: UserTeam
                }],
                where: { 'match_id': e.id }
            })
            userteams.push(data)
        }
        const modified_userteams = userteams.filter(e => e.length)
        const datas = await userteams.reduce((prev, next) => {
            prev[next[0]?.match_id] = prev[next[0]?.match_id] || [];
            prev[next[0]?.match_id].push(next);
            return prev;
        }, Object.create(null))

        let selected_count = {}
        for (let e of fixtures) {
            let count = 0
            datas[e.id]?.map(team => team.map(m => {
                if (m.userteams.map(e => e.player_id).includes(player_data[0]?.player_id)) {
                    count++
                }
            }))

            selected_count[e.id] = count
        }

        const player_result = []
        for (let e of player_data) {
            let data = {
                player_name: e.player_name,
                team_a: e.team_id === team_player[0].team_a_id,
                player_image: "",
                player_credit: e.player_credit,
                bats_type: e.batting_style,
                bowls_type: e.bowling_style,
                nationality: e.nationality,
                player_total_points: fixtures.reduce((sum, player) => Number(sum) + Number(player.performances[0].player_points), 0),
                match_detail: []
            }
            player_result.push(data)
        }

        const result = []
        for (let e of fixtures) {
            let data = {
                player_name: e.performances[0].player_name,
                team_a: e.performances[0].squad.team_id === team_player[0].team_a_id,
                player_image: "",
                player_credit: e.performances[0].squad.player_credit,
                bats_type: e.performances[0].squad.batting_style,
                bowls_type: e.performances[0].squad.bowling_style,
                nationality: e.performances[0].squad.nationality,
                player_total_points: fixtures.reduce((sum, player) => sum + player.performances[0].player_points, 0),
                match_detail: fixtures.map(e => {
                    return {
                        match: `${e.team_a_short} vs ${e.team_b_short}`,
                        date: e.match_date,
                        player_points: e.performances[0].player_points ? e.performances[0].player_points : 0,
                        selected_by: (selected_count[e.id] / (datas[e.id] ? datas[e.id][0]?.length : 0)) ? `${((selected_count[e.id] / (datas[e.id] ? datas[e.id][0]?.length : 0)) * 100).toFixed(2)} %` : `${0} %`
                    }
                })
            }
            result.push(data)
        }

        await res.status(200).json({
            status: true,
            message: 'Data Found',
            data: result[0] ? result[0] : player_result[0]
        }) //result[0] ? result[0] : player_result[0]
    } catch (err) {
        console.log(err)
        await res.status(400).json({ status: false, message: err.message })
    }
}

module.exports = {
    creatUserTeam,
    getUserTeam,
    getUserTeambyId,
    getuserPlayerPoints,
    getuserPlayerPointsTest,
    switch_team,
    getPlayerStats,
    series_player_details
}

