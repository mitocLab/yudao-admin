<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <!-- <el-form-item label="预约ID" prop="orderNumber">
        <el-input v-model="formData.orderNumber" placeholder="请输入预约ID" />
      </el-form-item> -->
      <el-form-item label="用户名称" prop="clientName" class="!w-240px">
        <el-input v-model="formData.clientName" placeholder="请输入用户名称" />
      </el-form-item>
      <el-form-item label="预约项目" prop="projectId">
        <el-select
          v-model="formData.projectId"
          placeholder="请选择预约项目"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="门店" prop="shopId">
        <el-select v-model="formData.shopId" placeholder="请选择门店" clearable class="!w-240px">
          <el-option v-for="item in shopList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="健康管理师" prop="therapistId">
        <el-select
          v-model="formData.therapistId"
          placeholder="请选择技师"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in therapistList"
            :key="item.id"
            :label="item.name"
            :value="item.id!"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="formData.startTime"
          type="datetime"
          value-format="x"
          format="YYYY-MM-DD HH:mm"
          placeholder="选择开始时间"
        />
      </el-form-item>
      <el-form-item v-if="formType === 'update'" label="预约状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions('yaochuantang_appointment_status')"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { AppointmentApi } from '@/api/yaochuantang/appointment'
import { MassageProjectApi } from '@/api/yaochuantang/massageproject'
import { ShopApi } from '@/api/yaochuantang/shop'
import { TherapistApi } from '@/api/yaochuantang/therapist'
import { getIntDictOptions } from '@/utils/dict'

/** 瑶川堂预约记录 表单 */
defineOptions({ name: 'AppointmentForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const projectList = ref([] as MassageProjectApi.MassageProjectVO[]) // 项目列表
const shopList = ref([] as ShopApi.ShopVO[]) // 门店列表
const therapistList = ref([] as TherapistApi.TherapistVO[]) // 健康管理师列表

const formData = ref({
  id: undefined,
  orderNumber: undefined,
  clientName: undefined,
  projectId: undefined,
  shopId: undefined,
  therapistId: undefined,
  startTime: undefined,
  estimatedEndTime: undefined,
  status: undefined
})
const formRules = computed(() => ({
  // orderNumber: [{ required: true, message: '预约ID不能为空', naz: 'blur' }],
  clientName: [{ required: true, message: '用户名称不能为空', trigger: 'blur' }],
  projectId: [{ required: true, message: '预约项目不能为空', trigger: 'blur' }],
  shopId: [{ required: true, message: '门店不能为空', trigger: 'blur' }],
  therapistId: [{ required: true, message: '健康管理师不能为空', trigger: 'blur' }],
  startTime: [{ required: true, message: '开始时间不能为空', trigger: 'blur' }],
  estimatedEndTime: [{ required: true, message: '预计结束时间不能为空', trigger: 'blur' }],
  ...(formType.value === 'update'
    ? { status: [{ required: true, message: '预约状态不能为空', trigger: 'blur' }] }
    : {})
}))
const formRef = ref() // 表单 Ref

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  try {
    const [projectData, shopData, therapistData] = await Promise.all([
      MassageProjectApi.getMassageProjectSimpleList(),
      ShopApi.getShopSimpleList(),
      TherapistApi.getTherapistSimpleList()
    ])

    shopList.value = shopData
    projectList.value = projectData
    therapistList.value = therapistData
  } catch (error) {
    console.error('加载参考数据失败:', error)
  }
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await AppointmentApi.getAppointment(id)
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
    const data = formData.value as unknown as Appointment
    if (formType.value === 'create') {
      await AppointmentApi.createAppointment(data)
      message.success(t('common.createSuccess'))
    } else {
      await AppointmentApi.updateAppointment(data)
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
    orderNumber: undefined,
    clientName: undefined,
    projectId: undefined,
    shopId: undefined,
    therapistId: undefined,
    startTime: undefined,
    estimatedEndTime: undefined,
    status: undefined
  }
  formRef.value?.resetFields()
}
</script>
