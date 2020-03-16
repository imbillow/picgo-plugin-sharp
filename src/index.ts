/*
 *   Copyright (c) 2020 iovw
 *   All rights reserved.
 */

import { readFile } from "fs-extra"
import probe from "probe-image-size"
import sharp from "sharp"
import { basename, extname } from "path"
import request from "request"
import PicGo from "picgo"

async function fetch(ctx: PicGo, url: string) {
  return await ctx.Request
    .request({ method: 'Get', url, encoding: null })
    .on('response', (response: request.Response): void => {
      const contentType = response.headers['content-type']
      if (!contentType.includes('image')) {
        ctx.log.error("headers:\n" + JSON.stringify(response.headers, null, 2))
        throw new Error(`${url} isn't a image, resp header ${response.headers}`)
      }
    })
}

const urlFileName = (url: string) {
  const _ = url.split('?')[0]
  return basename(_, extname(_))
}

async function handle(ctx: PicGo) {
  await Promise.all(
    ctx.input.map(async item => {
      try {
        let buffer: Buffer = /https?:\/\//.test(item) ?
          await fetch(ctx, item) :
          await readFile(item)
        let name: string = urlFileName(item)

        try {
          buffer = await sharp(buffer)
            .webp({ lossless: true })
            .toBuffer()
          ctx.log.success(`${item} convert successful`)
        } catch (e) {
          ctx.log.error(`can't convert file ${item}`)
          throw new Error(e)
        }
        const { width, height } = probe.sync(buffer)
        ctx.output.push({
          buffer: buffer,
          fileName: name + '.webp',
          width: width,
          height: height,
          extname: "webp"
        })
      } catch (e) {
        ctx.log.error(e)
      }
    })
  )

  return ctx
}

export = function (ctx) {
  return {
    register: () => {
      ctx.helper.transformer.register("sharp", {
        handle
      })
    },
    transformer: "sharp"
  }
}