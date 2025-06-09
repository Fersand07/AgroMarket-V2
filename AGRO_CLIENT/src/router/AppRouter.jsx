import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/Layout';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Home from '../pages/Home';
import { PrivateRoute } from './PrivateRoute';



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
          
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
