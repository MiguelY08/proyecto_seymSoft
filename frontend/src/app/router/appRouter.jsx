import { Routes, Route } from 'react-router-dom'
import Sidebar from '../../Features/layouts/Sidebar.jsx';
import Home from '../../Features/landing/home/Home.jsx';
import Users from '../../Features/users/users/Users.jsx';

const AppRouter = () => {
  return (
    <div>
      {/* <Routes>
        <Routes>
          <Route path="/" element={<Sidebar/>} />
        </Routes>
      </Routes> */}

      <Routes>
        <Route path='/' element={ <Home/> } />

        <Route path='/users' element={ <Home/> } />
      </Routes>
    </div>
  );
};

export default AppRouter
