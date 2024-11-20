import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Login from './pages/login';
import RoomBrandPage from './components/roomBrandPage';
import './assets/css/material-dashboard.css';
import './assets/css/demo/style.css';
import RoomPage from './components/roomPage';
import RoomType from './components/roomTypePage';
import RoomPricePage from './components/roomPricePage';
import BookingTypePage from './components/bookingTypePage';
import BookingRoomPage from './components/bookingRoomPage';
import BookingTimeReportPage from './components/bookingTimeReportPage';

function App() {
  return (
    <Router>
    <Routes>
    <Route path="/" element={<Login />} />   
    <Route path="/login" element={<Login />} /> 
    <Route path="/roomBrand" element={<RoomBrandPage />} /> 
    <Route path="/room" element={<RoomPage />} /> 
    <Route path="/roomType" element={<RoomType />} />    
    <Route path="/roomPrice" element={<RoomPricePage />} /> 
    <Route path="/bookingType" element={<BookingTypePage />} />
    <Route path="/bookingRoom" element={<BookingRoomPage />} />
    <Route path="/bookingTimeReport" element={<BookingTimeReportPage />} />
    </Routes>
  </Router>
  );
}

export default App;
