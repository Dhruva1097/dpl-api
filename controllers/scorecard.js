const { Scorecard, Fixtures, Full_scorecard } = require("../models")

const getScoreCard = async (req, res) => {
    try {
        const { match_id } = req.body
        // console.log(match_id)
        const score = await Scorecard.findAll({ where: { 'match_id': match_id }, raw: true })
        // console.log(score)
        const team_a_score = score[0]?.total_score
        const team_a_id = score[0]?.team_id
        const team_b_score = score[1]?.total_score
        const team_b_id = score[1]?.team_id
        const winning_comment = score[0]?.winning_comment

        // console.log(team_a_score)
        res.status(200).json({ status: true, message: 'Data Found', data: { team_a_score, team_a_id, team_b_score, team_b_id, winning_comment } })
    }
    catch (error) {
        console.log(error.message)
    }
}

const getFullScoreData = async (req, res) => {
    try {
        const { match_id } = await req.body
        console.log(match_id)
        const { score_card } = await Full_scorecard.findOne({
            where: { match_id: match_id },
        })
        // const score = await fetch(`http://13.56.135.148:8080/api/v1/scorecard/${match.m_id}`).then(response => response.json())
        // console.log(rawData.innings)
        const rawData = JSON.parse(score_card);
        const teamaID = rawData.teama.team_id
        const teambID = rawData.teamb.team_id
        const responseData = {
            fixtureAPIId: rawData.match_id,
            fixtureType: rawData.format_str,
            fixtureStatus: rawData.status_str,
            fixtureStatusNote: rawData.status_note,
            toss: rawData.toss
                ? {
                    text: rawData.toss.text,
                    wonTeamId: rawData.toss.winner,
                    result: rawData.toss.decision == 2 ? "Bowling" : "Batting",
                }
                : null,
            teams: {
                teamA: rawData.teama
                    ? {
                        name: rawData.teama.name,
                        shortName: rawData.teama.short_name,
                        teamAPIId: rawData.teama.team_id,
                        logo: rawData.teama.logo_url,
                        scores_full: rawData.teama.scores_full,
                        scores: rawData.teama.scores,
                        overs: rawData.teama.overs,
                    }
                    : null,
                teamB: rawData.teamb
                    ? {
                        name: rawData.teamb.name,
                        shortName: rawData.teamb.short_name,
                        teamAPIId: rawData.teamb.team_id,
                        logo: rawData.teamb.logo_url,
                        scores_full: rawData.teamb.scores_full,
                        scores: rawData.teamb.scores,
                        overs: rawData.teamb.overs,
                    }
                    : null,
            },
            innings: Array.isArray(rawData.innings) && rawData.innings.length > 0
                ? rawData.innings.map((inn) => ({
                    innings_number: inn.number,
                    extras: inn.extra_runs
                        ? {
                            byes: inn.extra_runs.byes,
                            legbyes: inn.extra_runs.legbyes,
                            wides: inn.extra_runs.wides,
                            noballs: inn.extra_runs.noballs,
                            penalty: inn.extra_runs.penalty,
                            total: inn.extra_runs.total,
                        }
                        : null,
                    equations: inn.equations
                        ? {
                            totalRuns: inn.equations.runs,
                            totalWickets: inn.equations.wickets,
                            overs: inn.equations.overs,
                            bowlers_used: inn.equations.bowlersers_used,
                            runrate: inn.equations.runrate,
                        }
                        : null,
                    fallofWickets: Array.isArray(inn.fows)
                        ? inn.fows.map((fow) => ({
                            name: fow.name,
                            score: fow.score_at_dismissal,
                            overs: fow.overs_at_dismissal,
                            wicketOrder: fow.number,
                        }))
                        : [],
                    bat: inn.batsmen
                        ? {
                            teamAPIId: inn.batsmen[0]?.team_id == teamaID ? teamaID : teambID,
                            team: Array.isArray(inn.batsmen)
                                ? inn.batsmen.map((player) => ({
                                    playerName: player.name,
                                    runsScored: player.runs,
                                    ballsFaced: player.balls_faced,
                                    foursHit: player.fours,
                                    sixesHit: player.sixes,
                                    strikeRate: player.strike_rate,
                                    outType: player.how_out
                                        ? {
                                            outComment: player.how_out,
                                        }
                                        : null,
                                }))
                                : [],
                        }
                        : null,
                    bowl: inn.bowlers
                        ? {
                            teamAPIId: inn.bowlers[0]?.team_id == teamaID ? teamaID : teambID,
                            team: Array.isArray(inn.bowlers)
                                ? inn.bowlers.map((bowler) => ({
                                    playerName: bowler.name,
                                    oversBowled: bowler.overs,
                                    runsGiven: bowler.runs_conceded,
                                    maidensBowled: bowler.maidens,
                                    noBallsBowled: bowler.noballs,
                                    widesBowled: bowler.wides,
                                    wicketsTaken: bowler.wickets,
                                    lbwMade: bowler.lbwcount,
                                    economy: bowler.econ,
                                }))
                                : [],
                        }
                        : null,
                }))
                : [],
        };

        res.status(200).json({ status: true, message: 'Data Found', data: responseData })
    }
    catch (error) {
        console.log(error.message)
        res.status(404).json({ status: false, message: error.message, data: {} })
    }
}
module.exports = {
    getScoreCard,
    getFullScoreData
}