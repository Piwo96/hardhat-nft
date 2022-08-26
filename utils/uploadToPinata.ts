import pinataSDK from "@pinata/sdk";
import path from "path";
import fs from "fs";
import "dotenv/config";
import { MetadataTemplateInfo } from "./metadata";

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(pinataApiKey!, pinataApiSecret!);

export async function storeImages(imagesFilePath: string) {
    const fullImagesPath = path.resolve(imagesFilePath);
    const files = fs.readdirSync(fullImagesPath);
    let responses = [];
    console.log("Uploading to IPFS ...");
    for (var fileIndex in files) {
        console.log(`Working on ${fileIndex} ...`);
        const readableStreamForFile = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        );
        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile);
            responses.push(response);
        } catch (error: any) {
            console.log(error);
        }
    }
    return { responses, files };
}

export async function storeTokenUriMetadata(metadata: MetadataTemplateInfo) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata);
        return response;
    } catch (error) {
        console.log(error);
    }
    return null;
}
