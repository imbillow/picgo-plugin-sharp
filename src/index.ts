/*
 *   Copyright (c) 2020 iovw
 *   All rights reserved.
 */

import { readFile } from "fs-extra";
import probe from "probe-image-size";
import sharp from "sharp";
import { basename, extname } from "path";
import fetch from "node-fetch";

import PicGo from 'picgo'

async function handle(ctx) {
  await Promise.all(
    ctx.input.map(async item => {
      try {
        let buffer = /https?:\/\//.test(item)
          ? await (await fetch(item)).buffer()
          : await readFile(item);

        buffer = await sharp(buffer)
          .webp({ lossless: true })
          .toBuffer();
        const { width, height } = probe.sync(buffer);
        const name = basename(item, extname(item))
        ctx.output.push({
          buffer: buffer,
          fileName: name + '.webp',
          width: width,
          height: height,
          extname: "webp"
        });
      } catch (e) {
        ctx.log.error(e);
      }
    })
  );

  return ctx;
}

export = function (ctx) {
  return {
    register: () => {
      ctx.helper.transformer.register("webp", {
        handle
      });
    },
    transformer: "webp"
  };
};