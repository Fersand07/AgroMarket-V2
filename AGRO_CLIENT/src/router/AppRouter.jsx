import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/HomeUser';
import { PrivateRoute } from './PrivateRoute';
import UserProfile from '../features/profile/Userprofile';
import Cart from '../features/cart/Cart';
import SellerHome from '../pages/SellerHome';
import OrdersPreview from '../features/order/order';
import OrderDetail from '../features/order/OrderDetail';



const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        
        <Route element={<Layout />}>
          <Route path="/home" element={ <PrivateRoute roleRequired={'user'}>
            <Home />
          </PrivateRoute>} />
          <Route path='/cart' element={ <PrivateRoute roleRequired={'user'}>
            <Cart />
          </PrivateRoute>} />
      
          <Route path="/seller/home" element={ <PrivateRoute roleRequired={'seller'}>
            <SellerHome />
          </PrivateRoute> } />


          <Route path="/profile" element={ <PrivateRoute roleRequired={['user', 'seller']}>
            <UserProfile />
          </PrivateRoute>} />
          <Route path='/orders' element={ <PrivateRoute roleRequired={['user', 'seller']}>
            <OrdersPreview />
          </PrivateRoute>} />
          <Route path='/orders/:id' element={ <PrivateRoute roleRequired={['user', 'seller']}>
            <OrderDetail />
          </PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
