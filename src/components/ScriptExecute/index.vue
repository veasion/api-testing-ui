<template>
  <el-dialog title="运行脚本" :visible.sync="visible" width="800px" :before-close="handleClose">
    <div style="margin-bottom: 10px;">脚本：</div>
    <javascript-editor v-model="script" />
    <div v-if="resultStr" style="margin-top: 15px;margin-bottom: 10px;">执行结果：</div>
    <text-editor v-if="resultStr" v-model="resultStr" />
    <div slot="footer" class="dialog-footer">
      <el-button :disabled="!canRun" type="primary" @click="run">执行</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { runScript } from '@/api/api-script'
import JavascriptEditor from '@/components/JavascriptEditor'
import TextEditor from '@/components/TextEditor'
export default {
  name: 'ScriptExecute',
  components: { JavascriptEditor, TextEditor },
  data() {
    return {
      script: '',
      projectId: null,
      result: {},
      resultStr: '',
      visible: false,
      canRun: true
    }
  },
  methods: {
    show(projectId, script) {
      this.script = script || ''
      this.projectId = projectId
      this.result = {}
      this.resultStr = ''
      this.visible = true
    },
    close() {
      this.visible = false
    },
    run() {
      this.canRun = false
      this.resultStr = null
      runScript({ projectId: this.projectId, script: this.script }).then(response => {
        this.canRun = true
        this.result = response.data
        let str = ''
        if (this.result.logs && this.result.logs.length > 0) {
          for (const i in this.result.logs) {
            const msg = this.result.logs[i].msg
            if (msg) {
              str += msg + '\r\n'
            }
          }
        }
        if (!str) {
          str = this.result.result || null
        }
        try {
          this.resultStr = (typeof str) === 'string' ? str : JSON.stringify(str)
        } catch (e) {
          this.resultStr = str
        }
      }).catch(() => {
        this.canRun = true
      })
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
