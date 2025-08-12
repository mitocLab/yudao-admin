import request from '@/config/axios'

// 瑶川堂项目 VO
export interface MassageProjectVO {
  id: number // 编号
  name: string // 项目名称
  introduction: string // 项目简介
  process: string // 项目流程
  logo: string // 项目 logo
  status: number // 项目状态
}

// 瑶川堂项目 API
export const MassageProjectApi = {
  // 查询瑶川堂项目分页
  getMassageProjectPage: async (params: any) => {
    return await request.get({ url: `/yaochuantang/massage-project/page`, params })
  },

  // 查询瑶川堂项目详情
  getMassageProject: async (id: number) => {
    return await request.get({ url: `/yaochuantang/massage-project/get?id=` + id })
  },

  // 新增瑶川堂项目
  createMassageProject: async (data: MassageProjectVO) => {
    return await request.post({ url: `/yaochuantang/massage-project/create`, data })
  },

  // 修改瑶川堂项目
  updateMassageProject: async (data: MassageProjectVO) => {
    return await request.put({ url: `/yaochuantang/massage-project/update`, data })
  },

  // 删除瑶川堂项目
  deleteMassageProject: async (id: number) => {
    return await request.delete({ url: `/yaochuantang/massage-project/delete?id=` + id })
  },

  // 导出瑶川堂项目 Excel
  exportMassageProject: async (params) => {
    return await request.download({ url: `/yaochuantang/massage-project/export-excel`, params })
  },

  // 查询瑶川堂项目简易列表
  getMassageProjectSimpleList: async () => {
    return await request.get({ url: `/yaochuantang/massage-project/simple-list` })
  }
}
