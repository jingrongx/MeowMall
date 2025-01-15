import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create categories
  const catFood = await prisma.category.create({
    data: {
      name: '猫粮',
      slug: 'cat-food',
      description: '优质猫粮，满足爱猫营养需求',
      imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80'
    }
  });

  const catToys = await prisma.category.create({
    data: {
      name: '玩具',
      slug: 'cat-toys',
      description: '丰富多样的猫咪玩具，让爱猫玩得开心',
      imageUrl: 'https://images.unsplash.com/photo-1615369794017-f65e6f0c0393?auto=format&fit=crop&w=800&q=80'
    }
  });

  const catCare = await prisma.category.create({
    data: {
      name: '护理',
      slug: 'cat-care',
      description: '专业的猫咪护理用品，呵护爱猫健康',
      imageUrl: 'https://images.unsplash.com/photo-1576078044571-8ea98b0b0963?auto=format&fit=crop&w=800&q=80'
    }
  });

  const catLitter = await prisma.category.create({
    data: {
      name: '猫砂',
      slug: 'cat-litter',
      description: '优质猫砂，保持环境清洁卫生',
      imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80'
    }
  });

  // Create products
  await prisma.product.create({
    data: {
      name: '皇家幼猫猫粮',
      description: '专为幼猫设计的优质猫粮，富含DHA，促进大脑发育',
      price: 199.00,
      imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 100,
      categoryId: catFood.id
    }
  });

  await prisma.product.create({
    data: {
      name: '冻干生骨肉',
      description: '天然冻干工艺，锁住营养，美味可口',
      price: 128.00,
      imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 50,
      categoryId: catFood.id
    }
  });

  await prisma.product.create({
    data: {
      name: '电动逗猫棒',
      description: '智能电动逗猫棒，多种模式，让猫咪爱不释手',
      price: 99.00,
      imageUrl: 'https://images.unsplash.com/photo-1615369794017-f65e6f0c0393?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 200,
      categoryId: catToys.id
    }
  });

  await prisma.product.create({
    data: {
      name: '豪华猫爬架',
      description: '多层猫爬架，带猫窝和磨爪板，满足猫咪运动需求',
      price: 299.00,
      imageUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 30,
      categoryId: catToys.id
    }
  });

  await prisma.product.create({
    data: {
      name: '猫咪美容套装',
      description: '专业猫咪美容工具，包含梳子、指甲剪等',
      price: 159.00,
      imageUrl: 'https://images.unsplash.com/photo-1576078044571-8ea98b0b0963?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 80,
      categoryId: catCare.id
    }
  });

  await prisma.product.create({
    data: {
      name: '猫咪指甲剪',
      description: '安全设计的指甲剪，让修剪指甲不再困难',
      price: 39.00,
      imageUrl: 'https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 150,
      categoryId: catCare.id
    }
  });

  await prisma.product.create({
    data: {
      name: '豆腐猫砂',
      description: '环保豆腐猫砂，易结团，好处理',
      price: 29.00,
      imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 300,
      categoryId: catLitter.id
    }
  });

  await prisma.product.create({
    data: {
      name: '膨润土猫砂',
      description: '强力吸水，快速结团，除臭持久',
      price: 49.00,
      imageUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80',
      featured: true,
      stock: 200,
      categoryId: catLitter.id
    }
  });

  // Create test user
  const hashedPassword = await bcrypt.hash('123456', 10);
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'USER'
    }
  });

  // Create admin user
  const adminHashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminHashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });