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
          <el-form-item label="技师头像" prop="logo">
            <UploadImg v-model="formData.logo" :limit="1" :is-show-tip="false" />
            <div style="font-size: 10px" class="pl-10px">推荐 180x180 图片分辨率</div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="技师状态" prop="status">
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

      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item label="简介" prop="introduction">
        <el-input v-model="formData.introduction" placeholder="请输入简介" />
      </el-form-item>

      <el-form-item label="擅长项目" prop="forceProjectIds">
        <el-select v-model="formData.forceProjectIds" multiple placeholder="请选择">
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属门店" prop="baseShopIds">
        <el-select v-model="formData.baseShopIds" multiple placeholder="请选择">
          <el-option v-for="item in shopList" :key="item.id" :label="item.name" :value="item.id!" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { MassageProjectApi } from '@/api/yaochuantang/massageproject'
import { ShopApi } from '@/api/yaochuantang/shop'
import { Therapist, TherapistApi } from '@/api/yaochuantang/therapist'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 瑶川堂技师 表单 */
defineOptions({ name: 'TherapistForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗
const projectList = ref([] as MassageProjectApi.MassageProjectVO[]) // 项目列表
const shopList = ref([] as ShopApi.ShopVO[]) // 门店列表

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const formData = ref({
  id: undefined,
  name: undefined,
  introduction: undefined,
  logo: undefined,
  forceProjectIds: [],
  baseShopIds: [],
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: '姓名不能为空', trigger: 'blur' }],
  logo: [{ required: true, message: '技师头像不能为空', trigger: 'blur' }],
  forceProjectIds: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error('擅长项目不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  baseShopIds: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error('所属门店不能为空'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ],
  status: [{ required: true, message: '技师状态不能为空', trigger: 'blur' }]
})
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  // 加载项目列表和门店列表（只加载启用的门店）
  try {
    const [projectData, shopData] = await Promise.all([
      MassageProjectApi.getMassageProjectSimpleList(),
      ShopApi.getShopSimpleList()
    ])

    // 检查数据结构，如果包含status字段则进行过滤
    if (shopData.length > 0 && shopData[0].hasOwnProperty('status')) {
      shopList.value = shopData.filter((shop: any) => shop.status === CommonStatusEnum.ENABLE)
    } else {
      shopList.value = shopData
    }

    if (projectData.length > 0 && projectData[0].hasOwnProperty('status')) {
      projectList.value = projectData.filter(
        (project: any) => project.status === CommonStatusEnum.ENABLE
      )
    } else {
      projectList.value = projectData
    }
  } catch (error) {
    console.error('加载参考数据失败:', error)
  }

  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      const data = await TherapistApi.getTherapist(id)
      // 转换数据格式以匹配表单字段
      const forceProjectIds = data.focusProject
        ? data.focusProject.split(',').map((id) => parseInt(id.trim()))
        : []
      const baseShopIds = data.baseShop
        ? data.baseShop.split(',').map((id) => parseInt(id.trim()))
        : []

      // 过滤掉已停用的门店ID，只保留启用的门店ID
      const validShopIds = baseShopIds.filter((shopId) =>
        shopList.value.some((shop) => shop.id === shopId)
      )

      // 过滤掉已停用的项目ID，只保留启用的项目ID
      const validProjectIds = forceProjectIds.filter((projectId) =>
        projectList.value.some((project) => project.id === projectId)
      )

      formData.value = {
        ...data,
        forceProjectIds: validProjectIds,
        baseShopIds: validShopIds
      }
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
    // 转换数据格式以匹配后端接口
    const submitData: Therapist = {
      id: formData.value.id,
      name: formData.value.name || '',
      introduction: formData.value.introduction || '',
      logo: formData.value.logo || '',
      focusProject: formData.value.forceProjectIds?.join(',') || '', // 将数组转换为逗号分隔的字符串
      baseShop: formData.value.baseShopIds?.join(',') || '', // 将数组转换为逗号分隔的字符串
      status: formData.value.status || CommonStatusEnum.ENABLE
    }

    if (formType.value === 'create') {
      await TherapistApi.createTherapist(submitData)
      message.success(t('common.createSuccess'))
    } else {
      await TherapistApi.updateTherapist(submitData)
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
    logo: undefined,
    forceProjectIds: [],
    baseShopIds: [],
    status: CommonStatusEnum.ENABLE
  }
  formRef.value?.resetFields()
}
</script>
