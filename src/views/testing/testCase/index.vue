<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.caseName" placeholder="用例名称" style="width: 150px;" class="filter-item" />
      <el-input v-model="listQuery.caseDesc" placeholder="用例描述" style="width: 150px;" class="filter-item" />
      <el-input v-model="listQuery.module" placeholder="模块" style="width: 120px;" class="filter-item" />
      <el-input v-model="listQuery.author" placeholder="作者" style="width: 120px;" class="filter-item" />
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
      <el-table-column label="用例名称" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.caseName }}</template>
      </el-table-column>
      <el-table-column label="用例描述" align="center" width="150px">
        <template slot-scope="scope">{{ scope.row.caseDesc }}</template>
      </el-table-column>
      <el-table-column label="模块" align="center">
        <template slot-scope="scope">{{ scope.row.module }}</template>
      </el-table-column>
      <el-table-column label="作者" align="center">
        <template slot-scope="scope">{{ scope.row.author }}</template>
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
    <script-execute ref="scriptExecute" />
  </div>
</template>

<script>
import { list } from '@/api/project'
import * as testCaseApi from '@/api/api-test-case'
import Pagination from '@/components/Pagination'
import ScriptExecute from '@/components/ScriptExecute'
import waves from '@/directive/waves'

export default {
  name: 'TestCase',
  components: { Pagination, ScriptExecute },
  directives: { waves },
  filters: {
  },
  data() {
    return {
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        pageNo: 1,
        pageSize: 10,
        projectId: null,
        caseName: '',
        caseDesc: '',
        module: '',
        author: ''
      },
      projectList: []
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
      this.listLoading = true
      testCaseApi.listPage(this.listQuery).then(response => {
        this.total = response.total
        this.list = response.data
        this.listLoading = false
      })
    },
    handleCreate() {
      this.$router.push({
        name: 'TestCaseConfig',
        params: {
          id: 0
        }
      })
    },
    handleUpdate(row) {
      this.$router.push({
        name: 'TestCaseConfig',
        params: {
          id: row.id
        }
      })
    },
    changeSwitch(row) {
      testCaseApi.update({ id: row.id, isAvailable: row.isAvailable }).then(() => {
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
      const tempData = Object.assign({}, this.temp)
      this.saveOrUpdate(tempData, true)
    },
    handleDelete(row) {
      this.$confirm('确定删除吗？').then(() => {
        testCaseApi.deleted(row.id).then(response => {
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
    runScript(obj) {
      this.$refs.scriptExecute.show(obj.projectId, obj.script || '')
    }
  }
}
</script>
