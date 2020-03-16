/*
 *   Copyright (c) 2020 iovw
 *   All rights reserved.
 */

// const { readFile } = require("fs");
// const probe = require("probe-image-size");
// const sharp = require("sharp");
// const { basename } = require("path");
// const fetch = require("node-fetch");

// async function handle(ctx) {
//   await Promise.all(
//     ctx.input.map(async item => {
//       try {
//         let buffer = /https?:\/\//.test(item)
//           ? await fetch(item).buffer
//           : await readFile(item);
//         buffer = await sharp(buffer)
//           .webp({ lossless: true })
//           .toBuffer();
//         const { width, height } = probe.sync(buffer);
//         ctx.output.push({
//           buffer: webp_buffer,
//           fileName: basename(item),
//           width: width,
//           height: height,
//           extname: "webp"
//         });
//       } catch (e) {
//         ctx.log.error(e);
//       }
//     })
//   );

//   return ctx;
// }

export default function (ctx) {
  const register = () => {
    ctx.helper.transformer.register("webp", {
      // handle
    });
  };
  return {
    register,
    transformer: "webp"
  };
};
