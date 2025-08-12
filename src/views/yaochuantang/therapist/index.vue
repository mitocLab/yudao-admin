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
      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="擅长项目" prop="focusProject">
        <el-select
          v-model="queryParams.focusProject"
          placeholder="请选择擅长项目"
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
      <el-form-item label="所属门店" prop="baseShop">
        <el-select
          v-model="queryParams.baseShop"
          placeholder="请选择所属门店"
          clearable
          class="!w-240px"
        >
          <el-option v-for="item in shopList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="技师状态" prop="status">
        <el-select v-model="queryParams.status" class="!w-240px" clearable placeholder="技师状态">
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['yaochuantang:therapist:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['yaochuantang:therapist:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['yaochuantang:therapist:delete']"
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
      <el-table-column label="姓名" align="center" prop="name" />
      <el-table-column label="简介" align="center" prop="introduction" />
      <el-table-column label="技师头像" align="center" prop="logo">
        <template #default="scope">
          <img v-if="scope.row.logo" :src="scope.row.logo" alt="技师头像" class="h-50px" />
        </template>
      </el-table-column>
      <el-table-column label="擅长项目" align="center" prop="focusProject">
        <template #default="scope">
          <span v-if="scope.row.focusProject">
            {{ getProjectNames(scope.row.focusProject) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="所属门店" align="center" prop="baseShop">
        <template #default="scope">
          <span v-if="scope.row.baseShop">
            {{ getShopNames(scope.row.baseShop) }}
          </span>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="技师状态" align="center" prop="status">
        <template #default="scope">
          <el-tag :type="scope.row.status === CommonStatusEnum.ENABLE ? 'success' : 'danger'">
            {{ getDictLabel(DICT_TYPE.COMMON_STATUS, scope.row.status) }}
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
            v-hasPermi="['yaochuantang:therapist:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['yaochuantang:therapist:delete']"
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
  <TherapistForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { MassageProjectApi } from '@/api/yaochuantang/massageproject'
import { ShopApi } from '@/api/yaochuantang/shop'
import { TherapistApi, TherapistVO } from '@/api/yaochuantang/therapist'
import { CommonStatusEnum } from '@/utils/constants'
import { DICT_TYPE, getDictLabel, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import TherapistForm from './TherapistForm.vue'

/** 瑶川堂技师 列表 */
defineOptions({ name: 'Therapist' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<TherapistVO[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const shopList = ref<any[]>([]) // 门店列表
const projectList = ref<any[]>([]) // 项目列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  focusProject: undefined,
  baseShop: undefined,
  status: CommonStatusEnum.ENABLE
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 获取门店名称 */
const getShopNames = (shopIds: string) => {
  if (!shopIds || !shopList.value.length) return '-'
  const ids = shopIds.split(',').map((id) => parseInt(id.trim()))
  const names = shopList.value.filter((shop) => ids.includes(shop.id)).map((shop) => shop.name)
  return names.length > 0 ? names.join(', ') : '-'
}

/** 获取项目名称 */
const getProjectNames = (projectIds: string) => {
  if (!projectIds || !projectList.value.length) return '-'
  const ids = projectIds.split(',').map((id) => parseInt(id.trim()))
  const names = projectList.value
    .filter((project) => ids.includes(project.id))
    .map((project) => project.name)
  return names.length > 0 ? names.join(', ') : '-'
}

/** 加载门店和项目列表 */
const loadReferenceData = async () => {
  try {
    const [shopData, projectData] = await Promise.all([
      ShopApi.getShopSimpleList(),
      MassageProjectApi.getMassageProjectSimpleList()
    ])
    shopList.value = shopData
    projectList.value = projectData
  } catch (error) {
    console.error('加载参考数据失败:', error)
  }
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TherapistApi.getTherapistPage(queryParams)
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
    await TherapistApi.deleteTherapist(id)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除瑶川堂技师 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await TherapistApi.deleteTherapistList(checkedIds.value)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: TherapistVO[]) => {
  checkedIds.value = records.map((item) => item.id)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await TherapistApi.exportTherapist(queryParams)
    download.excel(data, '瑶川堂技师.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(async () => {
  await loadReferenceData()
  await getList()
})
</script>
