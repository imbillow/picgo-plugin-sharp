/*
 *   Copyright (c) 2020 iovw
 *   All rights reserved.
 */

const sharp = require("sharp");

const getFSFile = async item => {
  try {
    return {
      extname: path.extname(item),
      fileName: path.basename(item),
      buffer: await fs.readFile(item),
      success: true
    };
  } catch {
    return {
      reason: `read file ${item} error`,
      success: false
    };
  }
};

const handle = async ctx => {
  await Promise.all(
    ctx.input.map(async item => {
      const info = /https?:\/\//.test(item)
        ? await getURLFile(ctx, item)
        : await getFSFile(item);

      webp_buffer = await sharp(ctx.input)
        .webp({ lossless: true })
        .toBuffer();
      console.log(`convert ${info.fileName} to webp.\n`)
      if (info.success) {
        try {
          const imgSize = probe.sync(info.buffer);
          ctx.output.push({
            buffer: webp_buffer,
            fileName: info.fileName,
            width: imgSize.width,
            height: imgSize.height,
            extname: "webp"
          });
        } catch (e) {
          ctx.log.error(e);
        }
      } else {
        ctx.log.error(info.reason);
      }
    })
  );

  return ctx;
};

module.exports = ctx => {
  const register = () => {
    ctx.helper.transformer.register("webp", {
      handle
    });
  };
  return {
    register,
    transformer: "webp"
  };
};
