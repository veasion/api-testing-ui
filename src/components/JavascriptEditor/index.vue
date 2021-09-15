<template>
  <div class="text-editor">
    <textarea ref="textarea" />
  </div>
</template>

<script>
import CodeMirror from 'codemirror'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/rubyblue.css'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint.js'

export default {
  name: 'JavascriptEditor',
  // eslint-disable-next-line vue/require-prop-types
  props: ['value'],
  data() {
    return {
      textEditor: null
    }
  },
  watch: {
    value(value) {
      const editorValue = this.textEditor.getValue()
      if (value !== editorValue) {
        this.textEditor.setValue(value || '')
      }
    }
  },
  mounted() {
    this.textEditor = CodeMirror.fromTextArea(this.$refs.textarea, {
      lineNumbers: true,
      mode: 'text/javascript',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      lint: true,
      hintOptions: {
        completeSingle: false,
        tables: {
          log: ['info', 'debug', 'error'],
          scriptContext: ['project', 'refLog', 'strategy', 'apiLogList'],
          env: ['eval', 'get', 'put', 'set', 'setGlobal', 'putGlobal', 'getGlobal'],
          http: ['request', 'post', 'postJson', 'postFormData', 'get', 'getByParams'],
          common: ['jsonValue', 'eval', 'md5', 'randCode', 'randInt', 'randMobile', 'formatDate'],
          assertions: ['assertJsonPath', 'assertTrue', 'assertFalse', 'assertNull', 'assertEmpty', 'assertNotNull', 'assertNotEmpty', 'assertEquals']
        }
      }
    })

    this.textEditor.setValue(this.value ? this.value : '')
    this.textEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })

    this.textEditor.on('keyup', (cm) => {
      this.textEditor.showHint()
      // CodeMirror.showHint(cm, CodeMirror.hint.deluge, { completeSingle: false })
    })
  },
  methods: {
    getValue() {
      return this.textEditor.getValue()
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
