<template>
  <div class="app-container">
    <div class="form-container">
      <el-form ref="dataForm" :rules="rules" :model="project" label-position="left" label-width="120px">
        <el-form-item label="项目名称" prop="name" style="width: 400px;">
          <el-input v-model="project.name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="project.description" placeholder="项目描述" style="width: 400px;" />
        </el-form-item>
        <el-form-item label="是否启用配置" prop="isAvailable">
          <el-switch
            v-model="project.projectConfig.isAvailable"
            active-color="#00A854"
            active-text="启用"
            :active-value="1"
            inactive-color="#F04134"
            inactive-text="停用"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="接口请求日志" prop="openReqLog">
          <el-switch
            v-model="project.projectConfig.openReqLog"
            active-color="#00A854"
            active-text="开启"
            :active-value="1"
            inactive-color="#F04134"
            inactive-text="不开启"
            :inactive-value="0"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="全局参数" prop="globalVarJson">
              <span slot="label">
                <span>全局参数</span>
                <i
                  title="查看示例"
                  class="el-icon-question"
                  style="cursor: pointer"
                  @click="showExample('json', 'globalVarJson')" />
              </span>
              <json-editor ref="globalVarJsonEditor" v-model="project.projectConfig.globalVarJson" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="前置脚本" prop="beforeScript">
              <span slot="label">
                <span>前置脚本</span>
                <i
                  title="查看示例"
                  class="el-icon-question"
                  style="cursor: pointer"
                  @click="showExample('js', 'beforeScript')" />
              </span>
              <javascript-editor ref="beforeScriptEditor" v-model="project.projectConfig.beforeScript" />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <span title="调试脚本"><svg-icon icon-class="run" class="run-but" @click.native="runScript('beforeScript')" /></span>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="后置脚本" prop="afterScript">
              <span slot="label">
                <span>后置脚本</span>
                <i
                  title="查看示例"
                  class="el-icon-question"
                  style="cursor: pointer"
                  @click="showExample('js', 'afterScript')" />
              </span>
              <javascript-editor ref="afterScriptEditor" v-model="project.projectConfig.afterScript" />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <span title="调试脚本"><svg-icon icon-class="run" class="run-but" @click.native="runScript('afterScript')" /></span>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="22">
            <el-form-item label="异常监听脚本" prop="exceptionScript">
              <span slot="label">
                <span>异常监听脚本</span>
                <i
                  title="查看示例"
                  class="el-icon-question"
                  style="cursor: pointer"
                  @click="showExample('js', 'exceptionScript')" />
              </span>
              <javascript-editor ref="exceptionScriptEditor" v-model="project.projectConfig.exceptionScript" />
            </el-form-item>
          </el-col>
          <el-col :span="2">
            <span title="调试脚本"><svg-icon icon-class="run" class="run-but" @click.native="runScript('exceptionScript')" /></span>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div style="text-align: center;margin-top: 10px;margin-bottom: 10px;">
      <el-button type="primary" @click="update">更新配置</el-button>
    </div>
    <example ref="example" />
    <script-execute ref="scriptExecute" :before-script="false" :after-script="false" />
  </div>
</template>

