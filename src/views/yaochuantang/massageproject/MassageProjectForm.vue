<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="项目 logo" prop="logo">
            <UploadImg v-model="formData.logo" :limit="1" :is-show-tip="false" />
            <div style="font-size: 10px" class="pl-10px">推荐 180x180 图片分辨率</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="项目状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :value="dict.value"
              >
                {{ dict.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="项目简介" prop="introduction">
        <el-input v-model="formData.introduction" type="textarea" placeholder="请输入项目简介" />
      </el-form-item>
      <el-form-item label="项目流程" prop="process">
        <Editor v-model="formData.process" height="150px" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MassageProject, MassageProjectApi } from '@/api/yaochuantang/massageproject'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 瑶川堂项目 表单 */
defineOptions({ name: 'MassageProjectForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  introduction: undefined,
  process: undefined,
  logo: undefined,
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
  logo: [{ required: true, message: '项目 logo不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '项目状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MassageProjectApi.getMassageProject(id)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as MassageProject
    if (formType.value === 'create') {
      await MassageProjectApi.createMassageProject(data)
      message.success(t('common.createSuccess'))
    } else {
      await MassageProjectApi.updateMassageProject(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    introduction: undefined,
    process: undefined,
    logo: undefined,
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}
</script>
