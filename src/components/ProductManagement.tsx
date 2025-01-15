'use client';

import { useEffect, useState } from 'react';
import { Prisma } from '@prisma/client';

export default function ProductManagement() {
  const [products, setProducts] = useState<Prisma.ProductGetPayload<{
    include: { category: true }
  }>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const handleAddProduct = async (product: {
    name: string;
    description: string;
    price: number;
    categoryId: number;
    imageUrl: string;
  }) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const newProduct = await response.json();
        setProducts([...products, newProduct]);
      }
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleUpdateProduct = async (id: number, updates: {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    imageUrl?: string;
  }) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(products.map(p => 
          p.id === updatedProduct.id ? updatedProduct : p
        ));
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">商品管理</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={() => {
            const name = prompt('请输入商品名称');
            const description = prompt('请输入商品描述');
            const price = parseFloat(prompt('请输入商品价格') || '0');
            const categoryId = parseInt(prompt('请输入分类ID') || '0');
            const imageUrl = prompt('请输入图片URL');

            if (name && description && price && categoryId && imageUrl) {
              handleAddProduct({
                name,
                description,
                price,
                categoryId,
                imageUrl
              });
            }
          }}
        >
          添加商品
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg p-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <p className="font-medium">¥{product.price.toFixed(2)}</p>
            <p className="text-sm text-gray-500">
              分类: {product.category.name}
            </p>

            <div className="mt-4 space-x-2">
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                onClick={() => {
                  const name = prompt('请输入新商品名称', product.name);
                  const description = prompt('请输入新商品描述', product.description);
                  const price = parseFloat(prompt('请输入新价格', product.price.toString()) || '0');
                  const categoryId = parseInt(prompt('请输入新分类ID', product.categoryId.toString()) || '0');
                  const imageUrl = prompt('请输入新图片URL', product.imageUrl);

                  if (name && description && price && categoryId && imageUrl) {
                    handleUpdateProduct(product.id, {
                      name,
                      description,
                      price,
                      categoryId,
                      imageUrl
                    });
                  }
                }}
              >
                编辑
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                onClick={() => {
                  if (confirm('确定要删除这个商品吗？')) {
                    handleDeleteProduct(product.id);
                  }
                }}
              >
                删除
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}