<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>数据统计</el-breadcrumb-item>
            <el-breadcrumb-item>数据报表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片区域 -->
        <el-card>
            <!-- 为 ECharts 准备一个定义了宽高的 DOM -->
            <div id="main" style="width: 600px;height:400px;"></div>
        </el-card>
    </div>
</template>

<script>
// 导入图标组件
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data () {
    return {
      // 需要合并的数据
      echartsOption: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created () {},
  // 只要调用了 mouted 这个函数，就表示页面 DOM 元素已经初始化完毕了
  async mounted () {
    // 基于准备好的dom，初始化echarts实例
    const myChart = echarts.init(document.getElementById('main'))

    // 获取报表数据
    const { data: response } = await this.$http.get('reports/type/1')

    if (response.meta.status !== 200) {
      return this.$message.error(response.meta.msg)
    }

    // 准备数据和配置型
    const result = _.merge(response.data, this.echartsOption)

    // 展示数据
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>
