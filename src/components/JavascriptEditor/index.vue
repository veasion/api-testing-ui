<template>
  <div class="text-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import { codeTips } from '@/utils/codeTips'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'
import 'codemirror/addon/hint/anyword-hint.js'

export default {
  name: 'JavascriptEditor',
  // eslint-disable-next-line vue/require-prop-types
  props: ['value'],
  data() {
    return {
      editor: null,
      codeTipsData: {}
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
        code === 48) {
        this.editor.showHint()
      }
    })
    this.init()
  },
  methods: {
    init() {
      this.codeTipsData = {
        log: { 'info(message)': null, 'debug(message)': null, 'error(message)': null },
        scriptContext: {
          refLog: { id: null },
          strategy: null,
          apiLogList: null,
          project: { name: null }
        },
        http: { 'request(apiName)': null, post: null }
        // http: ['request(apiName)', 'post(url, body, headers)']
      }
    },
    getValue() {
      return this.editor.getValue()
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
      const tipsResult = codeTips(this.codeTipsData, currentLine, lastIndex, false)
      if (tipsResult && tipsResult.list && tipsResult.list.length > 0) {
        // const codeMirrorInstance = this.codeEditorRef.getCodeMirrorInstance()
        // codeMirrorInstance.Pos(cursor.line, start)
        // codeMirrorInstance.Pos(cursor.line, end)
        // const fromCursor = Object.assign(cursor, { ch: lastIndex })
        // const toCursor = Object.assign(cursor, { ch: lastIndex })
        return {
          from: cursor,
          to: cursor,
          list: tipsResult.list
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
