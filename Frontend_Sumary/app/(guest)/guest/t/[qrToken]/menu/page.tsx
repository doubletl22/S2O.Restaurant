'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation' // Hook lấy tham số URL
import { MenuItemCardV2 } from '@/components/guest/menu-item-card-v2'
import { CategoryChips } from '@/components/guest/category-chips'
import { useGuestCart } from '@/components/guest/guest-cart-context';
import { guestService } from '@/services/guest.service'
import { ProductDto, CategoryDto } from '@/lib/types'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner' 

export default function MenuPage() {
  const params = useParams();
  const tableId = params?.qrToken as string;
  const [products, setProducts] = useState<ProductDto[]>([])
  const [categories, setCategories] = useState<CategoryDto[]>([])
  const [tableInfo, setTableInfo] = useState<any>(null) 
  const [loading, setLoading] = useState(true)
  const { addToCart, totalItems } = useGuestCart();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all')

  useEffect(() => {
    const initPage = async () => {
      if (!tableId) return;
      
      try {
        setLoading(true);
        const info = await guestService.getTableInfo(tableId);
        setTableInfo(info);
        if (info && info.tenantId) {
            const menuData = await guestService.getPublicMenu(info.tenantId);
            if (menuData) {
                setProducts(menuData.products);
                setCategories(menuData.categories);
            }
        }
        
      } catch (error) {
        console.error("Lỗi khởi tạo:", error);
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [tableId]);

 const handleAddToCart = (product: ProductDto) => {
    addToCart(product); 
  }

  const filteredProducts = activeCategoryId === 'all'
    ? products
    : products.filter((p) => p.categoryId === activeCategoryId)

  const categoryNames = ['Tất cả', ...categories.map(c => c.name)];
  
  const handleCategorySelect = (index: number) => {
     if (index === 0) setActiveCategoryId('all');
     else setActiveCategoryId(categories[index - 1].id);
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <header className="px-5 pt-8 pb-4 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-gray-800">Thực đơn</h1>
            <p className="text-sm text-gray-500 mt-1">{tableInfo?.tenantName} • {tableInfo?.tableName || 'Bàn chưa xác định'}</p>
          </div>
          {totalItems > 0 && (
            <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              {totalItems} món
            </div>
          )}
        </div>
      </header>

      {/* Chips Categories */}
      <div className="bg-white pb-2 sticky top-22 z-10 shadow-sm">
         <CategoryChips
            categories={categoryNames}
            activeIndex={activeCategoryId === 'all' ? 0 : categories.findIndex(c => c.id === activeCategoryId) + 1}
            onSelect={handleCategorySelect}
         />
      </div>

      {/* List Products */}
      <section className="px-4 pt-4 flex flex-col gap-3">
        {filteredProducts.map((product) => (<MenuItemCardV2
            key={product.id}
            product={{
                id: product.id, 
                description: product.description,
                name: product.name,
                price: product.price,
                image: product.imageUrl || '/placeholder.svg?height=200&width=200',
                isAvailable: product.isAvailable,
                category: categories.find(c => c.id === product.categoryId)?.name || 'Khác'
            }}
            onAddToCart={() => handleAddToCart(product)}
          />
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Không tìm thấy món nào trong danh mục này.
          </div>
        )}
      </section>
    </div>
  )
}