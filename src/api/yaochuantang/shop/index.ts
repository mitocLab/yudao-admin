import request from '@/config/axios'

// 瑶川堂门店 VO
export interface ShopVO {
  id: number // 编号
  name: string // 门店名称
  introduction: string // 门店简介
  phone: string // 门店手机
  areaId: number // 区域编号
  detailAddress: string // 门店详细地址
  logo: string // 门店 logo
  openingTime: string // 营业开始时间
  closingTime: string // 营业结束时间
  latitude: number // 纬度
  longitude: number // 经度
  verifyUserIds: string // 核销用户编号数组
  status: number // 门店状态
}

// 瑶川堂门店 API
export const ShopApi = {
  // 查询瑶川堂门店分页
  getShopPage: async (params: any) => {
    return await request.get({ url: `/yaochuantang/shop/page`, params })
  },

  // 查询瑶川堂门店详情
  getShop: async (id: number) => {
    return await request.get({ url: `/yaochuantang/shop/get?id=` + id })
  },

  // 新增瑶川堂门店
  createShop: async (data: ShopVO) => {
    return await request.post({ url: `/yaochuantang/shop/create`, data })
  },

  // 修改瑶川堂门店
  updateShop: async (data: ShopVO) => {
    return await request.put({ url: `/yaochuantang/shop/update`, data })
  },

  // 删除瑶川堂门店
  deleteShop: async (id: number) => {
    return await request.delete({ url: `/yaochuantang/shop/delete?id=` + id })
  },

  // 导出瑶川堂门店 Excel
  exportShop: async (params) => {
    return await request.download({ url: `/yaochuantang/shop/export-excel`, params })
  }
}
