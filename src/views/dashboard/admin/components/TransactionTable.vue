<template>
  <el-table :data="list" style="width: 100%;padding-top: 15px;">
    <el-table-column label="项目">
      <template slot-scope="scope">
        {{ scope.row.projectName }}
      </template>
    </el-table-column>
    <el-table-column label="URL" min-width="200">
      <template slot-scope="scope">
        <span style="color: #198fff">{{ scope.row.url }}</span>
      </template>
    </el-table-column>
    <el-table-column label="响应时间" align="center">
      <template slot-scope="scope">
        <span :style="{ color: timeColor(scope.row.time) }">{{ scope.row.time }} ms</span>
      </template>
    </el-table-column>
    <el-table-column label="执行策略" align="center">
      <template slot-scope="scope">
        {{ scope.row.executeStrategyName }}
      </template>
    </el-table-column>
    <el-table-column label="测试用例" align="center">
      <template slot-scope="scope">
        {{ scope.row.testCaseName }}
      </template>
    </el-table-column>
    <el-table-column label="接口描述" align="center">
      <template slot-scope="scope">
        {{ scope.row.apiDesc }}
      </template>
    </el-table-column>
    <el-table-column label="请求时间" width="160" align="center">
      <template slot-scope="scope">
        {{ scope.row.createTime }}
      </template>
    </el-table-column>
    <el-table-column label="状态" align="center">
      <template slot-scope="scope">
        <el-tag :type="scope.row.status | statusFilter">
          {{ scope.row.status | statusStrFilter }}
        </el-tag>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import * as dashborad from '@/api/dashborad'

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        1: 'info',
        2: 'success',
        3: 'danger'
      }
      return statusMap[status]
    },
    statusStrFilter(status) {
      const statusMap = {
        1: '执行中',
        2: '成功',
        3: '失败'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      dashborad.listRanking().then(response => {
        this.list = response.data || []
      })
    },
    timeColor(time) {
      if (time > 1000) {
        return '#ed1941'
      } else if (time > 500) {
        return '#973c3f'
      } else if (time > 200) {
        return '#cd9a5b'
      } else {
        return '#1d953f'
      }
    }
  }
}
</script>
