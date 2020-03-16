import Picgo from 'picgo'

const app = new Picgo()


import plug from './index'
plug(app)
app.upload(["https://raw.githubusercontent.com/ssloy/tinyrenderer/gh-pages/img/02-triangle/cfa0f3a9d9.png"])
