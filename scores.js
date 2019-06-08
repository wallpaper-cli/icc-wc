const Xray = require('x-ray');
const Constants = require('./constants')

const getUpdatedScores = async () => {
    const x = Xray();
    let finalResponse = [];
    return new Promise((resolve, reject) => {
        x(Constants.webLink, '.table tr', [{
            team: x('tr', ['td'])
        }])((err, content) => {
            if (err) {
                return reject(err);
            }
            finalResponse = content
                .filter((obj, index) => index !== 0)
                .map(({ team }, index) => {
                    return ({
                        sno: index + 1,
                        name: team[1].trim().split('\n').map(ele => ele.trim()).filter(ele => ele !== '')[0],
                        played: team[2],
                        won: team[3],
                        lost: team[4],
                        runrate: team[7],
                        points: team[8]
                    })
                })
            resolve(finalResponse)
        })
    })
}
module.exports = getUpdatedScores