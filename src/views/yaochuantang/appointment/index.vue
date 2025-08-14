<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="用户名称" prop="clientName">
        <el-input
          v-model="queryParams.clientName"
          placeholder="请输入用户名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="预约项目" prop="projectId">
        <el-select
          v-model="queryParams.projectId"
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
        <el-select v-model="queryParams.shopId" placeholder="请选择门店" clearable class="!w-240px">
          <el-option v-for="item in shopList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="健康管理师" prop="therapistId">
        <el-select
          v-model="queryParams.therapistId"
          placeholder="请选择健康管理师"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in therapistList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker
          v-model="queryParams.startTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item label="预约状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择预约状态"
          clearable
          class="!w-240px"
        >
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['yaochuantang:appointment:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['yaochuantang:appointment:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['yaochuantang:appointment:delete']"
        >
          <Icon icon="ep:delete" class="mr-5px" /> 批量删除
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="编号" align="center" prop="id" />
      <el-table-column label="预约ID" align="center" prop="orderNumber" />
      <el-table-column label="用户名称" align="center" prop="clientName" />
      <el-table-column label="预约项目" align="center" prop="projectName" />
      <el-table-column label="门店" align="center" prop="shopName" />
      <el-table-column label="健康管理师" align="center" prop="therapistName" />
      <el-table-column
        label="开始时间"
        align="center"
        prop="startTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="预计结束时间"
        align="center"
        prop="estimatedEndTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="预约状态" align="center" prop="statusDesc">
        <template #default="scope">
          <el-tag
            :type="getStatusTagType(scope.row.status)"
            :color="getStatusTagColor(scope.row.status)"
          >
            {{ scope.row.statusDesc }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['yaochuantang:appointment:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['yaochuantang:appointment:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <AppointmentForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { AppointmentApi, AppointmentVO } from '@/api/yaochuantang/appointment'
import { MassageProjectApi } from '@/api/yaochuantang/massageproject'
import { ShopApi } from '@/api/yaochuantang/shop'
import { TherapistApi } from '@/api/yaochuantang/therapist'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import AppointmentForm from './AppointmentForm.vue'

/** 瑶川堂预约记录 列表 */
defineOptions({ name: 'Appointment' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<AppointmentVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const shopList = ref<any[]>([]) // 门店列表
const projectList = ref<any[]>([]) // 项目列表
const therapistList = ref<any[]>([]) // 健康管理师列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  orderNumber: undefined,
  clientName: undefined,
  projectId: undefined,
  shopId: undefined,
  therapistId: undefined,
  startTime: [],
  estimatedEndTime: [],
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 加载门店和项目列表 */
const loadReferenceData = async () => {
  try {
    const [shopData, projectData, therapistData] = await Promise.all([
      ShopApi.getShopSimpleList(),
      MassageProjectApi.getMassageProjectSimpleList(),
      TherapistApi.getTherapistSimpleList()
    ])
    shopList.value = shopData
    projectList.value = projectData
    therapistList.value = therapistData
  } catch (error) {
    console.error('加载参考数据失败:', error)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await AppointmentApi.getAppointmentPage(queryParams)
    console.log('data', data)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

/** 删除按钮操作 */
const handleDelete = async (id: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await AppointmentApi.deleteAppointment(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除瑶川堂预约记录 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await AppointmentApi.deleteAppointmentList(checkedIds.value)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: AppointmentVO[]) => {
  checkedIds.value = records.map((item) => item.id)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await AppointmentApi.exportAppointment(queryParams)
    download.excel(data, '瑶川堂预约记录.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 获取状态标签类型 */
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0:
      return 'new' // 待服务
    case 1:
      return 'process' // 服务中
    case 2:
      return 'complete' // 已完成
    case 3:
      return 'cancel' // 已取消
    default:
      return 'new'
  }
}

/** 获取状态标签颜色 */
const getStatusTagColor = (status: number) => {
  switch (status) {
    case 0:
      return '#409EFF' // 待服务 - 蓝色
    case 1:
      return '#67C23A' // 已完成 - 绿色
    case 2:
      return '#E6A23C' // 服务中 - 橙色
    case 3:
      return '#F56C6C' // 已取消 - 红色
    default:
      return '#909399'
  }
}

/** 初始化 **/
onMounted(async () => {
  await loadReferenceData()
  await getList()
})
</script>
