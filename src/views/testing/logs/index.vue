<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.msg" placeholder="日志内容" style="width: 200px" class="filter-item" />
      <el-input v-model="listQuery.url" placeholder="URL" style="width: 200px" class="filter-item" />
      <el-select v-model="listQuery.status" clearable placeholder="运行状态" style="width: 200px" class="filter-item">
        <el-option v-for="item in statusList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.refId" clearable placeholder="日志类型" style="width: 200px" class="filter-item">
        <el-option v-for="item in refTypeList" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.projectId" clearable filterable placeholder="所属项目" class="filter-item">
        <el-option v-for="item in projectList" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">
        搜索
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
      <el-table-column align="center" label="项目名称">
        <template slot-scope="scope">{{ scope.row.projectName }}</template>
      </el-table-column>
      <el-table-column align="center" label="请求URL" width="300px">
        <template slot-scope="scope">{{ scope.row.url }}</template>
      </el-table-column>
      <el-table-column align="center" label="接口耗时">
        <template slot-scope="scope">{{ (scope.row.time || 0) + ' ms' }}</template>
      </el-table-column>
      <el-table-column label="执行状态" align="center" width="100">
        <template slot-scope="scope"> <span :style="`color:${ scope.row.status === 3 ? 'red' : '' }`">{{ scope.row.status | statusFilter }}</span></template>
      </el-table-column>
      <el-table-column align="center" label="策略名称">
        <template slot-scope="scope">{{ scope.row.executeStrategyName }}</template>
      </el-table-column>
      <el-table-column align="center" label="用例名称">
        <template slot-scope="scope">{{ scope.row.testCaseName }}</template>
      </el-table-column>
      <el-table-column align="center" label="Api命名">
        <template slot-scope="scope">{{ scope.row.apiName }}</template>
      </el-table-column>
      <el-table-column align="center" label="接口描述">
        <template slot-scope="scope">{{ scope.row.apiDesc }}</template>
      </el-table-column>
      <el-table-column align="center" label="执行耗时">
        <template slot-scope="scope">{{ (scope.row.execTime || 0) + ' ms' }}</template>
      </el-table-column>
      <el-table-column label="执行时间" align="center">
        <template slot-scope="scope">{{ scope.row.createTime }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleViewJobLog(row)">日志查看</el-button>
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
    <el-dialog title="日志查看" :visible.sync="dialogVisible" width="85%">
      <div class="log-container">
        <pre :loading="logLoading" v-text="logContent" />
      </div>
      <!--<div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="loadLog">
          刷新日志
        </el-button>
      </div>-->
    </el-dialog>

  </div>

</template>

<script>
import * as apiLog from '@/api/api-log'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'Logs',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: '执行中',
        2: '执行成功',
        3: '执行失败'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      dialogVisible: false,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        projectId: null,
        msg: '',
        url: '',
        refId: null,
        status: null,
        executeStrategyId: null
      },
      projectList: [],
      statusList: [
        { value: 1, label: '执行中' },
        { value: 2, label: '执行成功' },
        { value: 3, label: '执行失败' }
      ],
      refTypeList: [
        { value: '0', label: '策略' }
      ],
      logContent: '',
      logLoading: false
    }
  },
  created() {
    this.init()
  },

  methods: {
    init() {
      this.fetchData()
    },
    fetchData() {
      this.listLoading = true
      const param = Object.assign({}, this.listQuery)
      const executeStrategyId = this.$route.query.executeStrategyId
      if (executeStrategyId) {
        param.executeStrategyId = executeStrategyId
      }
      apiLog.listPage(param).then(response => {
        this.total = response.total
        this.list = response.data
        this.listLoading = false
      })
    },
    // 查看日志
    handleViewJobLog(row) {
      this.dialogVisible = true
      this.logContent = row.msg
      this.logLoading = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .log-container {
    margin-bottom: 20px;
    background: #f5f5f5;
    width: 100%;
    height: 400px;
    overflow: scroll;
    pre {
      display: block;
      padding: 10px;
      margin: 0 0 10.5px;
      word-break: break-all;
      word-wrap: break-word;
      color: #334851;
      background-color: #f5f5f5;
      // border: 1px solid #ccd1d3;
      border-radius: 1px;
    }
  }
</style>
