import ImageKit from "imagekit";
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY ,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY ,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

function uploadImage(file) {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file.buffer,
      fileName: new mongoose.Types.ObjectId().toString(),
        folder: "hello"
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

export { uploadImage };

