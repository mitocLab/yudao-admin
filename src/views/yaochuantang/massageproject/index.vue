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
      <el-form-item label="项目名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入项目名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item label="项目状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择项目状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
        <el-button
          type="primary"
          plain
          @click="openForm('create')"
          v-hasPermi="['yaochuantang:massage-project:create']"
        >
          <Icon icon="ep:plus" class="mr-5px" /> 新增
        </el-button>
        <el-button
          type="success"
          plain
          @click="handleExport"
          :loading="exportLoading"
          v-hasPermi="['yaochuantang:massage-project:export']"
        >
          <Icon icon="ep:download" class="mr-5px" /> 导出
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="isEmpty(checkedIds)"
          @click="handleDeleteBatch"
          v-hasPermi="['yaochuantang:massage-project:delete']"
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
      <el-table-column label="项目 logo" min-width="100" prop="logo">
        <template #default="scope">
          <img v-if="scope.row.logo" :src="scope.row.logo" alt="门店 logo" class="h-50px" />
        </template>
      </el-table-column>
      <el-table-column label="项目名称" align="center" prop="name" />
      <el-table-column label="项目简介" align="center" prop="introduction" />
      <el-table-column label="项目流程" align="center" prop="process" min-width="300">
        <template #default="scope">
          <div v-if="scope.row.process" v-html="formatProcess(scope.row.process)"></div>
        </template>
      </el-table-column>
      <el-table-column label="项目状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.COMMON_STATUS" :value="scope.row.status" />
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
            v-hasPermi="['yaochuantang:massage-project:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-hasPermi="['yaochuantang:massage-project:delete']"
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
  <MassageProjectForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { MassageProject, MassageProjectApi } from '@/api/yaochuantang/massageproject'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import download from '@/utils/download'
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import MassageProjectForm from './MassageProjectForm.vue'

/** 瑶川堂项目 列表 */
defineOptions({ name: 'MassageProject' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<MassageProject[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const exportLoading = ref(false) // 导出的加载中

/** 格式化项目流程 */
const formatProcess = (process: string) => {
  if (!process) return ''
  console.log('process', process)

  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = process

  let result = ''

  // 处理有序列表 <ol>
  const olElement = tempDiv.querySelector('ol')
  if (olElement) {
    const liElements = olElement.querySelectorAll('li')
    liElements.forEach((li, index) => {
      const text = li.textContent?.trim() || ''
      if (text) {
        result += `${index + 1}. ${text}\n`
      }
    })
  }

  // 处理段落内容 <p>
  const pElements = tempDiv.querySelectorAll('p')
  pElements.forEach((p) => {
    const text = p.textContent?.trim() || ''
    if (text) {
      result += `${text}\n`
    }
  })

  // 如果没有找到结构化内容，则按原来的方式处理
  if (!result) {
    const textContent = tempDiv.textContent || tempDiv.innerText || ''
    console.log('textContent', textContent)

    // 尝试按数字分割
    const steps = textContent.split(/(?=\d+\.)/).filter((step) => step.trim())

    if (steps.length > 0) {
      result = steps
        .map((step, index) => {
          const cleanStep = step.replace(/^\d+\.\s*/, '').trim()
          console.log('cleanStep', cleanStep)
          return `${index + 1}. ${cleanStep}`
        })
        .join('\n')
    } else {
      result = textContent
    }
  }

  // 清理多余的换行符并转换为HTML
  return result.trim().replace(/\n/g, '<br>')
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await MassageProjectApi.getMassageProjectPage(queryParams)
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
    await MassageProjectApi.deleteMassageProject(id)
    message.success(t('common.delSuccess'))
    currentRow.value = {}
    // 刷新列表
    await getList()
  } catch {}
}

/** 批量删除瑶川堂项目 */
const handleDeleteBatch = async () => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    await MassageProjectApi.deleteMassageProjectList(checkedIds.value)
    message.success(t('common.delSuccess'))
    await getList()
  } catch {}
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: MassageProject[]) => {
  checkedIds.value = records.map((item) => item.id)
}

/** 导出按钮操作 */
const handleExport = async () => {
  try {
    // 导出的二次确认
    await message.exportConfirm()
    // 发起导出
    exportLoading.value = true
    const data = await MassageProjectApi.exportMassageProject(queryParams)
    download.excel(data, '瑶川堂项目.xls')
  } catch {
  } finally {
    exportLoading.value = false
  }
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
