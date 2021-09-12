<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.key" placeholder="key" style="width: 200px;" class="filter-item" />
      <el-input v-model="listQuery.value" placeholder="value" style="width: 200px;" class="filter-item" />
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
      <el-table-column align="center" label="key">
        <template slot-scope="scope">{{ scope.row.key }}</template>
      </el-table-column>
      <el-table-column label="value" align="center">
        <template slot-scope="scope">{{ scope.row.value }}</template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="{row}">
          <el-dropdown trigger="click">
            <span class="el-dropdown-link">
              操作<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item divided @click.native="handlerUpdate(row)">编辑</el-dropdown-item>
              <el-dropdown-item @click.native="handlerDelete(row)">删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.current" :limit.sync="listQuery.size" @pagination="fetchData" />

    <el-dialog :title="title" :visible.sync="dialogFormVisible" width="1000px" :before-close="handleClose">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="key" prop="key">
              <el-input v-model="temp.key" :disabled="isEdit" size="medium" placeholder="请输入变量名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="value" prop="value">
              <el-input v-model="temp.value" size="medium" placeholder="请输入变量值" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="addOrUpdate()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as sysVar from '@/api/datax-sys-var'
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
export default {
  name: 'SysVar',
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
      isEdit: false,
      list: null,
      listLoading: true,
      total: 0,
      listQuery: {
        current: 1,
        size: 10,
        key: '',
        value: ''
      },
      pluginData: [],
      dialogFormVisible: false,
      title: '新增变量',
      rules: {
        key: [{ required: true, message: 'key is required', trigger: 'blur' }],
        value: [{ required: true, message: 'value is required', trigger: 'blur' }]
      },
      temp: {
        id: undefined,
        key: '',
        value: ''
      },
      resetTemp() {
        this.temp = {
          id: undefined,
          key: '',
          value: ''
        }
      }
    }
  },
  created() {
    this.fetchData()
  },

  methods: {
    handleClose(done) {
      // this.$confirm('确认关闭？')
      //   .then(_ => {
      //     done()
      //   })
      //   .catch(_ => {})
      done()
    },
    fetchData() {
      this.listLoading = true
      sysVar.getList(this.listQuery).then(response => {
        this.total = response.total
        this.list = response.data
        this.listLoading = false
      })
    },
    handleCreate() {
      this.resetTemp()
      this.title = '新增变量'
      this.isEdit = false
      this.dialogFormVisible = true
    },
    handlerUpdate(row) {
      this.resetTemp()
      this.title = '修改变量'
      this.temp = Object.assign({}, row)
      this.isEdit = true
      this.dialogFormVisible = true
    },
    addOrUpdate() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          sysVar.addOrUpdate(this.temp).then(() => {
            this.fetchData()
            this.dialogFormVisible = false
            this.$notify({
              title: 'Success',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handlerDelete(row) {
      this.$confirm('确定删除吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        sysVar.removeVar(row.id).then(response => {
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

<style>
  .el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
  }
  .el-dropdown + .el-dropdown {
    margin-left: 15px;
  }
</style>
