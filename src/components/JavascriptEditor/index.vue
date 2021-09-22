<template>
  <div class="text-editor">
    <textarea ref="textarea" />
    <e-vue-contextmenu ref="menu" :style="{'z-index': 9998}" class="custom-context-menu">
      <slot>
        <li><a href="javascript:;" @click.prevent="loadResponseTips">刷新接口智能提示</a></li>
        <li v-for="item in apiNameList" :key="item"><a href="javascript:;" @click.prevent="showApiDetails(item)">{{ item }}</a></li>
      </slot>
    </e-vue-contextmenu>
    <api-view ref="apiView" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import { codeTips, parseHttpRequestVar } from '@/utils/code-tips'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'
import 'codemirror/addon/comment/comment.js'
import 'codemirror/addon/edit/matchbrackets.js'
import 'codemirror/addon/edit/closebrackets.js'
import 'codemirror/addon/search/match-highlighter.js'
import * as scriptApi from '@/api/api-script'
import ApiView from '@/components/ApiView'

export default {
  name: 'JavascriptEditor',
  components: { ApiView },
  // eslint-disable-next-line vue/require-prop-types
  props: ['value'],
  data() {
    return {
      editor: null,
      projectId: null,
      codeTipsData: {
        apiNames: [],
        varCodes: {},
        globalMap: {},
        apiNameMap: null,
        tempVar: {}
      },
      apiNameList: []
    }
  },
  watch: {
    value(value) {
      const editorValue = this.editor.getValue()
      if (value !== editorValue) {
        this.editor.setValue(value || '')
      }
    }
  },
  mounted() {
    this.editor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'text/javascript',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      lint: true,
      tabSize: 4,
      indentUnit: 4,
      cursorHeight: 0.85,
      lineWrapping: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      extraKeys: {
        'Tab': 'autocomplete',
        'Ctrl-/': this.toggleComment
      },
      hintOptions: {
        completeSingle: false,
        hint: this.handleShowHint
      },
      highlightSelectionMatches: {
        minChars: 2,
        trim: true,
        showToken: false,
        style: 'matchhighlight'
      }
    })

    this.editor.setValue(this.value ? this.value : '')

    this.editor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })

    this.editor.on('keyup', (cm, event) => {
      if (event.ctrlKey) return
      const code = event.keyCode
      // 字母
      if ((code >= 65 && code <= 90) ||
        // .
        code === 110 || code === 190 ||
        // {
        code === 219 ||
        // )
        (code === 48 && event.shiftKey) ||
        // /
        code === 191 ||
        // <--
        // code === 8 ||
        // " or '
        (code === 222 && this.codeTipsData.apiNameMap)) {
        this.editor.showHint()
        const hints_ul = document.querySelector('ul.CodeMirror-hints')
        if (hints_ul) {
          hints_ul.style.zIndex = '9999'
        }
      }
    })
    this.editor.on('contextmenu', (cm, event) => {
      this.$refs.menu.showMenu(event)
      event.preventDefault ? event.preventDefault() : (event.returnValue = false)
    })
    this.init()
  },
  methods: {
    init() {
      // this.codeTipsData.apiNames = ['/user/list', '/order/getById']
      // this.codeTipsData.globalMap = { 'baseUrl': null, 'username': null, 'password': null }
      // this.codeTipsData.apiNameMap = { '/listRanking': { name: null, id: null, pageSize: null }}
      // this.codeTipsData.varCodes = { http: { 'request(apiName)': null, 'post(url, body, headers)': null } }
      // this.codeTipsData.tempVar = { data: [{ name: 'xxx', userList: [{ id: null }, { name: null }] }] }
      this.reloadTips(this.projectId, true)
    },
    getValue() {
      return this.editor.getValue()
    },
    setValue(value) {
      this.editor.setValue(value)
    },
    getEditor() {
      return this.editor
    },
    reloadTips(projectId, loadCodeTips) {
      if (projectId) {
        this.projectId = projectId
      }
      if (loadCodeTips) {
        scriptApi.codeTips().then(response => {
          this.codeTipsData.varCodes = response.data || {}
        })
      }
      scriptApi.apiNameTips({ projectId: this.projectId }).then(response => {
        this.codeTipsData.apiNames = response.data.apiNames
        this.codeTipsData.globalMap = response.data.globalMap
      })
    },
    loadResponseTips() {
      this.apiNameList = []
      const data = parseHttpRequestVar(this.editor.getValue())
      if (data && Object.keys(data).length > 0 && this.projectId) {
        scriptApi.apiResponseTips(this.projectId, data).then(response => {
          const data = response.data || {}
          this.codeTipsData.tempVar = data.tempVar || {}
          this.codeTipsData.apiNameMap = data.apiNameMap
          this.$message.success('刷新成功')
        })
        for (const k in data) {
          if (data[k]) {
            this.apiNameList.push(data[k])
          }
        }
      } else if (!this.projectId) {
        this.$message('请先选择项目')
      } else {
        this.$message('未找到响应变量无需刷新')
      }
      this.$refs.menu.hideMenu()
    },
    toggleComment() {
      // 注释
      this.editor.toggleComment && this.editor.toggleComment({
        lineComment: '//'
      })
    },
    showApiDetails(apiName) {
      this.$refs.apiView.show(apiName, this.projectId)
      this.$refs.menu.hideMenu()
    },
    handleShowHint() {
      const cursor = this.editor.getCursor()
      const lineIndex = cursor.line
      const currentLine = this.editor.getLine(lineIndex)
      const lastIndex = cursor.ch
      let list = []
      try {
        list = codeTips(this.codeTipsData, currentLine, lastIndex, cursor, this.getValue())
        if (list && list.length > 0) {
          for (const i in list) {
            if (list[i].replace) {
              list[i].from = Object.assign({}, cursor, { ch: list[i].startIndex })
              list[i].to = Object.assign({}, cursor, { ch: lastIndex })
            }
          }
        }
      } catch (e) {
        console.log(e)
      }
      if (list && list.length > 0) {
        return {
          from: cursor,
          to: cursor,
          list: list
        }
      } else {
        return {
          from: cursor,
          to: cursor,
          list: []
        }
      }
    }
  }
}
</script>

