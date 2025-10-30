import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import Layout from '@/components/Layout';
import HomePage from '@/components/pages/HomePage';
import ShopPage from '@/components/pages/ShopPage';
import ProductDetailPage from '@/components/pages/ProductDetailPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <ScrollToTop />
        <Layout />
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "shop",
        element: <ShopPage />,
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
