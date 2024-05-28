const express = require('express');
let router = express.Router();
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const upload = multer({ dest: 'temp/' });

router.post('/', upload.single('uploaded_file'), async function (req, res, next) {
  if (!req.file) return res.status(400).send('No file uploaded.');

  if (req.file.size > 8000000) return res.status(400).send('File too large. Max 8MB.');

  const uploadid = crypto.randomUUID();

  await new Promise((resolve, reject) => {
    const mainCompression = ffmpeg(req.file.path)
      .outputOptions([
        '-preset veryfast',
        `-minrate 1`,
        `-maxrate 1`,
        `-bufsize 1`,
      ])
      .videoBitrate('1')
      .audioFilter(`bass=g=5`)
      .audioFilter(`volume=5dB`)
      .audioBitrate('1')
      .fps('5')
      .size('100x100')
      .format('webm')
      .save(`./temp/${uploadid}.webm`);

    mainCompression.on('error', (err) => {
      reject(err);
    });

    mainCompression.on('end', () => {
      resolve();
    });
  });

  const finishCompress = ffmpeg(`./temp/${uploadid}.webm`)
    .size('1080x720')
    .videoBitrate(1)
    .fps(30)
    .save(`./temp/${uploadid}-finished.mp4`);

  finishCompress.on('end', () => {
    res.download(path.resolve(`./temp/${uploadid}-finished.mp4`), `${req.file.originalname.split('.')[0]} DESTROYED.mp4`, (err) => {
      if (err) {
        console.error("Error in download:" + err);
      }
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(`./temp/${uploadid}.webm`);
      fs.unlinkSync(`./temp/${uploadid}-finished.mp4`);
    });
  });
  finishCompress.on('error', (err) => {
    console.error("Error in finishCompress:" + err);
  });
})

module.exports = router;
