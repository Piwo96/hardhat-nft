import { storeImages } from "../utils/uploadToPinata";

async function main() {
    const imagesLocation = "./images/random-nft";
    await storeImages(imagesLocation);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error);
        process.exit(1);
    });
