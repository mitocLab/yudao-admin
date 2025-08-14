import request from '@/config/axios'

// 瑶川堂技师 VO
export interface TherapistVO {
  id: number // 编号
  name: string // 姓名
  introduction: string // 简介
  logo: string // 技师 logo
  focusProject: string // 擅长项目
  baseShop: string // 所属门店
  status: number // 技师状态
}

// 瑶川堂技师 API
export const TherapistApi = {
  // 查询瑶川堂技师分页
  getTherapistPage: async (params: any) => {
    return await request.get({ url: `/yaochuantang/therapist/page`, params })
  },

  // 查询瑶川堂技师详情
  getTherapist: async (id: number) => {
    return await request.get({ url: `/yaochuantang/therapist/get?id=` + id })
  },

  // 新增瑶川堂技师
  createTherapist: async (data: TherapistVO) => {
    return await request.post({ url: `/yaochuantang/therapist/create`, data })
  },

  // 修改瑶川堂技师
  updateTherapist: async (data: TherapistVO) => {
    return await request.put({ url: `/yaochuantang/therapist/update`, data })
  },

  // 删除瑶川堂技师
  deleteTherapist: async (id: number) => {
    return await request.delete({ url: `/yaochuantang/therapist/delete?id=` + id })
  },

  // 批量删除瑶川堂技师
  deleteTherapistList: async (ids: number[]) => {
    return await request.delete({ url: `/yaochuantang/therapist/delete-list`, data: { ids } })
  },

  // 导出瑶川堂技师 Excel
  exportTherapist: async (params: any) => {
    return await request.download({ url: `/yaochuantang/therapist/export-excel`, params })
  },

  // 查询瑶川堂技师简易列表
  getTherapistSimpleList: async () => {
    return await request.get({ url: `/yaochuantang/therapist/simple-list` })
  }
}
