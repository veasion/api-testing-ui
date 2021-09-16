<template>
  <div class="app-container">
    <div class="form-container">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" label-position="left" label-width="120px">
        <el-form-item label="所属项目" prop="projectId">
          <el-select v-model="dataForm.projectId" clearable filterable placeholder="请选择" class="filter-item" @change="loadApiList">
            <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用例名称" prop="caseName">
          <el-input v-model="dataForm.caseName" placeholder="用例名称" style="width: 400px;" />
        </el-form-item>
        <el-form-item label="用例描述" prop="caseDesc">
          <el-input v-model="dataForm.caseDesc" placeholder="用例描述" style="width: 400px;" />
        </el-form-item>
        <el-form-item label="模块" prop="module">
          <el-input v-model="dataForm.module" placeholder="模块" style="width: 400px;" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="dataForm.author" placeholder="作者" style="width: 400px;" />
        </el-form-item>
      </el-form>
      <div style="margin-top: 10px;margin-bottom: 10px;">
        <span class="script-title-span">用例脚本</span>
        <i title="查看示例" class="el-icon-question" style="cursor: pointer" @click="showExample" />
        <span title="调试脚本" style="margin-left: 15px">
          <svg-icon icon-class="run" class="run-but" @click.native="runScript" />
        </span>
        <span style="margin-left: 200px;font-size: 10px">选择插入API请求：</span>
        <el-select ref="apiSelect" v-model="apiRequestId" clearable filterable placeholder="请选择" class="filter-item" @change="insertRequst">
          <el-option v-for="item in apiList" :key="item.id" :label="item.apiDesc" :value="item.id">
            <span style="float: left">{{ item.apiDesc }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.apiName }}</span>
          </el-option>
        </el-select>
      </div>
      <javascript-editor ref="scriptEditor" v-model="dataForm.script" />
    </div>
    <div style="text-align: center;margin-top: 10px;margin-bottom: 10px;">
      <el-button v-if="id" type="primary" @click="update">保存</el-button>
      <el-button v-else type="primary" @click="saveOrUpdate">新增</el-button>
    </div>
    <example ref="example" />
    <script-execute ref="scriptExecute" />
  </div>
</template>

<script>
import { list } from '@/api/project'
import * as apiRequest from '@/api/api-request'
import * as testCaseApi from '@/api/api-test-case'
import { toScript } from '@/api/api-script'
import JavascriptEditor from '@/components/JavascriptEditor'
import ScriptExecute from '@/components/ScriptExecute'
import Example from '@/components/Example'
export default {
  name: 'TestCaseConfig',
  components: { JavascriptEditor, ScriptExecute, Example },
  data() {
    return {
      id: null,
      apiList: [],
      apiRequestId: null,
      dataForm: {
        projectId: null,
        caseName: null,
        caseDesc: null,
        module: null,
        author: null,
        script: ''
      },
      projectList: [],
      rules: {
        projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
        caseName: [{ required: true, message: '用例名称不能为空', trigger: 'blur' }],
        caseDesc: [{ required: true, message: '用例描述不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    async init() {
      this.id = this.id || this.$route.params.id || this.$route.query.id
      if (this.id) {
        const { data } = await testCaseApi.getById(this.id)
        this.dataForm = data || {}
        this.loadApiList()
      }
      list({ isAvailable: 1 }).then(response => {
        this.projectList = response.data || []
      })
    },
    loadApiList() {
      apiRequest.list({ isAvailable: 1, projectId: this.dataForm.projectId }).then(response => {
        this.apiList = response.data || []
      })
      this.$refs.scriptEditor && this.$refs.scriptEditor.reloadTips(this.dataForm.projectId)
    },
    update() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$confirm('确定更新项目配置吗？').then(() => {
            this.saveOrUpdate()
          })
        }
      })
    },
    saveOrUpdate() {
      if (!this.dataForm.script && this.dataForm.script !== '') {
        this.$message.error('脚本不能为空')
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          testCaseApi[this.id ? 'update' : 'add'](this.dataForm).then((response) => {
            this.$notify({
              title: 'Success',
              message: this.id ? '保存成功' : '新增成功',
              type: 'success',
              duration: 2000
            })
            if (!this.id) {
              this.id = response.data
            }
            this.init()
          })
        }
      })
    },
    insertRequst() {
      toScript({ id: this.apiRequestId }).then((response) => {
        this.dataForm.script = (this.dataForm.script || '') + '\r\n' + (response.data || '')
        this.apiRequestId = null
      }).catch(() => {
        this.apiRequestId = null
      })
    },
    runScript() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$refs.scriptExecute.show(this.dataForm.projectId, this.dataForm.script || '')
        }
      })
    },
    showExample() {
      const text = '// 编写测试用例脚本能串联其他接口进行测试\n' +
        '// 这里介绍几种请求方式\n' +
        '\n' +
        '// 根据请求接口的api命名请求（新增API接口时的唯一api命名）\n' +
        'http.request(\'api命名\')\n' +
        '\n' +
        '// 如果请求接口的api有${xxx}参数则通过以下方式传参\n' +
        'http.request(\'api命名\', { xxx: \'测试\' })\n' +
        '\n' +
        '// 请求别的接口通用方式\n' +
        '// http.request(url, method, body, headers)\n' +
        '// 示例\n' +
        'http.request(\'${baseUrl}/api/auth/login\', \'post\', { username: \'admin\', password: \'123456\' }, { \'Content-Type\': \'application/json\' })\n' +
        '\n' +
        '// 除此之外还有等以下一系列请求方法\n' +
        '// http.get(url)\n' +
        '// http.post(url, body, headers)\n' +
        '// http.postJson(url, body)\n' +
        '// http.postFormData(url, body)\n' +
        '\n' +
        '// 测试示例\n' +
        '// 正常情况下要通过api命名请求，我这示例直接通过http请求\n' +
        'let resp = http.post(\'${baseUrl}/api/project/add\', \n' +
        '                     { name: \'测试项目\' + common.randCode(4), description: \'描述\' }, \n' +
        '                     { \'Content-Type\': \'application/json\' });\n' +
        'assertions.assertNotNull(resp);\n' +
        'let projectId = resp.data;\n' +
        'assertions.assertNotNull(projectId, \'项目ID\');\n' +
        '\n' +
        'resp = http.get(\'${baseUrl}/api/project/getById?id=\' + projectId);\n' +
        'assertions.assertNotNull(resp.data);\n' +
        'assertions.assertEquals(resp.data.id, projectId);\n'
      this.$refs.example.show('测试用例脚本示例', 'js', text)
    }
  }
}
</script>

<style scoped>
  .form-container {
    width: 80%;
    margin: auto;
  }
  .script-title-span {
    color: #606266;
    font-size: 14px;
    font-weight: bold;
  }
  .run-but {
    cursor: pointer;
    margin-top: 10px;
  }
</style>
