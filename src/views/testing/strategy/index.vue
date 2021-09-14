<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="策略名称" style="width: 150px;" class="filter-item" />
      <el-input v-model="listQuery.desc" placeholder="策略描述" style="width: 150px;" class="filter-item" />
      <el-select v-model="listQuery.type" clearable filterable placeholder="类型">
        <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.strategy" clearable filterable placeholder="执行策略">
        <el-option v-for="item in strategyList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
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
      <!--<el-table-column align="center" label="序号" width="95">
        <template slot-scope="scope">{{ scope.$index+1 }}</template>
      </el-table-column>-->
      <el-table-column label="项目名称" align="center" width="120px">
        <template slot-scope="scope">{{ scope.row.projectName }}</template>
      </el-table-column>
      <el-table-column label="策略名称" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="策略描述" align="center">
        <template slot-scope="scope">{{ scope.row.desc }}</template>
      </el-table-column>
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">{{ scope.row.type | typeFilter }}</template>
      </el-table-column>
      <el-table-column label="执行策略" align="center">
        <template slot-scope="scope">{{ scope.row.strategy | strategyFilter }}</template>
      </el-table-column>
      <el-table-column label="任务执行cron" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.jobCron }}</template>
      </el-table-column>
      <el-table-column label="是否启用" align="center" width="150">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.isAvailable"
            active-color="#00A854"
            active-text="启用"
            :active-value="1"
            inactive-color="#F04134"
            inactive-text="停用"
            :inactive-value="0"
            @change="changeSwitch(scope.row)"
          />
        </template>
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
          <el-button v-if="row.type === 3" size="mini" @click="runScript(row)">
            测试
          </el-button>
          <el-button v-if="row.strategy === 1" size="mini" @click="trigger(row)">
            触发任务
          </el-button>
          <el-button v-if="row.strategy === 2" size="mini" @click="runPressure(row)">
            压测
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
            <el-form-item label="策略名称" prop="name">
              <el-input v-model="temp.name" size="medium" placeholder="请输入名称" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="策略描述" prop="desc">
              <el-input v-model="temp.desc" size="medium" placeholder="请输入描述" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="所属项目" prop="projectId">
              <el-select v-model="temp.projectId" filterable placeholder="请选择" class="filter-item" @change="loadTestCase">
                <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="类型" prop="type">
              <el-select v-model="temp.type" placeholder="请选择">
                <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" @change="changeType" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="执行策略" prop="strategy">
              <el-select v-model="temp.strategy" placeholder="请选择">
                <el-option v-for="item in strategyList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="temp.strategy === 2" :span="8">
            <el-form-item label="线程数" prop="threadCount">
              <el-input-number v-model="temp.threadCount" :min="1" :max="1000" size="mini" style="width: 100px;" />
            </el-form-item>
          </el-col>
          <el-col v-else :span="8">
            <el-dialog
              title="提示"
              :visible.sync="showCronBox"
              width="60%"
              append-to-body
            >
              <cron v-model="temp.jobCron" />
              <span slot="footer" class="dialog-footer">
                <el-button @click="showCronBox = false">关闭</el-button>
                <el-button type="primary" @click="showCronBox = false">确 定</el-button>
              </span>
            </el-dialog>
            <el-form-item label="任务执行CRON" prop="jobCron">
              <el-input v-model="temp.jobCron" auto-complete="off" placeholder="请输入Cron表达式">
                <el-button v-if="!showCronBox" slot="append" icon="el-icon-turn-off" title="打开图形配置" @click="showCronBox = true" />
                <el-button v-else slot="append" icon="el-icon-open" title="关闭图形配置" @click="showCronBox = false" />
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="temp.strategy === 2" :gutter="20">
          <el-col :span="8">
            <el-form-item label="压测类型">
              <el-select v-model="threadStrategy.type" placeholder="请选择">
                <el-option v-for="item in strategyTypeList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="threadStrategy.type === 1" :span="8">
            <el-form-item label="压测时间(ms)">
              <el-input-number v-model="threadStrategy.timeInMillis" :min="1000" size="mini" style="width: 100px;" />
            </el-form-item>
          </el-col>
          <el-col v-else :span="8">
            <el-form-item label="执行多少次">
              <el-input-number v-model="threadStrategy.loopCount" :min="1" :max="9999999" size="mini" style="width: 100px;" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="并发间隔时间">
              <el-input-number v-model="threadStrategy.intervalInMillis" :min="-1" size="mini" style="width: 100px;" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row v-if="temp.type === 2" :gutter="20">
          <el-col :span="24">
            <el-form-item label="指定case" prop="caseIds">
              <el-select v-model="temp.caseIds" multiple clearable filterable placeholder="请选择" class="filter-item">
                <el-option v-for="item in testCaseList" :key="item.id" :label="item.caseName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div v-if="temp.type === 3" style="color: #606266;font-size: 14px;margin-bottom: 15px;font-weight: bold;">自定义脚本：</div>
      <javascript-editor v-if="temp.type === 3" v-model="temp.script" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button v-if="temp.type === 3" @click="formTestApi">
          测试脚本
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
import { list } from '@/api/project'
import Pagination from '@/components/Pagination'
import JavascriptEditor from '@/components/JavascriptEditor'
import ScriptExecute from '@/components/ScriptExecute'
import waves from '@/directive/waves'
import Cron from '@/components/Cron'
import * as testCaseApi from '@/api/api-test-case'
import * as apiExecuteStrategy from '@/api/api-execute-strategy'

