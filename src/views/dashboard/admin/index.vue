<template>
  <div class="dashboard-editor-container">
    <!--<github-corner class="github-corner" />-->

    <panel-group @handleSetLineChartData="handleSetLineChartData" />

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:15px;">
      <line-chart :chart-data="lineChartData" />
    </el-row>

    <el-row>
      <transaction-table />
    </el-row>

  </div>
</template>

<script>
// import GithubCorner from '@/components/GithubCorner'
import PanelGroup from './components/PanelGroup'
import LineChart from './components/LineChart'
import TransactionTable from './components/TransactionTable'
import * as dashborad from '@/api/dashborad'

const lineChartData = {
  chartInfo: {
    failData: [],
    successData: [],
    dayList: []
  }
}

export default {
  name: 'DashboardAdmin',
  components: {
    // GithubCorner,
    PanelGroup,
    LineChart,
    TransactionTable
  },
  data() {
    return {
      lineChartData: lineChartData.chartInfo
    }
  },
  created() {
    this.chartInfo()
  },
  methods: {
    handleSetLineChartData(type) {
      this.lineChartData = lineChartData[type]
    },
    chartInfo() {
      dashborad.chartInfo().then(response => {
        const { data } = response
        this.lineChartData.successData = data.dayCountSucList
        this.lineChartData.failData = data.dayCountFailList
        this.lineChartData.dayList = data.dayList
        localStorage.setItem('countSucTotal', data.countSucTotal)
        localStorage.setItem('countRunningTotal', data.countRunningTotal)
        localStorage.setItem('countFailTotal', data.countFailTotal)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
