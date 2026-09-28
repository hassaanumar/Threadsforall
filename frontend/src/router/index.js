import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

const routes = [
  { path: "/", name: "home", component: () => import("../views/Home.vue") },
  { path: "/shop", name: "shop", component: () => import("../views/Shop.vue") },
  { path: "/product/:id", name: "product", component: () => import("../views/ProductDetail.vue") },
  { path: "/cart", name: "cart", component: () => import("../views/Cart.vue") },
  { path: "/checkout", name: "checkout", component: () => import("../views/Checkout.vue") },
  { path: "/order-success", name: "order-success", component: () => import("../views/OrderSuccess.vue") },
{
  path: "/admin/reviews",
  name: "admin-reviews",
  component: () => import("../views/admin/AdminReviews.vue"),
}
,
  { path: "/admin/login", name: "admin-login", component: () => import("../views/admin/AdminLogin.vue") },
  {
    path: "/admin",
    component: () => import("../views/admin/AdminLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "admin-dashboard", component: () => import("../views/admin/Dashboard.vue") },
      { path: "products", name: "admin-products", component: () => import("../views/admin/ProductsManage.vue") },
      { path: "products/new", name: "admin-product-new", component: () => import("../views/admin/ProductForm.vue") },
      { path: "products/:id/edit", name: "admin-product-edit", component: () => import("../views/admin/ProductForm.vue") },
      { path: "orders", name: "admin-orders", component: () => import("../views/admin/OrdersManage.vue") },
    ],
  },

  { path: "/:pathMatch(.*)*", name: "not-found", component: () => import("../views/NotFound.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: "admin-login" };
  }
  return true;
});

export default router;
