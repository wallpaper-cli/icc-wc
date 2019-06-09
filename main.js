const Jimp = require('jimp');
const { exec } = require('child_process');
const wallpaper = require('wallpaper');
const getScores = require('./scores')
const mocks = require('./mocks')
const { fixtures, months } = require('./constants')

const removeExistingFile = process.platform === 'win32'
    ? 'del *.jpg'
    : 'rm -rf [0-9]*.jpg';
const xList = [1870, 1800, 2050, 2490, 2630, 2760, 2870, 3110]
const file = `${new Date().getTime()}.jpg`;

const nextMatch = async (image, font, matchList) => {
    const currentDate = new Date();
    const currentDateNumber = String(currentDate.getDate()).padStart(2, '0')
    const currentDateMonth = months[currentDate.getMonth()]
    const currentDateTime = currentDate.getHours()
    const todayMatches = matchList.filter(matchDetails => `${currentDateNumber} ${currentDateMonth}` === matchDetails.date)
    let match;
    if (todayMatches.length > 1)
        match = currentDateTime > 15 ? todayMatches[1] : todayMatches[0]
    else
        match = todayMatches[0]
    const team1Logo = await Jimp.read(`./Assets/Logos/${match.team1.toLowerCase()}.jpg`)
    const team2Logo = await Jimp.read(`./Assets/Logos/${match.team2.toLowerCase()}.jpg`)
    image.composite(team1Logo.resize(Jimp.AUTO, 160), 200, 1000)
    image.print(font, 200, 1180, match.team1.toUpperCase())
    image.composite(team2Logo.resize(Jimp.AUTO, 160), 200, 1500)
    image.print(font, 200, 1680, match.team2.toUpperCase())
}

const writeRowForEachTeam = async (image, font, x, y, teamInfo) => {
    try {
        const logo = await Jimp.read(`./Assets/Logos/${teamInfo.name.toLowerCase()}.jpg`)
        image.composite(logo.resize(Jimp.AUTO, 80), x[0], y - 24)
        Object.keys(teamInfo).map((eachColum, index) => {
            return image.print(font, x[index + 1], y, teamInfo[eachColum])
        })
        image.print(font, x[1], y + 62, Array(81).fill('_').join(''))
    } catch (error) {
        // console.error(error)
        Object.keys(teamInfo).map((eachColum, index) => {
            return image.print(font, x[index + 1], y, teamInfo[eachColum])
        })
    }
}

const createTableFromTemplate = async (teamDetails) => {
    const differenceBetweenRows = 160
    let image = await Jimp.read('./Assets/Template/template.png')
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    const waitForImageToWrite = teamDetails.map(async (eachTeam, index) => {
        return await writeRowForEachTeam(image, font, xList, 385 + differenceBetweenRows * index, eachTeam)
    })
    await Promise.all(waitForImageToWrite)
    await nextMatch(image, font, fixtures)
    console.log('writing final file- ', file);
    image.write(file, () => { })
}

(async () => {
    exec(removeExistingFile, (err) => {
        if (!err) {
            console.log('File deleted');
        } else {
            console.log('Error: ', err);
        }
    });
    let list;
    try {
        list = await getScores()
    } catch (err) {
        console.error(err)
        list = mocks.list
    }
    // console.log(list);
    await createTableFromTemplate(list)
    await wallpaper.set(`./${file}`);
    console.log('Set ', file, ' as new wallpaper');
})();