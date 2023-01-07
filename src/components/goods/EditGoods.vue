<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品编辑</el-breadcrumb-item>
        </el-breadcrumb>
        <el-card>
          111111
        </el-card>
    </div>
</template>

<script>
export default {
  props: ['goodsId'],
  data () {
    return {}
  },
  created () {
    console.log(this.goodsId)
  },
  methods: {}
}
</script>

<style lang="less" scoped>
</style>