<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="策略名称" style="width: 150px;" class="filter-item" />
      <el-input v-model="listQuery.desc" placeholder="策略描述" style="width: 150px;" class="filter-item" />
      <el-select v-model="listQuery.type" clearable filterable placeholder="类型" class="filter-item">
        <el-option v-for="item in typeList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <!--<el-select v-model="listQuery.strategy" clearable filterable placeholder="执行策略" class="filter-item">
        <el-option v-for="item in strategyList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>-->
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
    <el-tabs v-model="strategyType" @tab-click="changeTabs">
      <el-tab-pane label="定时任务" name="1" />
      <el-tab-pane label="接口压测" name="2" />
    </el-tabs>
    <el-table
      v-if="showTable"
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
      <el-table-column v-if="strategyType === '1'" label="任务执行cron" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.jobCron }}</template>
      </el-table-column>
      <el-table-column v-if="strategyType === '2'" label="线程数" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.threadCount }}</template>
      </el-table-column>
      <el-table-column v-if="strategyType === '2'" label="压测方式" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.threadStrategyStr }}</template>
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
      <el-table-column v-if="strategyType === '1'" label="下次触发时间" align="center" width="120">
        <template slot-scope="scope">
          <el-popover placement="bottom" width="160" @show="nextTriggerTime(scope.row)">
            <h5 v-html="triggerNextTimes" style="text-align: center" />
            <el-button slot="reference" size="small">查看</el-button>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="最后执行状态" align="center" width="120">
        <template slot-scope="{row}"> {{ row.status | statusFilter }}</template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="scope">{{ scope.row.createUsername }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" fixed="right">
        <template slot-scope="{row}">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link" style="cursor: default">
              <span>操作</span>
              <i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="row.strategy === 1" @click.native="trigger(row, false)">执行一次</el-dropdown-item>
              <el-dropdown-item v-if="row.strategy === 2 && row.threadCount > 0" @click.native="trigger(row, true)">压测</el-dropdown-item>
              <el-dropdown-item v-if="row.strategy === 2 && row.status > 0" @click.native="queryResultData(row)">压测结果</el-dropdown-item>
              <el-dropdown-item v-if="row.type === 3" @click.native="runScript(row)">测试脚本</el-dropdown-item>
              <el-dropdown-item @click.native="toLogView(row)">查询日志</el-dropdown-item>
              <el-dropdown-item divided @click.native="handleUpdate(row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handleDelete(row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" top="8vh" width="1000px" :before-close="handleClose">
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
              <el-input-number v-model="temp.threadCount" :min="1" :max="1000" size="medium" />
            </el-form-item>
          </el-col>
          <el-col v-else :span="8">
            <el-dialog
              title="提示"
              :visible.sync="showCronBox"
              width="60%"
              append-to-body
            >
              <cron v-model="temp.jobCron" :year="false" />
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
              <el-input-number v-model="threadStrategy.timeInMillis" :min="1000" />
            </el-form-item>
          </el-col>
          <el-col v-else :span="8">
            <el-form-item label="执行多少次">
              <el-input-number v-model="threadStrategy.loopCount" :min="1" :max="9999999" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="并发间隔(ms)">
              <el-input-number v-model="threadStrategy.intervalInMillis" :min="-1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col v-if="temp.type === 2" :span="12">
            <el-form-item label="指定case" prop="caseIds">
              <el-select v-model="temp.caseIds" multiple clearable filterable placeholder="请选择" class="filter-item">
                <el-option v-for="item in testCaseList" :key="item.id" :label="item.caseName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户组" prop="userEnvType">
              <el-radio v-model="threadStrategy.userEnvType" :label="1">项目默认用户</el-radio>
              <el-radio v-model="threadStrategy.userEnvType" :label="2">自定义用户组</el-radio>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div v-if="threadStrategy.userEnvType === 2">
        <div style="color: #606266;font-size: 14px;margin-bottom: 15px;font-weight: bold;">
          <span>自定义用户组：</span>
          <i title="查看示例" class="el-icon-question" style="cursor: pointer" @click="showExample" />
        </div>
        <json-editor ref="jsonEditor" v-model="threadStrategy.userEnvMaps" />
      </div>
      <div v-if="temp.type === 3">
        <div style="color: #606266;font-size: 14px;margin-bottom: 15px;font-weight: bold;margin-top: 10px">自定义脚本：</div>
        <javascript-editor ref="scriptEditor" v-model="temp.script" />
      </div>
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
    <el-dialog title="压测结果" top="8vh" width="650px" :visible.sync="resultVisible" :close-on-click-modal="!resultLoading" :before-close="handleResultClose">
      <div v-if="resultLoading" style="text-align: center;">
        <img :src="loadingUrl" style="display: block;margin: auto;" />
        <div style="margin-top: -90px;line-height: 90px;font-size: 16px;">正在压测，请稍后...</div>
      </div>
      <div v-else>
        <el-form label-position="left" label-width="110px" style="width: 50%;margin: auto">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="并发数：">
                {{ pressureData.threadCount }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="总请求数：">
                {{ pressureData.reqCount }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="成功率：">
                {{ pressureData.sucRateBfb }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="总请求时长：">
                {{ pressureData.totalTime + ' ms' }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="平均请求时长：">
                {{ pressureData.avgTime + ' ms' }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="QPS(TPS)：">
                {{ pressureData.tps }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="评分：">
                <div style="height: 100%;vertical-align: middle;">
                  <el-rate v-model="pressureData.rate" disabled show-score text-color="#ff9900" score-template="{value}分" />
                </div>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="压测时间：">
                {{ pressureData.startTime + '~' + pressureData.endTime }}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-dialog>
    <example ref="example" />
    <script-execute ref="scriptExecute" />
  </div>
</template>

<script>
import { list } from '@/api/project'
import * as apiLog from '@/api/api-log'
import Pagination from '@/components/Pagination'
import Example from '@/components/Example'
import JsonEditor from '@/components/JsonEditor'
import JavascriptEditor from '@/components/JavascriptEditor'
import ScriptExecute from '@/components/ScriptExecute'
import waves from '@/directive/waves'
import Cron from '@/components/Cron'
import * as testCaseApi from '@/api/api-test-case'
import * as apiExecuteStrategy from '@/api/api-execute-strategy'

export default {
  name: 'Strategy',
  components: { Pagination, Example, JsonEditor, JavascriptEditor, ScriptExecute, Cron },
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
    },
    statusFilter(value) {
      const map = {
        1: '部分成功',
        2: '全部成功',
        3: '失败'
      }
      return map[value]
    }
  },
  data() {
    return {
      list: null,
      showTable: true,
      canUpdate: true,
      listLoading: true,
      total: 0,
      strategyType: '1',
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
      triggerNextTimes: '',
      pressureData: {},
      resultVisible: false,
      resultLoading: false,
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
        intervalInMillis: -1, // 并发间隔时间
        userEnvType: 1, // 用户环境类型：1 项目默认用户 2 自定义用户组
        userEnvMaps: [] // 用户环境变量
      },
      strategyTypeList: [
        { value: 1, label: '按时长' },
        { value: 2, label: '按次数' }
      ],
      visible: true,
      showCronBox: false,
      loadingUrl: require('@/assets/loading.gif')
    }
  },
  watch: {
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
      this.listQuery.strategy = +this.strategyType
      apiExecuteStrategy.listPage(this.listQuery).then(response => {
        const data = response.data || []
        if (data && data.length > 0) {
          for (const i in data) {
            let threadStrategyStr = ''
            if (data[i].strategy === 2 && data[i].threadStrategyJson) {
              try {
                const ts = JSON.parse(data[i].threadStrategyJson)
                if (ts && ts.type === 1) {
                  // 按时长
                  threadStrategyStr = ts.timeInMillis + ' ms'
                } else if (ts) {
                  // 按次数
                  threadStrategyStr = ts.loopCount + ' 次'
                }
              } catch (e) {
                threadStrategyStr = '配置错误'
              }
            }
            data[i].threadStrategyStr = threadStrategyStr
          }
        }
        this.total = response.total
        this.list = data
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
      this.$refs.scriptEditor && this.$refs.scriptEditor.reloadTips(this.temp.projectId)
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
        intervalInMillis: -1,
        userEnvType: 1,
        userEnvMaps: []
      }
    },
    changeTabs() {
      this.showTable = false
      this.$nextTick(() => {
        this.showTable = true
        this.listQuery.pageNo = 1
        this.listQuery.pageSize = 10
        this.fetchData()
      })
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
    async handleUpdate(row) {
      this.resetTemp()
      let tempData
      if (row.type === 2) {
        const { data } = await apiExecuteStrategy.queryStrategyById(row.id)
        tempData = data || row
      } else {
        tempData = Object.assign({}, row)
      }
      if (tempData.threadStrategyJson) {
        try {
          const threadStrategy = JSON.parse(tempData.threadStrategyJson || '{}')
          if (threadStrategy.type) {
            threadStrategy.type = parseInt(threadStrategy.type + '')
          } else {
            threadStrategy.type = 1
          }
          if (threadStrategy.loopCount) {
            threadStrategy.loopCount = parseInt(threadStrategy.loopCount + '')
          } else {
            threadStrategy.loopCount = null
          }
          if (threadStrategy.timeInMillis) {
            threadStrategy.timeInMillis = parseInt(threadStrategy.timeInMillis + '')
          } else {
            threadStrategy.timeInMillis = null
          }
          if (threadStrategy.intervalInMillis) {
            threadStrategy.intervalInMillis = parseInt(threadStrategy.intervalInMillis + '')
          } else {
            threadStrategy.intervalInMillis = -1
          }
          if (threadStrategy.userEnvType) {
            threadStrategy.userEnvType = parseInt(threadStrategy.userEnvType + '')
          } else {
            threadStrategy.userEnvType = 1
          }
          threadStrategy.userEnvMaps = threadStrategy.userEnvMaps || []
          this.threadStrategy = { ...threadStrategy }
        } catch (e) {
          console.log(e)
        }
      }
      this.temp = tempData
      this.loadTestCase()
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
      }).catch(() => {
        this.fetchData()
      })
    },
    updateData() {
      if (!this.canUpdate) {
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          if (this.threadStrategy &&
            this.threadStrategy.userEnvMaps &&
            (typeof this.threadStrategy.userEnvMaps) === 'string') {
            const str = this.threadStrategy.userEnvMaps.trim()
            if (!str.startsWith('[') || !str.endsWith(']')) {
              this.$message.error('用户组必须为JSON数组格式')
              return
            }
            this.threadStrategy.userEnvMaps = JSON.parse(str)
          }
          this.temp.threadStrategyJson = JSON.stringify(this.threadStrategy || '{}')
          this.canUpdate = false
          apiExecuteStrategy.update(this.temp).then(() => {
            this.canUpdate = true
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
    toLogView(row) {
      this.$router.push({
        name: 'Logs',
        query: {
          executeStrategyId: row.id
        }
      })
    },
    nextTriggerTime(obj) {
      apiExecuteStrategy.nextTriggerTime(obj.jobCron).then(response => {
        const { data } = response
        this.triggerNextTimes = data.join('<br>')
      })
    },
    runScript(obj) {
      this.$refs.scriptExecute.show(obj.projectId, obj.script || '')
    },
    trigger(row) {
      apiExecuteStrategy.runStrategy(row.id).then(response => {
        if (row.strategy === 2) {
          this.queryResultData(row, response.data)
        } else {
          this.$notify({
            title: 'Success',
            message: '触发成功',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleResultClose(done) {
      this.listLoading = false
      this.pressureData = {}
      done()
    },
    async queryResultData(row, refLogId) {
      try {
        if (refLogId) {
          this.resultLoading = true
        }
        this.resultVisible = true
        const { data } = await apiLog.pressureResult(row.id, refLogId)
        this.pressureData = data || {}
        if (refLogId) {
          if (data && Object.keys(data).length > 0) {
            this.resultLoading = false
            this.$notify({
              title: 'Success',
              message: '压测完成',
              type: 'success',
              duration: 2000
            })
          } else if (this.resultVisible) {
            setTimeout(() => {
              this.queryResultData(row, refLogId)
            }, 1000)
          }
        } else {
          this.resultLoading = false
        }
      } catch (e) {
        this.resultLoading = false
      }
    },
    showExample() {
      const text = '// 线程用户组是每个线程配置不同登录用户账号密码（变量）\n' +
        '// 数组，每一项表示一个线程用户，如果数组数量小于线程数则默认再从第一条开始取\n' +
        '// 格式最好保持跟项目配置的全局变量配置一致\n' +
        '\n' +
        '[\n' +
        '  { "username": "user1", "password": "123456" },\n' +
        '  { "username": "user2", "password": "123456" },\n' +
        '  { "username": "user3", "password": "123456" },\n' +
        '  { "username": "user4", "password": "123456" },\n' +
        '  { "username": "user5", "password": "123456" }\n' +
        ']'
      this.$refs.example.show('用户组变量配置示例', 'text', text)
    }
  }
}
</script>