<style scoped>
  .text-editor{
    height: 100%;
    position: relative;
  }
  .text-editor >>> .CodeMirror {
    height: auto;
    min-height: 300px;
  }
  .text-editor >>> .CodeMirror-scroll {
    min-height: 300px;
  }
  .text-editor >>> .cm-s-rubyblue span.cm-string {
    color: #F08047;
  }
  /* 代码提示 */
  .CodeMirror-hints {
    position: absolute;
    z-index: 9999;
    overflow: hidden;
    list-style: none;

    margin: 0;
    padding: 2px;

    -webkit-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
    -moz-box-shadow: 2px 3px 5px rgba(0,0,0,.2);
    box-shadow: 2px 3px 5px rgba(0,0,0,.2);
    border-radius: 3px;
    border: 1px solid silver;

    background: white;
    font-size: 90%;
    font-family: monospace;

    max-height: 20em;
    overflow-y: auto;
  }
  /* 右键菜单 */
  .custom-context-menu {
    padding: 4px 0 !important;
    min-width: 120px !important;
    background-color: #fff;
    border: 1px solid #e7e7e7 !important;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1) !important;
    border-radius: 4px !important;
  }
  .custom-context-menu li {
    margin: 0;
  }
  .custom-context-menu a {
    text-align: center;
    padding: 0 8px;
    margin: 0;
    font-size: 12px;
    line-height: 26px;
    color: #666;
    display: block;
    font-weight: 400;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
  }
  .custom-context-menu a:hover, .custom-context-menu a:focus {
    background-color: rgb(206, 241, 255);
    color: #666;
  }
</style>
