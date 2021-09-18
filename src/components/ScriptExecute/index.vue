<template>
  <el-dialog title="运行脚本" :visible.sync="visible" :append-to-body="true" :modal-append-to-body="true" :destroy-on-close="true" top="8vh" width="800px" :before-close="handleClose">
    <div class="el-dialog-div">
      <div style="margin-bottom: 10px;">脚本：</div>
      <javascript-editor ref="jsEditor" v-model="script" />
      <div v-if="resultStr" style="margin-top: 15px;margin-bottom: 10px;">执行结果：</div>
      <div class="text-editor-div">
        <text-editor v-if="resultStr" v-model="resultStr" />
      </div>
    </div>
    <div class="button-right-div">
      <el-button :disabled="!canRun" type="primary" size="small" @click="run">执行</el-button>
    </div>
    <!--<div slot="footer" class="dialog-footer">
      <el-button :disabled="!canRun" type="primary" size="small" @click="run">执行</el-button>
    </div>-->
  </el-dialog>
</template>
<script>
import { runScript } from '@/api/api-script'
import JavascriptEditor from '@/components/JavascriptEditor'
import TextEditor from '@/components/TextEditor'
export default {
  name: 'ScriptExecute',
  components: { JavascriptEditor, TextEditor },
  props: {
    beforeScript: {
      type: Boolean,
      default: true
    },
    afterScript: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      script: '',
      projectId: null,
      result: {},
      resultStr: '',
      visible: false,
      canRun: true,
      envMap: {}
    }
  },
  methods: {
    show(projectId, script) {
      this.script = script || ''
      this.projectId = projectId
      this.result = {}
      this.resultStr = ''
      this.visible = true
      this.$nextTick(() => {
        this.$refs.jsEditor && this.$refs.jsEditor.reloadTips(projectId)
      })
    },
    setEnvMap(envMap) {
      envMap = envMap || {}
      this.envMap = { ...envMap }
    },
    close() {
      this.visible = false
    },
    run() {
      this.canRun = false
      this.resultStr = null
      runScript({
        projectId: this.projectId,
        script: this.script,
        beforeScript: this.beforeScript,
        afterScript: this.afterScript,
        envMap: this.envMap
      }).then(response => {
        this.canRun = true
        this.result = response.data
        let str = ''
        if (this.result.refLog && this.result.refLog.msg) {
          str += this.result.refLog.msg + '\r\n\r\n'
        }
        if (this.result.logs && this.result.logs.length > 0) {
          for (const i in this.result.logs) {
            const msg = this.result.logs[i].msg
            if (msg) {
              str += msg + '\r\n'
            }
          }
        }
        if (this.result.result && (typeof this.result.result) !== 'string') {
          try {
            str += '\n执行结果：\n' + JSON.stringify(this.result.result, null, 2)
          } catch (e) {
            str += '\n执行结果：' + this.result.result
          }
        } else {
          str += '\n执行结果：' + this.result.result
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
  .text-editor-div {
    max-height: 320px;
    overflow-y: auto;
  }
  .button-right-div {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
