<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 头部的警告区域 -->
            <el-alert title="注意：只允许为第三级分类设置相关参数!" type="warning" :closable="false" show-icon></el-alert>

            <!-- 选择商品分类的区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类：</span>

                    <!-- 选择商品分类的级联选择框 -->
                    <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="handleChange" placeholder="请选择分类"></el-cascader>
                </el-col>
            </el-row>

            <!-- tab 页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的面板 -->
                <el-tab-pane label="动态参数" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="{row: manyParam}">
                                <el-row class="marginEdge">
                                    <!-- 循环渲染 tag 标签 -->
                                    <el-tag v-for="(item, index) in manyParam.attr_vals" :key="index" closable @close="handleTagClose(index, manyParam)">
                                        {{item}}
                                    </el-tag>
                                    <!-- 输入文本框 -->
                                    <el-input class="input-new-tag" v-if="manyParam.inputVisible" v-model="manyParam.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(manyParam)" @blur="handleInputConfirm(manyParam)">
                                    </el-input>
                                    <!-- 添加的按钮 -->
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(manyParam)">+ New Tag</el-button>
                                </el-row>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParamById(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 添加静态属性的面板 -->
                <el-tab-pane label="静态属性" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParamsDialog">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template v-slot="{row: onlyParam}">
                                <el-row class="marginEdge">
                                    <!-- 循环渲染 tag 标签 -->
                                    <el-tag v-for="(item, index) in onlyParam.attr_vals" :key="index" closable @close="handleTagClose(index, onlyParam)">
                                        {{item}}
                                    </el-tag>
                                    <!-- 输入文本框 -->
                                    <el-input class="input-new-tag" v-if="onlyParam.inputVisible" v-model="onlyParam.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(onlyParam)" @blur="handleInputConfirm(onlyParam)">
                                    </el-input>
                                    <!-- 添加的按钮 -->
                                    <el-button v-else class="button-new-tag" size="small" @click="showInput(onlyParam)">+ New Tag</el-button>
                                </el-row>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template v-slot="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParamById(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>
        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" width="50%" @close="addParamsDialogClosed" :close-on-click-modal="false">
            <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="editParamsDialogVisible" width="50%" @close="editParamsDialogClosed" :close-on-click-modal="false">
            <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormmRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editParamsForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置对象
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定到的数组
      selectedCateKeys: [],
      // tabs 被激活的页签名称
      activeName: 'many',
      // 请求回来的动态参数数据
      manyTableData: [],
      // 请求回来的静态属性数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addParamsDialogVisible: false,
      // 添加参数的对象
      addParamsForm: {
        attr_name: ''
      },
      // 添加表单的验证规则对象
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性名称', trigger: 'blur' }
        ]
      },
      // 控制修改对话框的显示与隐藏
      editParamsDialogVisible: false,
      // 修改参数的对象
      editParamsForm: {},
      // 修改参数的验证对象
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '请输入参数/属性名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    // 获取所有的商品分类列表
    this.getCateList()
  },
  methods: {
    // 获取所有的商品分类列表
    async getCateList () {
      const { data: response } = await this.$http.get('categories')
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.cateList = response.data
    },
    // 级联选择框选中变化，会触发这个函数
    handleChange () {
      this.getParamsList()
    },
    // tab 页签点击事件的处理函数
    handleTabClick () {
      this.getParamsList()
    },
    // 获取参数列表的方法
    async getParamsList () {
      // 如果选中的不是三级分类，将数组置空，中断执行
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }

      // 选中的是三级分类,发起网络请求获取分类数据
      const { data: response } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        { params: { sel: this.activeName } }
      )

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }

      // 在赋值前将数据整理一下
      response.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框中输入的值
        item.inputValue = ''
      })

      console.log(response.data)
      // 判断请求回来的数据是动态参数还是静态属性
      if (this.activeName === 'many') {
        this.manyTableData = response.data
      } else {
        this.onlyTableData = response.data
      }
    },
    showAddParamsDialog () {
      this.addParamsDialogVisible = true
    },
    // 监听添加对话框的退出事件
    addParamsDialogClosed () {
      this.addParamsForm = {}
      this.$refs.addParamsFormRef.resetFields()
    },
    // 点击按钮，添加参数
    addParams () {
      this.$refs.addParamsFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: response } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (response.meta.status !== 201) {
          return this.$message.error(response.meta.msg)
        }
        this.$message.success(response.meta.msg)
        this.getParamsList()
        this.addParamsDialogVisible = false
      })
    },
    // 点击按钮，显示修改参数的对话框
    async showEditParamsDialog (attrId) {
      // 先获取到要修改的参数对象
      const { data: response } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        { params: { attr_sel: this.activeName } }
      )
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.editParamsForm = response.data
      this.editParamsDialogVisible = true
    },
    // 修改对话框退出时的回调函数
    editParamsDialogClosed () {
      this.editParamsForm = {}
      this.$refs.editParamsFormmRef.resetFields()
    },
    // 点击按钮，发送请求，修改参数
    editParams () {
      // 验证表单项，验证通过发起网络请求提交修改
      this.$refs.editParamsFormmRef.validate(async (valid) => {
        if (!valid) return
        // 发起网络请求提交修改
        const { data: response } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (response.meta.status !== 200) {
          return this.$message.error(response.meta.msg)
        }
        this.$message.success(response.meta.msg)
        this.editParamsDialogVisible = false
        this.getParamsList()
      })
    },
    // 通过指定 id 删除对应的参数
    async removeParamById (attrId) {
      const confirResult = await this.$confirm(
        '此操作将永久删除该参数，是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirResult !== 'confirm') {
        return this.$message.info('取消了删除操作!')
      }

      // 发起删除请求
      const { data: response } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrId}`
      )

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.$message.success(response.meta.msg)
      this.getParamsList()
    },
    // 文本框失去焦点或按下了 enter 都会触发这个函数
    async handleInputConfirm (param) {
      if (param.inputValue.trim().length === 0) {
        param.inputValue = ''
        param.inputVisible = false
        return
      }

      // 用户输入了内容，发起请求，添加参数
      param.attr_vals.push(param.inputValue.trim())
      // 发起网络请求，保存参数值
      this.saveAttrValues(param)
    },
    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrValues (param) {
      // 发起网络请求，保存本次操作
      const { data: response } = await this.$http.put(
        `categories/${this.cateId}/attributes/${param.attr_id}`,
        {
          attr_name: param.attr_name,
          attr_sel: param.attr_sel,
          attr_vals: param.attr_vals.join(' ')
        }
      )
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }

      this.$message.success(response.meta.msg)
      param.inputValue = ''
      param.inputVisible = false
    },
    // 点击按钮展示文本输入框
    showInput (param) {
      param.inputVisible = true

      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 标签删除时调用的函数
    handleTagClose (index, param) {
      // 本地删除操作
      param.attr_vals.splice(index, 1)
      // 保存到数据库
      this.saveAttrValues(param)
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回 true，否则返回 false
    isBtnDisabled () {
      return this.selectedCateKeys.length !== 3
    },
    // 当前选中的三级分类的 id
    cateId () {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }

      return null
    },
    // 添加参数对话框中的标题
    titleText () {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.marginEdge {
  margin-left: 40px;
}
.input-new-tag {
  width: 100px;
}
</style>