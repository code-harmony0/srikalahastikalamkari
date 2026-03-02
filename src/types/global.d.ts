declare global {
  interface Window {
    __PRODUCT_DATA?: {
      id: string
      name: string
      price: number
      slug?: string
    }
  }
}

export {}
