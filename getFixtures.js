const Xray = require('x-ray');
const Constants = require('./constants')

const getUpdatedScores = async () => {
    const x = Xray();
    let finalResponse = [];
    return new Promise((resolve, reject) => {
        x(Constants.temp, '.match-list__wrapper .match-block', [{
            team: x(['.match-block__team-name']),
            date: x('.match-block__date', 'time')
        }])((err, content) => {
            if (err) {
                return reject(err);
            }
            finalResponse = content
                .map(({ team, time, date }, index) => {
                    return ({
                        team1: team[0],
                        team2: team[1],
                        date
                    })
                })
            resolve(finalResponse)
        })
    })
}

getUpdatedScores().then(ele=>console.log(JSON.stringify(ele)))
module.exports = getUpdatedScores