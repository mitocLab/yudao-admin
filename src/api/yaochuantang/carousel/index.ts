import request from '@/config/axios'

// 瑶川堂轮播图 VO
export interface CarouselVO {
  id: number // 编号
  logo: string // 轮播图 logo
  redirectUrl: string // 轮播图跳转地址
  status: number // 轮播图状态
}

// 瑶川堂轮播图 API
export const CarouselApi = {
  // 查询瑶川堂轮播图分页
  getCarouselPage: async (params: any) => {
    return await request.get({ url: `/yaochuantang/carousel/page`, params })
  },

  // 查询瑶川堂轮播图详情
  getCarousel: async (id: number) => {
    return await request.get({ url: `/yaochuantang/carousel/get?id=` + id })
  },

  // 新增瑶川堂轮播图
  createCarousel: async (data: CarouselVO) => {
    return await request.post({ url: `/yaochuantang/carousel/create`, data })
  },

  // 修改瑶川堂轮播图
  updateCarousel: async (data: CarouselVO) => {
    return await request.put({ url: `/yaochuantang/carousel/update`, data })
  },

  // 删除瑶川堂轮播图
  deleteCarousel: async (id: number) => {
    return await request.delete({ url: `/yaochuantang/carousel/delete?id=` + id })
  },

  // 批量删除瑶川堂轮播图
  deleteCarouselList: async (ids: number[]) => {
    return await request.delete({ url: `/yaochuantang/carousel/delete-list`, data: ids })
  },

  // 导出瑶川堂轮播图 Excel
  exportCarousel: async (params) => {
    return await request.download({ url: `/yaochuantang/carousel/export-excel`, params })
  }
}
