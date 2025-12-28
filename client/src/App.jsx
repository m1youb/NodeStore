import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import Navbar from "./components/Navbar"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./store/AuthStore"
import { useEffect } from "react"
import LoadingSpinner from "./components/LoadingSpinner"
import Category from "./pages/Category"
import NotFoundError from "./pages/NotFoundError"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import { useCartStore } from "./store/CartStore"
import PurchaseSuccess from "./pages/PurchaseSuccess"
import PurchaseCancelled from "./pages/PurchaseCancelled"
import { ThemeProvider } from "./context/ThemeContext"
import GlobalLoadingBar from "./components/GlobalLoadingBar"
import ComparisonDrawer from "./components/ComparisonDrawer"
import ProductDetails from "./pages/ProductDetails";
import AdminLayout from "./components/AdminLayout"
import AdminOverview from "./pages/admin/AdminOverview"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminSettings from "./pages/admin/AdminSettings"

function App() {
  const { isChecking, user, checkAuth } = useAuthStore();
  const { cartItems, getCartItems, syncCartToDatabase } = useCartStore();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    checkAuth();
  }, [checkAuth])

  useEffect(() => {
    getCartItems(user);
  }, [getCartItems, user]);

  // Sync guest cart to database after login
  useEffect(() => {
    if (user) {
      syncCartToDatabase(user);
    }
  }, [user, syncCartToDatabase]);

  console.log(cartItems)
  if (isChecking) {
    return <LoadingSpinner />
  }

  return (
    <ThemeProvider>
      <GlobalLoadingBar />
      <main className="relative overflow-hidden min-h-screen">
        <div className="relative z-50 pt-20">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />}></Route>
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />}></Route>
            <Route path="/category/:category" element={<Category />}></Route>
            <Route path="/cart" element={<Cart />}></Route>
            <Route path="/checkout" element={user ? <Checkout /> : <Navigate to="/signup" />}></Route>
            <Route path="/success" element={<PurchaseSuccess />}></Route>
            <Route path="/purchase-cancel" element={<PurchaseCancelled />}></Route>

            <Route path='/product/:id' element={<ProductDetails />} />

            {/* Admin Routes */}
            <Route path="/admin" element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
              <Route path="dashboard" element={<AdminOverview />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            <Route path="/*" element={<NotFoundError />}></Route>
          </Routes>
        </div>
        <ComparisonDrawer />
        <Toaster
          reverseOrder={true}
          position="bottom-center"
        />
      </main>
    </ThemeProvider>
  )
}

export default App
