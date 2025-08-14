import request from '@/config/axios'

// 瑶川堂预约记录 VO
export interface AppointmentVO {
  id: number // 编号
  orderNumber: number // 预约ID
  clientName: string // 用户名称
  projectId: number // 预约项目
  shopId: number // 门店
  therapistId: number // 健康管理师
  startTime: Date // 开始时间
  estimatedEndTime: Date // 预计结束时间
  status: number // 预约状态
}

// 瑶川堂预约记录 API
export const AppointmentApi = {
  // 查询瑶川堂预约记录分页
  getAppointmentPage: async (params: any) => {
    return await request.get({ url: `/yaochuantang/appointment/page`, params })
  },

  // 查询瑶川堂预约记录详情
  getAppointment: async (id: number) => {
    return await request.get({ url: `/yaochuantang/appointment/get?id=` + id })
  },

  // 新增瑶川堂预约记录
  createAppointment: async (data: AppointmentVO) => {
    return await request.post({ url: `/yaochuantang/appointment/create`, data })
  },

  // 修改瑶川堂预约记录
  updateAppointment: async (data: AppointmentVO) => {
    return await request.put({ url: `/yaochuantang/appointment/update`, data })
  },

  // 删除瑶川堂预约记录
  deleteAppointment: async (id: number) => {
    return await request.delete({ url: `/yaochuantang/appointment/delete?id=` + id })
  },

  // 导出瑶川堂预约记录 Excel
  exportAppointment: async (params) => {
    return await request.download({ url: `/yaochuantang/appointment/export-excel`, params })
  },

  // 批量删除瑶川堂预约记录
  deleteAppointmentList: async (ids: number[]) => {
    return await request.delete({ url: `/yaochuantang/appointment/delete-list`, data: ids })
  }
}
