// Prépare le fond vidéo du bunker à partir d'une vidéo source (docs/05-direction-artistique.md).
//
//   npm run video -- chemin/vers/source.mp4 [--poster-only]
//
// Sans FFmpeg : Chromium (celui de Playwright) lit la source et la réenregistre avec
// MediaRecorder, en ne gardant que l'image. Sorties dans public/media/bunker/ :
//   sidorovich.webm (VP9), sidorovich.mp4 (H.264), sidorovich-poster.webp (première image,
//   960 px de large : c'est l'élément le plus grand de l'accueil, il doit arriver vite).
// L'enregistrement se fait en temps réel : compter la durée de la vidéo pour chaque format.
import { chromium } from "@playwright/test";
import { createReadStream, mkdirSync, statSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";

const source = process.argv[2];
const posterOnly = process.argv.includes("--poster-only");
if (!source) {
  console.error("Usage : npm run video -- chemin/vers/source.mp4");
  process.exit(1);
}

const OUT = "public/media/bunker";
// Débits visés pour une boucle de 10 s : environ 1,4 Mo en WebM, 2 Mo en MP4.
const FORMATS = [
  { file: "sidorovich.webm", mimeType: "video/webm;codecs=vp9", bitrate: 1_100_000 },
  { file: "sidorovich.mp4", mimeType: "video/mp4;codecs=avc1", bitrate: 1_600_000 },
];

mkdirSync(OUT, { recursive: true });

// Petit serveur local : une vidéo ouverte en file:// est d'une autre origine, et Chromium
// refuse alors de la capturer. Les requêtes partielles (Range) permettent de se déplacer.
const size = statSync(source).size;
const server = createServer((request, response) => {
  if (request.url !== "/source.mp4") {
    response.writeHead(200, { "Content-Type": "text/html" });
    response.end('<video src="/source.mp4" muted preload="auto"></video>');
    return;
  }
  const range = /bytes=(\d*)-(\d*)/.exec(request.headers.range ?? "");
  const start = range?.[1] ? Number(range[1]) : 0;
  const end = range?.[2] ? Number(range[2]) : size - 1;
  response.writeHead(range ? 206 : 200, {
    "Content-Type": "video/mp4",
    "Accept-Ranges": "bytes",
    "Content-Length": end - start + 1,
    ...(range && { "Content-Range": `bytes ${start}-${end}/${size}` }),
  });
  createReadStream(source, { start, end }).pipe(response);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage();
page.setDefaultTimeout(120_000);
await page.goto(`http://127.0.0.1:${port}/`);
await page.evaluate(
  () =>
    new Promise((resolve) => {
      const video = document.querySelector("video");
      if (video.readyState >= 2) resolve();
      else video.addEventListener("loadeddata", resolve, { once: true });
    }),
);

/** Réenregistre la vidéo, image seule, et renvoie le fichier en base 64. */
const record = ({ mimeType, bitrate }) =>
  page.evaluate(
    async ({ mimeType, bitrate }) => {
      const video = document.querySelector("video");
      video.muted = true;
      video.loop = false;
      video.pause();
      video.currentTime = 0;
      await new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));

      // Seule la piste image est gardée : le fichier final n'a pas de son.
      const stream = new MediaStream(video.captureStream().getVideoTracks());
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
      const chunks = [];
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
      const stopped = new Promise((resolve) => (recorder.onstop = resolve));

      recorder.start(250);
      await video.play();
      await new Promise((resolve) => video.addEventListener("ended", resolve, { once: true }));
      recorder.stop();
      await stopped;

      const bytes = new Uint8Array(await new Blob(chunks, { type: mimeType }).arrayBuffer());
      let binary = "";
      for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      }
      return btoa(binary);
    },
    { mimeType, bitrate },
  );

for (const format of posterOnly ? [] : FORMATS) {
  const data = await record(format);
  writeFileSync(`${OUT}/${format.file}`, Buffer.from(data, "base64"));
  console.log(`${format.file} : ${(statSync(`${OUT}/${format.file}`).size / 1024).toFixed(0)} Ko`);
}

// Image fixe : la première image, réduite à 960 px, en WebP.
const poster = await page.evaluate(async () => {
  const video = document.querySelector("video");
  video.pause();
  video.currentTime = 0;
  await new Promise((resolve) => video.addEventListener("seeked", resolve, { once: true }));
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = Math.round((960 * video.videoHeight) / video.videoWidth);
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", 0.7).split(",")[1];
});
writeFileSync(`${OUT}/sidorovich-poster.webp`, Buffer.from(poster, "base64"));
console.log(
  `sidorovich-poster.webp : ${(statSync(`${OUT}/sidorovich-poster.webp`).size / 1024).toFixed(0)} Ko`,
);

await browser.close();
server.close();
