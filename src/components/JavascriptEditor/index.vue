<template>
  <div class="text-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import { codeTips } from '@/utils/code-tips'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'
import * as scriptApi from '@/api/api-script'

export default {
  name: 'JavascriptEditor',
  // eslint-disable-next-line vue/require-prop-types
  props: ['value', 'projectId'],
  data() {
    return {
      editor: null,
      codeTipsData: {
        apiNames: [],
        varCodes: {},
        globalMap: {}
      }
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
      extraKeys: {
        'Tab': 'autocomplete',
        'Ctrl-/': this.toggleComment
      },
      hintOptions: {
        completeSingle: false,
        hint: this.handleShowHint
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
        code === 48 ||
        // /
        code === 191) {
        this.editor.showHint()
      }
    })
    this.init()
  },
  methods: {
    init() {
      // this.codeTipsData.apiNames = ['/user/list', '/order/getById']
      // this.codeTipsData.globalMap = { 'baseUrl': null, 'username': null, 'password': null }
      // this.codeTipsData.varCodes = { http: { 'request(apiName)': null, 'post(url, body, headers)': null } }
      this.reloadTips()
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
    reloadTips(projectId) {
      if (projectId) {
        this.projectId = projectId
      }
      scriptApi.codeTips({ projectId: this.projectId }).then(response => {
        const data = response.data
        this.codeTipsData.varCodes = data.varCodes || {}
        this.codeTipsData.globalMap = data.globalMap || {}
      })
      scriptApi.apiNameTips({ projectId: this.projectId }).then(response => {
        this.codeTipsData.apiNames = response.data
      })
    },
    toggleComment() {
      // 注释
      this.editor.toggleComment && this.editor.toggleComment({
        lineComment: '//'
      })
    },
    handleShowHint() {
      const cursor = this.editor.getCursor()
      const lineIndex = cursor.line
      const currentLine = this.editor.getLine(lineIndex)
      const lastIndex = cursor.ch
      const list = codeTips(this.codeTipsData, currentLine, lastIndex)
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
  .text-editor >>> .CodeMirror-scroll{
    min-height: 300px;
  }
  .text-editor >>> .cm-s-rubyblue span.cm-string {
    color: #F08047;
  }
</style>