export default {
  name: 'Strategy',
  components: { Pagination, JavascriptEditor, ScriptExecute, Cron },
  directives: { waves },
  filters: {
    typeFilter(value) {
      const map = {
        1: '所有case',
        2: '指定case',
        3: '自定义脚本'
      }
      return map[value]
    },
    strategyFilter(value) {
      const map = {
        1: '定时任务',
        2: '压测'
      }
      return map[value]
    }
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
        projectId: null,
        name: '',
        desc: '',
        type: null,
        strategy: null
      },
      projectList: [],
      testCaseList: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑策略',
        create: '新增策略'
      },
      typeList: [
        { value: 1, label: '所有case' },
        { value: 2, label: '指定case' },
        { value: 3, label: '自定义脚本' }
      ],
      strategyList: [
        { value: 1, label: '定时任务' },
        { value: 2, label: '压测' }
      ],
      rules: {
        projectId: [{ required: true, message: '请选择项目', trigger: 'change' }],
        name: [{ required: true, message: '策略名称不能为空', trigger: 'blur' }],
        desc: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '请选择类型', trigger: 'change' }],
        strategy: [{ required: true, message: '请选择策略', trigger: 'change' }]
      },
      temp: {
        id: undefined,
        projectId: null,
        name: '',
        desc: '',
        type: null,
        strategy: 1,
        jobCron: null,
        threadCount: null,
        threadStrategyJson: null,
        script: undefined,
        isAvailable: 0,
        caseIds: []
      },
      threadStrategy: {
        type: 1, // 压测类型：1 按时长 2 按次数
        loopCount: null, // 执行多少次
        timeInMillis: null, // 压测时间
        intervalInMillis: null // 并发间隔时间
      },
      strategyTypeList: [
        { value: 1, label: '按时长' },
        { value: 2, label: '按次数' }
      ],
      visible: true,
      showCronBox: false
    }
  },
  watch: {
    // 'type': {
    //   handler(value) {
    //   },
    //   deep: true,
    //   immediate: true
    // }
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
      apiExecuteStrategy.listPage(this.listQuery).then(response => {
        this.total = response.total
        this.list = response.data
        this.listLoading = false
      })
    },
    loadTestCase() {
      if (this.temp.projectId) {
        testCaseApi.list({ isAvailable: 1, projectId: this.temp.projectId }).then(response => {
          this.testCaseList = response.data || []
        })
      } else {
        this.temp.caseIds = []
        this.testCaseList = []
      }
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        projectId: null,
        name: '',
        desc: '',
        type: null,
        strategy: 1,
        jobCron: null,
        threadCount: null,
        threadStrategyJson: null,
        script: undefined,
        isAvailable: 0,
        caseIds: []
      }
      this.threadStrategy = {
        type: 1,
        loopCount: null,
        timeInMillis: null,
        intervalInMillis: null
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
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.threadStrategyJson = JSON.stringify(this.threadStrategy || '{}')
          this.canUpdate = false
          apiExecuteStrategy.add(this.temp).then(() => {
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
      this.resetTemp()
      const data = Object.assign({}, row)
      try {
        this.threadStrategy = JSON.parse(data.threadStrategyJson || '{}')
      } catch (e) {
        console.log(e)
      }
      this.temp = data
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    changeSwitch(row) {
      apiExecuteStrategy.update({ id: row.id, isAvailable: row.isAvailable }).then(() => {
        this.fetchData()
        this.$notify({
          title: 'Success',
          message: '操作成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    updateData() {
      if (!this.canUpdate) {
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.canUpdate = false
          this.temp.threadStrategyJson = JSON.stringify(this.threadStrategy || '{}')
          apiExecuteStrategy.update(this.temp).then(() => {
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
        apiExecuteStrategy.deleted(row.id).then(response => {
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
    changeType() {
      if (this.temp.type === 2) {
        this.loadTestCase()
      }
    },
    formTestApi() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.runScript(this.temp)
        }
      })
    },
    runScript(obj) {
      this.$refs.scriptExecute.show(obj.projectId, obj.script || '')
    },
    trigger(obj) {
      alert('接口已开发，前端功能待开发...')
    },
    runPressure(obj) {
      alert('接口已开发，前端功能待开发...')
    }
  }
}
</script>
