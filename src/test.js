const Jimp = require('jimp')

const ORIGINAL_IMAGE = "http://www.defence.gov.au/ADFA/Images/news_events/whiteRibbon.jpg";

const LOGO = "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Australian_Defence_Force_Academy_coat_of_arms.svg/1200px-Australian_Defence_Force_Academy_coat_of_arms.svg.png";

const FILENAME = "test.jpg";

const main = async () => {
    const [image, logo] = await Promise.all([
        Jimp.read(ORIGINAL_IMAGE),
        Jimp.read(LOGO)
    ]);

    logo.resize(image.bitmap.width / 10, Jimp.AUTO);

    const locations = {
        "topLeft": { x: 5, y: 5 },
        "topRight": { x: (image.bitmap.width - 5) - logo.bitmap.width, y: 5 },
        "center": { x: (image.bitmap.width / 2) - (logo.bitmap.width / 2), y: (image.bitmap.height / 2) - (logo.bitmap.height / 2) },
        "bottomLeft": { x: 5 , y: image.bitmap.width - 5 },
        "bottomRight": { x: (image.bitmap.width - 5) - logo.bitmap.width  , y: (image.bitmap.height - 5) - logo.bitmap.height  }
    }

    console.log(locations["bottomRight"])


    return image.composite(logo, locations["bottomRight"].x, locations["bottomRight"].y, [
        {
            mode: Jimp.BLEND_SCREEN,
            opacitySource: 0.1,
            opacityDest: 1
        }
    ]);
};

main().then(image => image.write(FILENAME));