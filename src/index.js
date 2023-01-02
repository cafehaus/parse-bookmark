const htmlparser2 = require("htmlparser2")
const Parser = htmlparser2.Parser
const util = require('./util')
const fs = require('node:fs')

class ParseBookmark {
    constructor(filePath) {
        this.filePath = filePath || 'bookmark.html'
    }

    readFile() {
        return new Promise((resolve, reject) => {
            if (!this.filePath || !util.isFileExist(this.filePath)) {
                reject('bookmark 书签文件不存在')
                throw new Error('bookmark 书签文件不存在')
            } else {
                const bookmarkFile = fs.readFileSync(this.filePath)
                resolve(bookmarkFile.toString())
            }
        })
    }

    async getJson() {
        if (!this.filePath || !util.isFileExist(this.filePath)) {
            throw new Error('bookmark 书签文件不存在')
        }
        
        const bookmarkFile = fs.readFileSync(this.filePath)
        const html = bookmarkFile.toString()
        const json = []
        let levelNodes = []
        const parser = new Parser({
            onopentag: (name, { ...attrs } = {}) => {
                let node = {}
                node = {
                    type: 'TAG',
                    tagName: name,
                    nodeName: name,
                    attrs: { ...attrs },
                    attributes: { ...attrs },
                    children: []
    
                }
                if (levelNodes[0]) {
                    const parent = levelNodes[0]
                    parent.children.push(node)
                    levelNodes.unshift(node)
                } else {
                    json.push(node)
                    levelNodes.push(node)
                }
            },
            ontext(text) {
                const parent = levelNodes[0]
                if (parent === false) {
                    return
                }
                const node = {
                    type: 'TEXT',
                    content: text,
                    textContent: text
                }
                if (!parent) {
                    json.push(node)
                } else {
                    if (!parent.children) {
                        parent.children = []
                    }
                    const t = text.trim()
                    t && parent.children.push(node)
                }
            },
            onclosetag() {
                levelNodes.shift()
            },
            onend() {
                levelNodes = null
            }
        })
        parser.end(html)
        return json.filter(m => m.tagName === 'dl')
    }

    /**
     * 生成markdown
     */
    async createMarkdown() {
        const json = await this.getJson()
        const dl = json[0]
        const markdown = this.jsonToMarkdown(dl)
        this.writeMarkdown(markdown)
    }

    /**
     * json数据生成 markdown 文件
     * @param {object} json
     * @param {string} txt 初始化文本
     * @return string
     */
    jsonToMarkdown(json, txt = '') {
        // 递归遍历
        if (json.children && json.children.length) {
            json.children.map(m => {
                txt = this.jsonToMarkdown(m, txt)
            })
        }

        // 实际有用的数据只有 h3 标题和 a 标签超链接
        if (json.nodeName === 'h3') {
            txt += `### ${json.children[0].textContent}\n`
        }
        if (json.nodeName === 'a') {
            txt += `* [${json.children[0].textContent}](${json.attributes.href})\n`
        }

        return txt
    }

    /**
     * 写入 markdown 文件
     * @param {string} txt 写入的文本
     * @param {string} fileName 文件名
     */
    writeMarkdown(txt = '', fileName = 'index.md') {
        if (!txt) return
        fs.writeFileSync(fileName, txt)
    }
}

module.exports = ParseBookmark