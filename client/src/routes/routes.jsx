// routes/routes.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Unauthorized from "../pages/Auth/Unauthorized";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../Layout/Layout";
import Login from "../pages/Auth/Login";
import NotFound from "./NotFound";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, element: <NotFound type="construction" /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