<script>
import * as projectApi from '@/api/project'
import JsonEditor from '@/components/JsonEditor'
import JavascriptEditor from '@/components/JavascriptEditor'
import ScriptExecute from '@/components/ScriptExecute'
import Example from '@/components/Example'
export default {
  name: 'ProjectConfig',
  components: { JsonEditor, JavascriptEditor, ScriptExecute, Example },
  data() {
    return {
      id: null,
      project: {
        id: undefined,
        name: '',
        description: '',
        projectConfig: {
          openReqLog: 1,
          isAvailable: 1,
          globalVarJson: '{\"baseUrl\": \"http://127.0.0.1:8080\"}',
          beforeScript: '',
          afterScript: '',
          exceptionScript: ''
        }
      },
      rules: {
        name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '项目描述不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.id = this.$route.params.id || this.$route.query.id
      const { data } = await projectApi.getById(this.id)
      data.projectConfig = data.projectConfig || { ...this.project.projectConfig }
      if (data.projectConfig.globalVarJson) {
        try {
          data.projectConfig.globalVarJson = JSON.parse(data.projectConfig.globalVarJson)
        } catch (e) {
          console.log(e)
          this.$message.error('全局参数错误，非JSON格式')
        }
      } else {
        data.projectConfig.globalVarJson = {}
      }
      this.project = data
    },
    update() {
      if (this.project.projectConfig.globalVarJson) {
        try {
          JSON.parse(this.project.projectConfig.globalVarJson)
        } catch (e) {
          this.$message.error('全局参数错误，非JSON格式')
          return
        }
      }
      this.$confirm('确定更新项目配置吗？').then(() => {
        projectApi.update(this.project).then(() => {
          this.$notify({
            title: 'Success',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          this.init()
        })
      })
    },
    runScript(name) {
      const script = this.project.projectConfig[name]
      if (this.project.projectConfig.globalVarJson) {
        try {
          this.$refs.scriptExecute.setEnvMap(JSON.parse(this.project.projectConfig.globalVarJson))
        } catch (e) {
          console.error('设置envMap错误', e)
        }
      }
      this.$refs.scriptExecute.show(this.project.id, script)
    },
    showExample(type, name) {
      let title = ''
      let text = ''
      if (name === 'globalVarJson') {
        title = '项目全局参数'
        text = {
          baseUrl: 'http://127.0.0.1:8080',
          username: 'admin',
          password: 123456,
          desc: '',
          desc1: '这是一个全局参数配置示例',
          desc2: '请求参数可以通过${xxx}方式替换变量',
          desc3: 'js中可以通过env.getGlobal(\'xxx\')获取值',
          desc4: 'http.postJson(\'${baseUrl}\', { username: \'${username}\' })'
        }
      } else if (name === 'beforeScript') {
        title = '前置脚本示例'
        text = '// 该脚本是在所有脚本执行前触发，策略开始前执行\n' +
          '// 脚本适用于提前登录，请求/响应拦截处理\n' +
          '\n' +
          '// 登录示例\n' +
          'let result = http.postJson("${baseUrl}/api/auth/login", {\n' +
          '  "username": "${username}",\n' +
          '  "password": "${password}"\n' +
          '});\n' +
          '\n' +
          'let token = result.data.token;\n' +
          'log.info(\'token: \' + token);\n' +
          'env.setGlobal("token", token);\n' +
          '\n' +
          '// 请求拦截处理，设置授权headers\n' +
          'scriptContext.addRequestProcessor(function(request) {\n' +
          '  request.addHeaders("Authorization", token);\n' +
          '});\n' +
          '\n' +
          '// 响应拦截处理\n' +
          'scriptContext.addResponseProcessor(function(response, status, log) {\n' +
          '  // 这里判断请求是否成功（这里是接口失败，并不是脚本执行异常）\n' +
          '  if (status == 200 && response && response.code && response.code != \'200\') {\n' +
          '    // code不等于200时请求失败，修改日志状态: 2成功 3 失败\n' +
          '    log.status = 3;\n' +
          '\t// 记录失败日志\n' +
          '    log.appendLog(response.message || "");\n' +
          '  }\n' +
          '});'
      } else if (name === 'afterScript') {
        title = '后置脚本示例'
        text = '// 该脚本是在所有脚本执行后触发，策略正常执行完成后执行\n' +
          '// 脚本适用于用来监听脚本执行情况\n' +
          '\n' +
          '// 发送钉钉群通知示例\n' +
          'let projectName = scriptContext.project.name;\n' +
          'let strategyName = scriptContext.strategy != null ? scriptContext.strategy.name : null\n' +
          'if (scriptContext.strategy && scriptContext.strategy.strategy == 2) {\n' +
          '\t// TODO 压测不处理\n' +
          '} else {\n' +
          '\t// 定时任务\n' +
          '\tif (scriptContext.refLog == 2) {\n' +
          '\t\t// 全部执行成功\n' +
          '\t\tsendNotice(projectName + \', 策略\' + strategyName + \'执行通过\');\n' +
          '\t} else {\n' +
          '\t\t// 策略执行不通过\n' +
          '\t\tfor (let i in scriptContext.apiLogList) {\n' +
          '\t\t\tlet apiLog = scriptContext.apiLogList[i];\n' +
          '\t\t\tif (apiLog.status == 3) {\n' +
          '\t\t\t\t// 执行不通过的请求\n' +
          '\t\t\t\tsendNotice(projectName + \', 接口: \' + apiLog.url + \' 执行失败\');\n' +
          '\t\t\t}\n' +
          '\t\t}\n' +
          '\t}\n' +
          '}\n' +
          '\n' +
          'function sendNotice(msg) {\n' +
          '\t// 发送钉钉群通知\n' +
          '\tlet access_token = \'你的群机器人access_token\';\n' +
          '\thttp.postJson(\'https://oapi.dingtalk.com/robot/send?access_token=\' + access_token, {\n' +
          '\t\tmsgtype: \'text\', \n' +
          '\t\ttext: {\n' +
          '\t\t\tcontent: \'接口自动化测试：\' + msg\n' +
          '\t\t}\n' +
          '\t});\n' +
          '}'
      } else if (name === 'exceptionScript') {
        title = '异常监听脚本示例'
        text = '// 该脚本是在策略执行异常时触发\n' +
          '// 脚本适用于异常监听通知\n' +
          '\n' +
          '// 发送钉钉群通知示例\n' +
          'let projectName = scriptContext.project.name;\n' +
          'let strategyName = scriptContext.strategy != null ? scriptContext.strategy.name : null\n' +
          '// 发送钉钉群通知\n' +
          'let access_token = \'你的群机器人access_token\';\n' +
          'http.postJson(\'https://oapi.dingtalk.com/robot/send?access_token=\' + access_token, {\n' +
          '\tmsgtype: \'text\', \n' +
          '\ttext: {\n' +
          '\t\tcontent: \'接口自动化测试：\' + projectName + \', 策略\' + strategyName + \'执行异常\'\n' +
          '\t}\n' +
          '});'
      }
      this.$refs.example.show(title, type, text)
    }
  }
}
</script>

<style scoped>
  .form-container {
    width: 80%;
    margin: auto;
  }
  .run-but {
    cursor: pointer;
    margin-top: 10px;
  }
</style>
