import { auth } from "@/app/api/utils";
import OrderList from "@/components/OrderList";

export default async function OrdersPage() {
  const user = await auth();
  if (!user) {
    return <div>请先登录</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">我的订单</h1>
      <OrderList />
    </div>
  );
}