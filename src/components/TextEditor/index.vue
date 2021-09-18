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

export default {
  name: 'TextEditor',
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
      mode: 'text',
      gutters: ['CodeMirror-lint-markers'],
      theme: 'rubyblue',
      lint: true
    })

    // this.textEditor.setOption('scrollbarStyle', 'simple' || 'overlay')
    this.textEditor.setValue(this.value ? this.value : '')
    this.textEditor.on('change', cm => {
      this.$emit('changed', cm.getValue())
      this.$emit('input', cm.getValue())
    })
  },
  methods: {
    getValue() {
      return this.textEditor.getValue()
    },
    getEditor() {
      return this.textEditor
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
</style>
