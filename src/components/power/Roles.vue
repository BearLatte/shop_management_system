<template>
    <div>
        <!-- 顶部面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 角色列表区域 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template v-slot="scope">
                        <el-row :class="[i1 === 0 ? '' : 'bdtop', 'vcenter', 'pd40']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">
                                    {{ item1.authName }}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过 for 循环 嵌套渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                                            {{ item2.authName }}
                                        </el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="(item3) in item2.children" :key="item3.id" type="warning" closable @close="removeRightById(scope.row, item3.id)">
                                            {{ item3.authName }}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>

                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="角色名称" prop="roleName"></el-table-column>
                <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
                <el-table-column label="操作" width="300px">
                    <template v-slot="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
                            编辑
                        </el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">
                            删除
                        </el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(scope.row)">
                            分配权限
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" :close-on-click-modal="false" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys" ref="treeRef">
            </el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights"> 确 定 </el-button>
            </span>
        </el-dialog>

        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%" :close-on-click-modal="false" @close="addRoleDialogClosed">
            <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addRoleForm.roleName" placeholder="请输入角色名称">
                    </el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc" placeholder="请输入角色描述">
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRoleAction"> 确 定 </el-button>
            </span>
        </el-dialog>

        <!-- 编辑角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="editRoleDialogVisible" width="50%" :close-on-click-modal="false" @close="editDialogClosed">
            <el-form :model="editRoleForm" :rules="addRoleFormRules" ref="editRoleRef" label-width="80px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editRoleForm.roleName" placeholder="请输入角色名称">
                    </el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc" placeholder="请输入角色描述">
                    </el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRoleAction"> 确 定 </el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
  data () {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点 id 值数组
      defKeys: [],
      // 当前即将分配权限的 id
      roleId: '',
      // 添加角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 记录要添加的角色对象
      addRoleForm: {},
      addRoleFormRules: {
        roleName: [
          {
            required: true,
            message: '请输入角色名称!',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '角色名称在 3~10 位字符!',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请输入角色描述!',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 25,
            message: '角色描述应在 3~25 个字符之间!',
            trigger: 'blur'
          }
        ]
      },
      // 编辑角色对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 记录要编辑的角色表单数据
      editRoleForm: {}
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList () {
      const { data: response } = await this.$http.get('roles')
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }

      this.rolesList = response.data
    },
    // 根据 id 删除对应的权限
    async removeRightById (role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        '是否删除当前选中权限？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了当前删除操作!')
      }

      const { data: response } = await this.$http.delete(
                `roles/${role.id}/rights/${rightId}`
      )

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }

      this.$message.success(response.meta.msg)
      role.children = response.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog (role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const { data: response } = await this.$http.get('rights/tree')
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.rightsList = response.data
      // 递归获取三级节点的 id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到 data 中对应的数组中
    getLeafKeys (node, arr) {
      // 如果当前 node 节点不包含 children 属性，它就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }

      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配旋前对话框关闭的事件，用于清空选中状态的数组
    setRightDialogClosed () {
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights () {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: response } = await this.$http.post(
                `roles/${this.roleId}/rights`,
                { rids: idStr }
      )

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.setRightDialogVisible = false
      this.$message.success(response.meta.msg)
      this.getRolesList()
    },
    // 在添加对话框隐藏的时候清空数据
    addRoleDialogClosed () {
      this.$refs.addRoleRef.resetFields()
    },
    // 添加角色网络请求
    addRoleAction () {
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) return

        const { data: response } = await this.$http.post(
          'roles',
          this.addRoleForm
        )

        if (response.meta.status !== 201) {
          return this.$message.error(response.meta.msg)
        }

        this.$message.success(response.meta.msg)
        this.addRoleDialogVisible = false
        this.getRolesList()
      })
    },
    // 监听删除按钮的事件
    async removeRoleById (id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除角色，是否确定?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除操作!')
      }

      // 发起删除的网络请求
      const { data: response } = await this.$http.delete('roles/' + id)

      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }

      this.$message.success(response.meta.msg)
      this.getRolesList()
    },
    // 显示编辑对话框时获取数据
    async showEditDialog (id) {
      // 根据 id 获取当前角色
      const { data: response } = await this.$http.get('roles/' + id)
      if (response.meta.status !== 200) {
        return this.$message.error(response.meta.msg)
      }
      this.editRoleForm = response.data
      this.editRoleDialogVisible = true
    },
    // 编辑对话框退出时清空数据
    editDialogClosed () {
      this.$refs.editRoleRef.resetFields()
    },
    // 编辑角色
    editRoleAction () {
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) return

        // 发起网络请求修改角色
        const { data: response } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )

        if (response.meta.status !== 200) {
          return this.$message.error(response.meta.msg)
        }
        this.$message.success('编辑角色成功!')
        this.editRoleDialogVisible = false
        this.getRolesList()
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.pd40 {
  padding-left: 40px;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>