<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="fetchData">
        刷新
      </el-button>
    </div>
    <div class="container">
      <p><span class="fr">更新时间：{{ data.updateTime }}</span></p>
      <div :class="'chart1 fl'" style="width: 30%;height: 300px" />
      <div :class="'chart2 fl'" style="width: 30%;height: 300px" />
      <div :class="'chart3 fl'" style="width: 30%;height: 300px" />
    </div>
  </div>
</template>

<script>
import { serverInfo } from '@/api/public'
import waves from '@/directive/waves' // waves directive

export default {
  name: 'Resource',
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
      data: {},
      internal: null,
      dialogPluginVisible: false
    }
  },
  created() {
  },
  mounted() {
    this.fetchData()
    this.internal = setInterval(() => {
      this.fetchData()
    }, 1000)
    this.$once('hook:beforeDestroy', () => {
      clearInterval(this.internal)
    })
  },
  methods: {
    fetchData() {
      serverInfo().then(response => {
        this.data = response.data || {}
        try {
          this.initEcharts(response.data)
        } catch (e) {
          // clearInterval(this.internal)
        }
      })
    },
    initEcharts(data) {
      const myChart1 = this.$echarts.init(document.getElementsByClassName('chart1')[0])
      // 绘制图表
      var option1 = {
        title: {
          text: 'CPU使用率',
          subtext: '',
          x: 'center'
        },
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          },
          show: false
        },
        series: [{
          name: 'CPU使用率',
          type: 'gauge',
          max: 100,
          radius: '70%', // 半径
          startAngle: 215, // 起始位置
          endAngle: -35, // 终点位置
          detail: {
            formatter: '{value}%'
          },
          data: [{
            value: data.cpuUsage,
            name: ''
          }]
        }]
      }
      myChart1.setOption(option1)

      const myChart2 = this.$echarts.init(document.getElementsByClassName('chart2')[0])
      // 绘制图表
      var option2 = {
        title: {
          text: '内存使用率',
          subtext: '',
          x: 'center'
        },
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          },
          show: false
        },
        series: [{
          name: '内存使用率',
          type: 'gauge',
          max: 100,
          radius: '70%', // 半径
          startAngle: 215, // 起始位置
          endAngle: -35, // 终点位置
          detail: {
            formatter: '{value}%'
          },
          data: [{
            value: data.memoryUsage,
            name: ''
          }]
        }]
      }
      myChart2.setOption(option2)

      const myChart3 = this.$echarts.init(document.getElementsByClassName('chart3')[0])
      // 绘制图表
      var option3 = {
        title: {
          text: 'JVM内存使用率',
          subtext: '',
          x: 'center'
        },
        tooltip: {
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          feature: {
            restore: {},
            saveAsImage: {}
          },
          show: false
        },
        series: [{
          name: 'JVM内存使用率',
          type: 'gauge',
          max: 100,
          radius: '70%', // 半径
          startAngle: 215, // 起始位置
          endAngle: -35, // 终点位置
          detail: {
            formatter: '{value}%'
          },
          data: [{
            value: data.jvmUsage,
            name: ''
          }]
        }]
      }
      myChart3.setOption(option3)
    }
  }
}
</script>
<style lang="scss" scope>
  .container{
    overflow: hidden;
    p{
      font-size: 14px;color: #666;padding: 10px 0;
      .fl{
        float: left;
      }
      .fr{
        float: right;
      }
    }
    .loadAverage{
      p{
        text-align: center;
      }
      .title{
        font-size: 18px;font-weight: bold;color: #333;padding: 5px 0;margin: 0;
      }
      .number{
        font-size: 50px;color: #3d90d0
      }
    }
  }
</style>
