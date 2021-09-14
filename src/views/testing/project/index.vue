<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.name"
        clearable
        placeholder="项目名称"
        style="width: 200px;"
        class="filter-item"
      />
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
      <el-table-column label="项目名称" align="center">
        <template slot-scope="scope">{{ scope.row.name }}</template>
      </el-table-column>
      <el-table-column label="项目描述" align="center">
        <template slot-scope="scope">{{ scope.row.description }}</template>
      </el-table-column>
      <el-table-column label="创建用户" align="center">
        <template slot-scope="scope">{{ scope.row.createUsername }}
        </template>
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
      <el-table-column label="创建时间" width="200" align="center">
        <template slot-scope="scope">{{ scope.row.createTime }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            配置
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="400px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="100px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="temp.name" placeholder="项目名称" />
        </el-form-item>
        <el-form-item label="项目描述" prop="description">
          <el-input v-model="temp.description" placeholder="项目描述" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
    <el-dialog :visible.sync="dialogPluginVisible" title="Reading statistics">
      <el-table :data="pluginData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="Channel" />
        <el-table-column prop="pv" label="Pv" />
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">确认</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import * as projectApi from '@/api/project'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'Project',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        published: 'success',
        draft: 'gray',
        deleted: 'danger'
      }
      return statusMap[status]
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
        name: ''
      },
      pluginTypeOptions: ['reader', 'writer'],
      dialogPluginVisible: false,
      pluginData: [],
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑项目',
        create: '新增项目'
      },
      rules: {
        name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
        description: [{ required: true, message: '项目描述不能为空', trigger: 'blur' }]
      },
      temp: {
        id: undefined,
        name: '',
        description: ''
      },
      visible: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.canUpdate = true
      this.listLoading = true
      projectApi.listPage(this.listQuery).then(response => {
        this.total = response.total
        this.list = response.data
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        description: ''
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
      this.saveOrUpdate(this.temp, false)
    },
    handleUpdate(row) {
      // this.temp = Object.assign({}, row)
      // this.dialogStatus = 'update'
      // this.dialogFormVisible = true
      // this.$nextTick(() => {
      //   this.$refs['dataForm'].clearValidate()
      // })
      this.$router.push({
        name: 'ProjectConfig',
        params: {
          id: row.id
        }
      })
    },
    changeSwitch(row) {
      projectApi.update({ id: row.id, isAvailable: row.isAvailable }).then(() => {
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
    saveOrUpdate(obj, isUpdate) {
      if (!this.canUpdate) {
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.canUpdate = false
          projectApi[isUpdate ? 'update' : 'add'](obj).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: isUpdate ? '更新成功' : '创建成功',
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
        projectApi.deleted(row.id).then(response => {
          this.fetchData()
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    }
  }
}
</script>
