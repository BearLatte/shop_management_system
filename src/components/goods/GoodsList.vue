<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="20">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList" @blur="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddPage">添加商品</el-button>
                </el-col>
            </el-row>

            <!-- table 表格区域 -->
            <el-table :data="goodsListData" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
                <el-table-column label="创建时间" width="140px">
                    <template v-slot="{row: goods}">
                        {{goods.add_time | dateFormatter}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120px">
                    <template v-slot="{row: goods}">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="go2EditGoosById(goods.goods_id)"></el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(goods.goods_id)"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页元素区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total" background>
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 查询到的商品列表数据
      goodsListData: [],
      // 商品数据列表总数量
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 根据分页获取对应的商品列表
    async getGoodsList () {
      const { data: response } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.goodsListData = response.data.goods
      this.total = response.data.total
    },
    // 分页控件数值改变回调
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    // 页码值发生变化时的回调
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getGoodsList()
    },
    // 根据商品 id 删除指定的商品
    async removeGoodsById (goodsId) {
      const confirmResult = await this.$confirm('此操作将永久删除选中的商品，是否继续？', '提示', {
        closeOnClickModal: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作!')
      }

      // 发起网络请求，将删除操作提交到数据库
      const { data: response } = await this.$http.delete('goods/' + goodsId)
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.$message.success(response.meta.msg)
      this.getGoodsList()
    },
    // 通过编程式导航跳转到添加商品页面
    goAddPage () {
      this.$router.push('goods/add')
    },
    // 根据商品 id 编辑商品信息
    go2EditGoosById (goodsId) {
      this.$router.push(`/goods/edit/${goodsId}`)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
