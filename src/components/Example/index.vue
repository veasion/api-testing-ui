<template>
  <el-dialog :title="title" :visible.sync="visible" width="800px" :before-close="handleClose">
    <div>
      <json-editor v-if="type === 'json'" v-model="text" />
      <javascript-editor v-if="type === 'js'" v-model="text" />
      <text-editor v-if="type === 'text'" v-model="text" />
    </div>
  </el-dialog>
</template>
<script>
import JsonEditor from '@/components/JsonEditor'
import JavascriptEditor from '@/components/JavascriptEditor'
import TextEditor from '@/components/TextEditor'
export default {
  name: 'Example',
  components: { JsonEditor, JavascriptEditor, TextEditor },
  props: {},
  data() {
    return {
      text: '',
      type: 'text',
      title: '示例',
      visible: false
    }
  },
  methods: {
    show(title, type, text) {
      if (title) {
        this.title = title
      }
      if (type === 'json' && (typeof text) === 'string') {
        try {
          text = JSON.parse(text)
        } catch (e) {
          console.error('json错误: ' + text, e)
        }
      }
      this.text = text
      this.type = type || 'text'
      this.visible = true
    },
    close() {
      this.visible = false
    },
    handleClose(done) {
      // this.$confirm('确认关闭？').then(() => done())
      done()
    }
  }
}
</script>

<style scoped>
</style>
