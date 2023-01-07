<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-input placeholder="请输入内容">
                        <el-button slot="append" icon="el-icon-search"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 订单列表数据区域 -->
            <el-table :data="orderList" border stripe>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="订单编号" prop="order_number"></el-table-column>
                <el-table-column label="订单价格(元)" prop="order_price"></el-table-column>
                <el-table-column label="是否付款">
                    <template v-slot="{row: order}">
                        <el-tag type="danger" v-if="order.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send"></el-table-column>
                <el-table-column label="下单时间">
                    <template v-slot="{row: order}">
                        {{order.create_time | dateFormatter}}
                    </template>
                </el-table-column>
                <el-table-column label="操作">
                    <!-- v-slot="{row: order}" 此处具体操作需要作用域插槽 -->
                    <template>
                        <el-tooltip content="修改地址" placement="top" effect="dark" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditAddressDialog"></el-button>
                        </el-tooltip>
                        <el-tooltip content="物流信息" placement="top" effect="dark" :enterable="false">
                            <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[10, 15, 20]" :page-size="10" layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 修改地址对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressDialogVisible" width="50%" :close-on-click-modal="false" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="citydata" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 展示物流进度的对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
            <!-- 时间线 -->
            <el-timeline>
                <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
                    {{activity.context}}
                </el-timeline-item>
            </el-timeline>
        </el-dialog>
    </div>
</template>

<script>
import citydata from './citydata.js'
export default {
  data () {
    return {
      // 数据查询对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单数据列表
      orderList: [],
      // 订单总数
      total: 0,
      addressDialogVisible: false,
      // 地址信息表单数据
      addressForm: {
        address1: [],
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trigger: 'blur' }
        ]
      },
      citydata,
      progressVisible: false,
      progressInfo: []
    }
  },
  created () {
    this.getOrderList()
  },
  methods: {
    // 获取订单列表
    async getOrderList () {
      const { data: response } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.orderList = response.data.goods
      this.total = response.data.total
    },
    // pagesize 发生改变的回调
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // pagenum 发生改变的回调
    handleCurrentChange (newNum) {
      this.queryInfo.pagenum = newNum
      this.getOrderList()
    },
    // 显示修改地址的对话框
    showEditAddressDialog () {
      this.addressDialogVisible = true
    },
    // 修改地址对话框退出后的回调
    addressDialogClosed () {
      this.$refs.addressFormRef.resetFields()
    },
    // 显示物流状态盒子
    async showProgressBox () {
      const { data: response } = await this.$http.get('/kuaidi/1106975712662')
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.progressInfo = response.data
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>