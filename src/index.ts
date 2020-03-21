/*
 *   Copyright (c) 2020 iovw
 *   All rights reserved.
 */

import { readFile } from "fs-extra"
import { imageSize } from "image-size"
import sharp from "sharp"
import { basename, extname } from "path"
import { Response } from "request"
import PicGo from "picgo"
import { PluginConfig } from "picgo/dist/src/utils/interfaces"

async function fetch(ctx: PicGo, url: string): Promise<Buffer> {
  return await ctx.Request
    .request({ method: 'Get', url, encoding: null })
    .on('response', (response: Response): void => {
      const contentType = response.headers['content-type']
      if (!contentType.includes('image')) {
        ctx.log.error("headers:\n" + JSON.stringify(response.headers, null, 2))
        throw new Error(`${url} isn't a image, resp header ${response.headers}`)
      }
    })
}

function realBaseName(url: string): string {
  const _ = url.split('?')[0]
  return basename(_, extname(_))
}

async function handle(ctx: PicGo): Promise<PicGo> {
  const cfg = ctx.getConfig('transformer.sharp')
  const outputType: string = cfg?.outputType ?? 'webp'
  const outputOptions = cfg?.options?.[outputType]
  const transformFn = (new Map([
    ['jpeg', async (buffer: Buffer): Promise<Buffer> =>
      await sharp(buffer)
        .jpeg(outputOptions)
        .toBuffer()],
    ['png', async (buffer: Buffer): Promise<Buffer> =>
      await sharp(buffer)
        .png(outputOptions)
        .toBuffer()],
    ['webp', async (buffer: Buffer): Promise<Buffer> =>
      await sharp(buffer)
        .webp(outputOptions)
        .toBuffer()],
  ])).get(outputType)

  await Promise.all(
    ctx.input.map(async item => {
      try {
        let buffer: Buffer = /https?:\/\//.test(item) ?
          await fetch(ctx, item) :
          await readFile(item)
        try {
          buffer = await transformFn(buffer)
          ctx.log.success(`${item} convert to ${outputType} successful`)
        } catch (e) {
          ctx.log.error(`can't convert file ${item}`)
          throw new Error(e)
        }

        const name: string = realBaseName(item)
        const extname: string = '.' + outputType
        const { width, height } = imageSize(buffer)
        ctx.output.push({
          buffer: buffer,
          fileName: name + extname,
          width: width,
          height: height,
          extname: extname
        })
      } catch (e) {
        ctx.log.error(e)
      }
    })
  )

  return ctx
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function configFn(_: PicGo): PluginConfig[] {
  return [
    {
      name: 'outputType',
      type: 'list',
      choice: ['jpeg', 'png', 'webp',],
      default: 'webp',
      required: true
    }
  ]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export = function(ctx: PicGo): any {
  return {
    register: (): void => {
      ctx.helper.transformer.register("sharp", {
        handle
      })
    },
    transformer: "sharp",
    config: configFn
  }
}
