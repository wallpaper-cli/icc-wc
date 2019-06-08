const Jimp = require('jimp');
const { exec } = require('child_process');
const wallpaper = require('wallpaper');
const getScores = require('./scores')
const mocks = require('./mocks')

const removeExistingFile = process.platform === 'win32'
    ? 'del *.jpg'
    : 'rm -rf [0-9]*.jpg';
const xList = [1870, 1800, 2050, 2490, 2630, 2760, 2870, 3110]
const file = `${new Date().getTime()}.jpg`;

const writeRowForEachTeam = async (image, font, x, y, teamInfo) => {
    try {
        const logo = await Jimp.read(`./Assets/Logos/${teamInfo.name.toLowerCase()}.jpg`)
        image.composite(logo.resize(Jimp.AUTO, 80), x[0], y - 24)
        Object.keys(teamInfo).map((eachColum, index) => {
            return image.print(font, x[index + 1], y, teamInfo[eachColum])
        })
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