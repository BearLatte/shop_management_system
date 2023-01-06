<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 添加分类按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>

            <!-- 表格区域 -->
            <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" :show-index="true" index-text="#" border :show-row-hover="false" class="treeTable">
                <!-- 是否有效模板 -->
                <template v-slot:isOk="isOk">
                    <i class="el-icon-success" v-if="isOk.row.cat_deleted === false" style="color: lightgreen"></i>
                    <i class="el-icon-error" v-else style="color: red"></i>
                </template>

                <!-- 排序模板 -->
                <template v-slot:order="order">
                    <el-tag type="success" size="mini" v-if="order.row.cat_level === 0">一级</el-tag>
                    <el-tag type="warning" size="mini" v-else-if="order.row.cat_level === 1">二级</el-tag>
                    <el-tag type="danger" size="mini" v-else>三级</el-tag>
                </template>

                <!-- 操作模板 -->
                <template v-slot:opt="opt">
                    <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(opt.row.cat_id)">编辑</el-button>
                    <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(opt.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 20, 50]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" :close-on-click-modal="false" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
                <el-form-item label="分类名称:" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类:">
                    <!-- options 用来绑定数据源, props 用来指定配置对象 -->
                    <el-cascader :props="cascaderProps" v-model="selectedKeys" :options="parentCateList" @change="parentCateChanged" placeholder="请选择父类" clearable></el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑分类的对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" :close-on-click-modal="false">
            <el-form :model="editCate" :rules="editCateRules" ref="editCateRef" label-width="100px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="editCate.cat_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editCateAction">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
  data () {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类的数据列表，默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为 table 指定指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          // 表示，将当前列定义为模板
          type: 'template',
          // 指定当前这一列使用哪个模板
          template: 'isOk'
        },
        {
          label: '排序',
          // 表示，将当前列定义为模板
          type: 'template',
          // 指定当前这一列使用哪个模板
          template: 'order'
        },
        {
          label: '操作',
          // 表示，将当前列定义为模板
          type: 'template',
          // 指定当前这一列使用哪个模板
          template: 'opt'
        }
      ],
      // 添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类的 id
        cat_pid: 0,
        // 分类的等级，默认要添加的是 1 级分类
        cat_level: 0
      },
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称!',
            trigger: 'blur'
          }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true, // 支持选中父类
        expandTrigger: 'hover', // 指定次级菜单的展开方式
        value: 'cat_id', // 指定选中值的属性
        label: 'cat_name', // 指定选中值的可视属性
        children: 'children' // 指定当前选择项的子项
      },
      // 选中的父级分类的 id 数组
      selectedKeys: [],
      // 选中将要编辑的分类
      editCate: {},
      // 控制编辑分类对话框的显示与隐藏
      editCateDialogVisible: false,
      editCateRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created () {
    this.getGoodsCateList()
  },
  methods: {
    // 获取商品分类的数据
    async getGoodsCateList () {
      const { data: response } = await this.$http.get('categories', {
        params: this.queryInfo
      })

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      // 为总数据条数赋值
      this.total = response.data.total
      // 为所有数据列表赋值
      this.cateList = response.data.result
    },
    // 分页 pagesize 改变的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsCateList()
    },
    // 监听 pagenum 改变的事件
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsCateList()
    },
    // 显示添加分类的对话框
    showAddCateDialog () {
      // 先获取到父级分类的数据
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表
    async getParentCateList () {
      const { data: response } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }

      this.parentCateList = response.data
    },
    // 级联选择项发生改变触发这个函数
    parentCateChanged () {
      // 如果 selectedKeys 数组中的 length 大于 0，证明选中了父级分类
      // 反之就说明没有选中父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的 id
        this.addCateForm.cat_pid =
                    this.selectedKeys[this.selectedKeys.length - 1]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮，添加新的分类
    addCate () {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: response } = await this.$http.post(
          'categories',
          this.addCateForm
        )

        if (response.meta.status !== 201) {
          return this.$message.error(response.meta.msg)
        }
        this.$message.success(response.meta.msg)
        this.getGoodsCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听添加分类表单退出时的事件
    addCateDialogClosed () {
      this.selectedKeys = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
      this.$refs.addCateFormRef.resetFields()
    },
    // 根据 id 删除特定的分类
    async removeCateById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作!')
      }

      // 发起网络请求
      const { data: response } = await this.$http.delete(
        'categories/' + id
      )
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.$message.success(response.meta.msg)
      this.getGoodsCateList()
    },
    // 显示编辑对话框的事件监听
    async showEditCateDialog (id) {
      const { data: response } = await this.$http.get('categories/' + id)
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.editCate = response.data
      this.editCateDialogVisible = true
    },
    // 编辑分类事件
    editCateAction () {
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) return
        const { data: response } = await this.$http.put(
          'categories/' + this.editCate.cat_id,
          {
            cat_name: this.editCate.cat_name
          }
        )

        if (response.meta.status !== 200) {
          return this.$message.error(response.meta.msg)
        }
        this.$message.success(response.meta.msg)
        this.getGoodsCateList()
        this.editCateDialogVisible = false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>