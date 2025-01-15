# 猫品商城

这是一个基于Next.js开发的电商系统，主要功能包括：

- 商品分类展示
- 商品详情页
- 购物车功能
- 订单管理
- 用户中心
- 后台管理系统

## 技术栈

- 前端：Next.js 14 + Tailwind CSS
- 后端：Next.js API Routes
- 数据库：Prisma + SQLite
- 部署：Vercel
- 其他：i18n国际化支持

## 核心功能实现

### 数据库层
- 使用Prisma ORM连接数据库
- 支持事务处理
- 自动生成类型安全的数据库操作
- 内置数据迁移功能

### 前端实现
- 响应式布局
- 商品分类展示
- 商品详情页
- 购物车功能
- 订单流程
- 多语言支持

### 后台管理
- 实时数据统计
- 订单管理
- 商品管理
- 用户管理
- 权限控制

## 主要模块

### 数据库配置
```typescript
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}
```

### API路由
```typescript
// src/app/api/products/route.ts
export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}
```

## 安装运行

1. 环境要求：
   - Node.js 18+
   - npm 9+
   - SQLite

2. 安装步骤：
```bash
# 克隆项目
git clone https://github.com/jingrongx/MeowMall.git

# 安装依赖
npm install

# 初始化数据库
npx prisma migrate dev --name init

# 启动开发服务器
npm run dev
```

## 截图预览

以下是系统主要页面的截图：

<table>
  <tr>
    <td style="border:1px solid black"><img src="public/images/homepage.png"></td>
  </tr>
  <tr>
    <td>*首页 - 2025-01-15 15:00:00*</td>
  </tr>
</table>

<table>
  <tr>
    <td style="border:1px solid black"><img src="public/images/categories.png"></td>
  </tr>
  <tr>
    <td>*商品分类页 - 2025-01-15 15:01:00*</td>
  </tr>
</table>

<table>
  <tr>
    <td style="border:1px solid black"><img src="public/images/product-detail.png"></td>
  </tr>
  <tr>
    <td>*商品详情页 - 2025-01-15 15:02:00*</td>
  </tr>
</table>

## 关注我们

抖音ID：1036110286  
账号名：星樞引路

## 许可说明

本程序仅供学习研究使用，请勿用于商业用途。

## 原README内容

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
