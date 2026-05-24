import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
      { path: 'catalog', loadComponent: () => import('./features/catalog/product-list/product-list.component').then(m => m.ProductListComponent) },
      { path: 'catalog/:id', loadComponent: () => import('./features/catalog/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },
      { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'orders',
        canActivate: [authGuard],
        children: [
          { path: '', loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent) },
          { path: ':id', loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
        ],
      },
      {
        path: 'dashboard',
        canActivate: [authGuard, roleGuard(['Dulceria', 'Propietario'])],
        loadComponent: () => import('./features/dashboard/owner/owner-dashboard.component').then(m => m.OwnerDashboardComponent),
        children: [
          { path: '', redirectTo: 'overview', pathMatch: 'full' },
          { path: 'overview', loadComponent: () => import('./features/dashboard/owner/overview/owner-overview.component').then(m => m.OwnerOverviewComponent) },
          { path: 'pedidos', loadComponent: () => import('./features/dashboard/owner/pedidos/owner-pedidos.component').then(m => m.OwnerPedidosComponent) },
          { path: 'productos', loadComponent: () => import('./features/dashboard/owner/productos/owner-productos.component').then(m => m.OwnerProductosComponent) },
          { path: 'dulceria', loadComponent: () => import('./features/dashboard/owner/dulceria/owner-dulceria.component').then(m => m.OwnerDulceriaComponent) },
        ],
      },
      {
        path: 'admin',
        canActivate: [authGuard, roleGuard(['Admin'])],
        loadComponent: () => import('./features/dashboard/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then(m => m.AuthLayoutComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
