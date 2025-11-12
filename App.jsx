import { Routes, Route, useLocation } from 'react-router-dom';
import DesignerPage from './pages/customer/DesignerPage.jsx';
import AdminDashboard from './pages/shopkeeper/AdminDashboard.jsx';
import HomePage from './pages/public/HomePage.jsx';
import BrowsePage from './pages/public/BrowsePage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import MyOrdersPage from './pages/customer/MyOrdersPage.jsx';
import OrderReceiptPage from './pages/customer/OrderReceiptPage.jsx';
import ManageCakesPage from './pages/shopkeeper/ManageCakesPage.jsx';
import AnalyticsPage from './pages/shopkeeper/AnalyticsPage.jsx';
import ChatPage from './pages/shopkeeper/ChatPage.jsx';
import ChatWidget from './components/chat/ChatWidget.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AddOnsPage from './pages/customer/AddOnsPage.jsx';
import PaymentPage from './pages/customer/PaymentPage.jsx';
import TopNavbar from './components/layout/TopNavbar.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';
// --- DesignerLayout import is REMOVED ---
import OrdersPage from './pages/shopkeeper/OrdersPage.jsx';
import ReviewsPage from './pages/shopkeeper/ReviewsPage.jsx';
import SettingsPage from './pages/shopkeeper/SettingsPage.jsx';

function App() {
  const { user } = useAuth();
  const location = useLocation();

  const isOrderReceiptPage = location.pathname.startsWith('/order/');
  
  const isAdminPage = location.pathname.startsWith('/admin');
  const isLoginPage = location.pathname.startsWith('/login');
  const isRegisterPage = location.pathname.startsWith('/register');
  const isDesignerPage = location.pathname.startsWith('/designer');
  const isAddOnPage = location.pathname.startsWith('/add-ons');
  const isPaymentPage = location.pathname.startsWith('/payment');

  // Show TopNavbar if NOT admin, login, register, designer, or checkout
  const showNavbar = !isAdminPage && !isLoginPage && !isRegisterPage && !isDesignerPage && !isAddOnPage && !isPaymentPage && !isOrderReceiptPage;

  return (
    <>
      {showNavbar && <TopNavbar />}
      
      <Routes>
        {/* --- Public pages (no layout) --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* --- Customer Designer (now renders element directly) --- */}
        <Route element={<ProtectedRoute allowedRole="customer" />}>
          <Route path="/designer/:cakeId" element={<DesignerPage />} />
        </Route>
        
        {/* --- Customer pages (with TopNavbar) --- */}
        <Route path="/" element={<BrowsePage />} /> 
        <Route path="/home-old" element={<HomePage />} />
        <Route element={<ProtectedRoute allowedRole="customer" />}>
          <Route path="/my-orders" element={<MyOrdersPage />} />
          <Route path="/order/:orderId" element={<OrderReceiptPage />} />
          <Route path="/add-ons" element={<AddOnsPage />} />
          <Route path="/payment" element={<PaymentPage />} />
        </Route>

        {/* --- Admin Routes (AdminLayout) --- */}
        <Route element={<ProtectedRoute allowedRole="shopkeeper" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="manage-cakes" element={<ManageCakesPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
        
      </Routes>
      
      {/* Chat widget now only shows on the receipt page */}
      {isOrderReceiptPage && <ChatWidget />}
    </>
  );
}

export default App;