<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.url" placeholder="URL" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.apiName" placeholder="api命名" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.apiDesc" placeholder="请求描述" style="width: 200px;" class="filter-item" />
      <el-select v-model="listQuery.projectId" clearable filterable placeholder="所属项目" class="filter-item">
        <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">
        搜索
      </el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">{{ scope.$index+1 }}</template>
      </el-table-column>
      <el-table-column label="URL" align="center">
        <template slot-scope="scope">{{ scope.row.url }}</template>
      </el-table-column>
      <el-table-column label="api命名" align="center">
        <template slot-scope="scope">{{ scope.row.apiName }}</template>
      </el-table-column>
      <el-table-column label="请求描述" align="center">
        <template slot-scope="scope">{{ scope.row.apiDesc }}</template>
      </el-table-column>
      <el-table-column label="请求方法" align="center">
        <template slot-scope="scope">{{ scope.row.method }}</template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="scope">{{ scope.row.createUsername }}
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="200" align="center">
        <template slot-scope="scope">{{ scope.row.createTime }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button size="mini" @click="runScript(row)">
            测试
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button slot="reference" size="mini" type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.pageNo"
      :limit.sync="listQuery.pageSize"
      @pagination="fetchData"
    />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="1000px" :before-close="handleClose">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="请求描述" prop="apiDesc">
              <el-input v-model="temp.apiDesc" size="medium" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="请求方法" prop="method">
              <el-select v-model="temp.method" placeholder="请选择">
                <el-option v-for="item in methodList" :key="item.method" :label="item.method" :value="item.method" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属项目" prop="projectId">
              <el-select v-model="temp.projectId" filterable placeholder="请选择" class="filter-item">
                <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="请求url" prop="url">
              <el-input v-model="temp.url" placeholder="${baseUrl}/user/getById?id=${userId}" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item prop="apiName">
              <span slot="label">
                api 命名
                <el-tooltip
                  class="item"
                  effect="dark"
                  placement="top-start"
                  :content="'命名确保在项目中唯一，脚本中通过 http.request(\'' + (temp.apiName || 'xxx') + '\'); 请求当前接口'">
                  <i class="el-icon-question" />
                </el-tooltip>
              </span>
              <el-input v-model="temp.apiName" placeholder="请输入api命名，唯一，如: /user/getById" />
            </el-form-item>
          </el-col>
          <el-col v-if="temp.method === 'POST'" :span="12" prop="contentType">
            <el-form-item label="Content-Type" prop="contentType">
              <el-select v-model="temp.contentType" placeholder="请选择">
                <el-option v-for="item in contentTypeList" :key="item.contentType" :label="item.contentType" :value="item.contentType" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 请求头 -->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="请求头" prop="headersJson">
              <el-input v-model="temp.headersJson" :placeholder="headersPlaceholder" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div v-if="temp.method === 'POST'" style="color: #606266;font-size: 14px;margin-bottom: 15px;font-weight: bold;">请求 Body：</div>
      <json-editor v-if="temp.method === 'POST' && temp.contentType === 'application/json'" ref="jsonEditor" v-model="temp.body" />
      <text-editor v-else-if="temp.method === 'POST'" ref="jsonEditor" v-model="temp.body" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button @click="formTestApi">
          测试
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
    <script-execute ref="scriptExecute" />
  </div>
</template>

<script>
import * as apiRequest from '@/api/api-request'
import { list } from '@/api/project'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import JsonEditor from '@/components/JsonEditor'
import TextEditor from '@/components/TextEditor'
import ScriptExecute from '@/components/ScriptExecute'

export default {
  name: 'Api',
  components: { Pagination, JsonEditor, TextEditor, ScriptExecute },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      list: null,
      canUpdate: true,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        name: ''
      },
      projectList: [],
      pluginTypeOptions: ['reader', 'writer'],
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑API请求',
        create: '新增API请求'
      },
      methodList: [
        { method: 'GET' },
        { method: 'POST' }
      ],
      contentTypeList: [
        { contentType: 'application/json' },
        { contentType: 'application/x-www-form-urlencoded' },
        { contentType: 'text/plain' }
      ],
      rules: {
        projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
        apiName: [{ required: true, message: '命名不能为空', trigger: 'blur' }],
        apiDesc: [{ required: true, message: '接口描述不能为空', trigger: 'blur' }],
        method: [{ required: true, message: '请求方法不能为空', trigger: 'blur' }],
        url: [{ required: true, message: '请求url不能为空', trigger: 'blur' }]
      },
      temp: {
        id: undefined,
        projectId: null,
        apiName: '',
        apiDesc: '',
        method: null,
        url: '',
        contentType: null,
        headersJson: '',
        body: '',
        script: undefined
      },
      bodyJson: '',
      visible: true,
      headersPlaceholder: '{\"Content-Type\": \"application/json;charset=UTF-8\", \"Cookie\": \"ut=${ut}\"}'
    }
  },
  watch: {
    'temp.contentType': {
      handler(value) {
        this.handleHeader(this.temp, value)
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      this.fetchData()
      list({ isAvailable: 1 }).then(response => {
        this.projectList = response.data || []
      })
    },
    fetchData() {
      this.canUpdate = true
      this.listLoading = true
      apiRequest.listPage(this.listQuery).then(response => {
        this.total = response.total
        this.list = response.data
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        projectId: null,
        apiName: '',
        apiDesc: '',
        method: null,
        url: '',
        contentType: null,
        headersJson: '',
        body: '',
        script: undefined
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      if (!this.canUpdate) {
        return
      }
      this.handleHeader(this.temp, this.temp.contentType)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.canUpdate = false
          apiRequest.add(this.temp).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          }).catch(() => {
            this.canUpdate = true
          })
        }
      })
    },
    handleUpdate(row) {
      const temp = Object.assign({}, row)
      if (temp.headersJson) {
        try {
          temp.contentType = JSON.parse(temp.headersJson)['Content-Type'] || null
          if (temp.contentType && temp.contentType.indexOf(';') > 0) {
            temp.contentType = temp.contentType.substring(0, temp.contentType.indexOf(';'))
          }
        } catch (e) {
          console.error(e)
        }
      }
      if (temp.body && temp.contentType === 'application/json') {
        try {
          temp.body = JSON.parse(temp.body)
        } catch (e) {
          console.log(e)
        }
      }
      this.temp = temp
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      if (!this.canUpdate) {
        return
      }
      this.handleHeader(this.temp, this.temp.contentType)
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          this.canUpdate = false
          apiRequest.update(tempData).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '修改成功',
              type: 'success',
              duration: 2000
            })
          }).catch(() => {
            this.canUpdate = true
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除吗？').then(() => {
        apiRequest.deleted(row.id).then(response => {
          this.fetchData()
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    handleHeader(obj, contextType) {
      try {
        if (contextType && obj.headersJson) {
          const map = JSON.parse(obj.headersJson)
          map['Content-Type'] = contextType
          obj.headersJson = JSON.stringify(map)
        } else if (contextType) {
          obj.headersJson = JSON.stringify({ 'Content-Type': contextType })
        }
        if (obj.headersJson) {
          JSON.parse(obj.headersJson)
        }
      } catch (e) {
        this.$message.error('请求头数据格式错误，必须为json格式')
        throw e
      }
    },
    handleClose(done) {
      if (this.temp.id) {
        done()
        return
      }
      this.$confirm('确认关闭？')
        .then(_ => {
          done()
        })
        .catch(_ => {})
    },
    formTestApi() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.runScript(this.temp)
        }
      })
    },
    runScript(obj) {
      let script = ''
      if (obj.id) {
        script += 'http.request(\'' + obj.apiName + '\', {})'
      } else {
        if (obj.apiName) {
          script += '// 保存后可以通过apiName请求\r\n'
          script += '// http.request(\'' + obj.apiName + '\', {})\r\n\r\n'
        }
        this.handleHeader(obj, obj.contextType)
        const url = obj.url || ''
        const body = obj.body || ''
        if (obj.method === 'POST') {
          if (obj.headersJson) {
            if (obj.headersJson.indexOf('application/json')) {
              script += 'http.post(\'' + url + '\', ' + body + ', ' + obj.headersJson + ')'
            } else {
              script += 'http.post(\'' + url + '\', \'' + body + '\', ' + obj.headersJson + ')'
            }
          } else {
            script += 'http.post(\'' + url + '\', \'' + body + '\')'
          }
        } else {
          script += 'http.get(\'' + url + '\')'
        }
      }
      this.$refs.scriptExecute.show(obj.projectId, script)
    }
  }
}
</script>
