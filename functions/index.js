const { onObjectFinalized } = require("firebase-functions/v2/storage");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { tmpdir } = require("os");
const { join, basename } = require("path");
const fs = require("fs");

admin.initializeApp();

exports.processVideo = onObjectFinalized(
  { region: "asia-northeast1" },
  async (event) => {
    const object = event;
    const filePath = object.name;
    const contentType = object.contentType;
    if (!contentType.startsWith("video/")) return;

    const bucket = admin.storage().bucket(object.bucket);
    const fileName = basename(filePath);
    const tempFilePath = join(tmpdir(), fileName);
    const tempThumbPath = join(tmpdir(), `thumb_${fileName}.jpg`);
    const tempCompressedPath = join(tmpdir(), `compressed_${fileName}`);

    await bucket.file(filePath).download({ destination: tempFilePath });

    ffmpeg.setFfmpegPath(ffmpegPath);

    // サムネイル生成
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .on("end", resolve)
        .on("error", reject)
        .screenshots({
          count: 1,
          folder: tmpdir(),
          filename: `thumb_${fileName}.jpg`,
          timemarks: ["1"],
        });
    });

    // 動画圧縮
    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
        .setFfmpegPath(ffmpegPath)
        .outputOptions([
          "-vcodec libx264",
          "-crf 28",
          "-preset veryfast",
          "-acodec aac",
          "-b:a 128k",
        ])
        .save(tempCompressedPath)
        .on("end", resolve)
        .on("error", reject);
    });

    await bucket.upload(tempThumbPath, {
      destination: `thumbnails/${basename(tempThumbPath)}`,
    });

    await bucket.upload(tempCompressedPath, {
      destination: `compressed/${basename(tempCompressedPath)}`,
    });

    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempThumbPath);
    fs.unlinkSync(tempCompressedPath);
  }
);
