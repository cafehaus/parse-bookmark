const PB = require('./src/index')
const path = require('node:path')

const ParseBookmark = new PB(path.resolve('./bookmark.html'))
ParseBookmark.createMarkdown()