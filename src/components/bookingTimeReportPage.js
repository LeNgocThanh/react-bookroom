import { Grid, Paper, TextField, Tabs, Tab } from '@mui/material';
import { TimeLine, TimeLine2day, TimeLine3day } from './TimeLine';
import axios from 'axios';
import { Table, Button, Form, FormControl, Container, Pagination, DropdownButton, Dropdown } from 'react-bootstrap';
import { format, subDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav  } from 'react-bootstrap';
import styles_admin from '../assets/css/admin.module.css'; 
import { useNavigate } from 'react-router-dom';
import styles from '../assets/css/component.module.css';
import { ToastContainer, toast } from 'react-toastify';

const BookingTimeReportPage = () => {
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [timeClean, setTimeClean] = useState(0);
  const [bookRooms, setBookRooms] = useState([]);
  const [groupedBookings, setGroupedBookings] = useState({});
  const [selectedBrand, setSelectedBrand] = useState('');
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [username, setUsername] = useState('');
   const navigate = useNavigate();
  const asideRef = useRef();
  const [isSidenavVisible, setIsSidenavVisible] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setIsSidenavVisible(false);
    }
  }, []);
  
    const toggleSidenav = () => {
      setIsSidenavVisible(!isSidenavVisible);
    };
    const handleClose = () => setIsSidenavVisible(false);
    
  
    useEffect(() => {
      function handleClickOutside(event) {
        if (asideRef.current && !asideRef.current.contains(event.target)) {
          setIsSidenavVisible(false);
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);  
      
      useEffect(() => {
        const checkToken = () => {
          const token = localStorage.getItem('access_token');
          if (!token) {            
            navigate('/login');
          } else {
            axios
              .get('http://103.124.92.222:6868/auth/verify-token', {
                params: {
                  token: token,
                },
              })
              .then((response) => {                       
                if (response.status !== 200) {
                  localStorage.removeItem('access_token');
                  localStorage.removeItem('username');
                  window.alert('Vui lòng đăng nhập lại.');
                  navigate('/login');
                }
                else{
                  if(!response.data.valid){
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('username');
                    window.alert('Vui lòng đăng nhập lại.');
                    navigate('/login');
                  }
                  else{
                    setUsername(localStorage.getItem('username'));
                  setIsAdmin(localStorage.getItem('username') === 'admin');
                  }
                }
              })
              .catch(() => {
                localStorage.removeItem('access_token');   
                window.alert('Vui lòng đăng nhập lại.');         
                navigate('/login');
              });
          }
        };    
    
        // Kiểm tra token ngay khi component được mount
        checkToken();    
        // Thiết lập interval để kiểm tra token mỗi 60 phút (3600000 ms)
        const intervalId = setInterval(checkToken, 1800000);
    
        // Dọn dẹp interval khi component bị unmount
        return () => clearInterval(intervalId);
      }, []);   
    const handleLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('username');
      navigate('/login');
    };

  useEffect(() => {
    fetchBookRooms();
  }, []);

  useEffect(() => {
    if (isSidenavVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSidenavVisible]);
  
  const fetchBookRooms = async () => {
    const response = await axios.get('http://103.124.92.222:6868/rooms/book/all');
    setBookRooms(response.data);
    const bookRoomsData = response.data;
    const brands = [...new Set(bookRoomsData.map(bookRoom => bookRoom.BrandName))];
    setUniqueBrands(brands);
    setSelectedBrand(brands[0]);
  };

  const handleSearch = async () => {
    const timeDifference = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60); // Tính khoảng cách thời gian theo giờ

    if (timeDifference > 72) {
      alert('Khoảng thời gian tìm kiếm không được vượt quá 72 giờ.');
      return;
    }

    if (new Date(endTime) < new Date(startTime)) {
      alert('Thời gian kết thúc không được nhỏ hơn thời gian bắt đầu.');
      return;
    }

    const response = await axios.get('http://103.124.92.222:6868/rooms/bookRoom-time/all');

    const adjustedBookings = response.data.map(booking => {
      //+- timeClean    
      booking.StartBookTime = new Date(new Date(booking.StartBookTime).getTime() - timeClean * 60000);
      booking.EndBookTime = new Date(new Date(booking.EndBookTime).getTime() + timeClean * 60000);
      return booking;
    });
    console.log('adjustedBookings', adjustedBookings);
    const filteredBookings = adjustedBookings.filter(booking => {
      const bookingStart = new Date(booking.StartBookTime);
      const bookingEnd = new Date(booking.EndBookTime);
      return startTime < bookingEnd && bookingStart < endTime;
    });
    console.log('filteredBookings', filteredBookings);
    const grouped = bookRooms.filter(room => room.BrandName === selectedBrand)
      .sort((a, b) => a.RoomNumber.localeCompare(b.RoomNumber))
      .reduce((acc, room) => {
        const roomBookings = filteredBookings.filter(booking => booking.RoomBook === room._id)
          .sort((a, b) => new Date(a.StartBookTime) - new Date(b.StartBookTime)); // Sort by StartBookTime
        acc[room._id] = roomBookings.length > 0 ? roomBookings : [{ StartBookTime: startTime, EndBookTime: endTime, status: 'unused' }];
        return acc;
      }, {});
      // Thêm trạng thái 'used' cho tất cả các phòng
  Object.keys(grouped).forEach(roomId => {
    grouped[roomId] = grouped[roomId].map(booking => ({
      ...booking,
      status: booking.status || 'used'
    }));
  });
      setGroupedBookings(grouped);    
  };
  const handleBrandChange = (event, newValue) => {
    setSelectedBrand(newValue);
  };

  const calculatePosition = (time, start, end) => {
    const totalDuration = end - start;
    const timeOffset = time - start;
    return (timeOffset / totalDuration) * 100;
  };

  const isMultiDay = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (endDate - startDate) > 24 * 60 * 60 * 1000;
  };

  const daySub = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return Math.round((endDate - startDate) / (24* 60 * 60 * 1000));
  }

  const dayDifference = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return (endDate - startDate) / (60 * 60 * 1000);
  }
  
  return (
    <div>   
    <div className="body-wrapper">
    {isSidenavVisible && (
      <aside className="mdc-drawer mdc-drawer--dismissible mdc-drawer--open" onHide={handleClose} ref={asideRef}>
            <div className="mdc-drawer__header">
              <a href="index.html" className="brand-logo">
                <img src="./Amore.jpg" alt="logo" className={styles_admin.logoSmall} />
              </a>
            </div>
          <div className="mdc-drawer__content">
              <div className="user-info">
                <p className="name">{username}</p>
                <Button className="email" onClick={handleLogout}>LogOut</Button>
              </div>
              <div className="mdc-list-group">
                <nav className="mdc-list mdc-drawer-menu">
                 {isAdmin && (<div>
                  <div className="mdc-list-item mdc-drawer-item">
                    <a className="mdc-drawer-link" onClick={() => navigate('/roomBrand')}>
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        home
                      </i>
                      Cơ sở
                    </a>
                  </div>
                  <div className="mdc-list-item mdc-drawer-item">
                    <a className="mdc-drawer-link" onClick={() => navigate('/bookingType')}>
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        track_changes
                      </i>
                      Loại gói
                    </a>
                  </div>
                  <div className="mdc-list-item mdc-drawer-item">
                    <a
                      className="mdc-expansion-panel-link"
                      onClick={() => navigate('/room')}
                      data-toggle="expansionPanel"
                      data-target="ui-sub-menu"
                    >
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        dashboard
                      </i>
                      Phòng
                    </a>
                    <div className="mdc-expansion-panel" id="ui-sub-menu">
                      <nav className="mdc-list mdc-drawer-submenu">
                        <div className="mdc-list-item mdc-drawer-item">
                          <a
                            className="mdc-drawer-link"
                            href="pages/ui-features/buttons.html"
                          >
                            Buttons
                          </a>
                        </div>
                        <div className="mdc-list-item mdc-drawer-item">
                          <a
                            className="mdc-drawer-link"
                            href="pages/ui-features/typography.html"
                          >
                            Typography
                          </a>
                        </div>
                      </nav>
                    </div>
                  </div>
                  <div className="mdc-list-item mdc-drawer-item">
                    <a
                      className="mdc-drawer-link"
                      onClick={() => navigate('/roomType')}
                    >
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        grid_on
                      </i>
                      Loại phòng
                    </a>
                  </div>
                  <div className="mdc-list-item mdc-drawer-item">
                    <a className="mdc-drawer-link" onClick={() => navigate('/roomPrice')}>
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        pie_chart_outlined
                      </i>
                      Giá gói
                    </a>
                  </div>
                  </div>
                  )}
                  <div className="mdc-list-item mdc-drawer-item">
                    <a
                      className="mdc-expansion-panel-link"
                      onClick={() => navigate('/bookingRoom')}
                      data-toggle="expansionPanel"
                      data-target="sample-page-submenu"
                    >
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        pages
                      </i>
                      Đặt phòng
                    </a>
                  </div>
                  <div className="mdc-list-item mdc-drawer-item">
                    <a
                      className="mdc-drawer-link"
                      onClick={() => navigate('/bookingTimeReport')}
                      target="_blank"
                    >
                      <i
                        className="material-icons mdc-list-item__start-detail mdc-drawer-item-icon"
                        aria-hidden="true"
                      >
                        description
                      </i>
                      Báo cáo đặt phòng
                    </a>
                  </div>
                </nav>
              </div>
              <div className="mdc-card premium-card">
                <div className="d-flex align-items-center">
                  <div className="mdc-card icon-card box-shadow-0">
                    <i className="mdi mdi-shield-outline" />
                  </div>
                  <div>
                    <p className="mt-0 mb-1 ml-2 font-weight-bold tx-12">
                      Amore House
                    </p>
                    <p className="mt-0 mb-0 ml-2 tx-10">Chill and relax</p>
                  </div>
                </div>
                <p className="tx-8 mt-3 mb-1">Khách đến và đi với sự hài lòng.</p>
                <p className="tx-8 mb-3">Chỉ từ 52k/h.</p>
                <a
                  href="https://www.facebook.com/amorehousehomestay"
                  target="_blank"
                >
                  <span className="mdc-button mdc-button--raised mdc-button--white">
                    Đặt phòng ngay
                  </span>
                </a>
              </div>
            </div>
    </aside>
    )}
     <div className="main-wrapper mdc-drawer-app-content">
     
     <header className="mdc-top-app-bar">
       <div className="mdc-top-app-bar__row">
         <div className="mdc-top-app-bar__section mdc-top-app-bar__section--align-start">
           <button className="material-icons mdc-top-app-bar__navigation-icon mdc-icon-button sidebar-toggler" onClick={toggleSidenav}>
             menu
           </button>           
           <span className="mdc-top-app-bar__title">Amore House!</span>        
         </div>
         <div className="mdc-top-app-bar__section mdc-top-app-bar__section--align-end mdc-top-app-bar__section-right">
           <div className="menu-button-container menu-profile d-none d-md-block">
             <button className="mdc-button mdc-menu-button">
               <span className="d-flex align-items-center">
                 <span className="figure">
                   <img
                     src="../assets/images/faces/face1.jpg"
                     alt="user"
                     className="user"
                   />
                 </span>
                 <span className="user-name">{username}</span>
               </span>
             </button>
             <div className="mdc-menu mdc-menu-surface" tabIndex={-1}>
               <ul
                 className="mdc-list"
                 role="menu"
                 aria-hidden="true"
                 aria-orientation="vertical"
               >                
               </ul>
             </div>
           </div>
           <div className="divider d-none d-md-block" />          
         </div>
       </div>
     </header>
    <div className="page-wrapper mdc-toolbar-fixed-adjust">
        <main className="content-wrapper"> 
      <Tabs
        value={selectedBrand}
        onChange={handleBrandChange}
        aria-label="brand tabs"
      >
        {uniqueBrands.map((brand) => (
          <Tab label={brand} value={brand} key={brand} className={selectedBrand === brand ? styles.tabSelected : styles.tab} />
        ))}
      </Tabs>
      <div className="container mt-4" >
  <div className="row align-items-center">
    <div className="col-12 col-sm-6 col-md-3">
      <div className={styles.datePickerContainer}>
      <label className={styles.datePickerLabel}>Thời gian Chuẩn bị</label>
        <input
          id="timeClean"
          type="number"
          className="form-control fw-bold"
          value={timeClean}
          onChange={(e) => setTimeClean(Number(e.target.value))}
        />
      </div>
    </div>
    {/* <div className="col-12 col-sm-12 col-md-6">
      <div className={styles.datePickerContainer}>
        <label className={styles.datePickerLabel}>Thời gian Bắt đầu</label>
        <DatePicker
          selected={startTime}
          onChange={(date) => {
            const newStartTime = new Date(date);
            newStartTime.setHours(0, 0, 0, 0);
            setStartTime(newStartTime);
          }}
          dateFormat="yyyy-MM-dd"
          className="form-control fw-bold"
        />
      </div>   
      <div className={styles.datePickerContainer}>
        <label className={styles.datePickerLabel}>Thời gian kết thúc</label>
        <DatePicker
          selected={endTime}
          onChange={(date) => {
            const newEndTime = new Date(date);
            newEndTime.setHours(23, 59, 59, 999);
            setEndTime(newEndTime);
          }}
          dateFormat="yyyy-MM-dd"
          className="form-control fw-bold"
        />
      </div>    
    </div> */}
    <div className="col-12">
  <div className="row">
    <div className="col-6">
      <div className={styles.datePickerContainer}>
        <label className={styles.datePickerLabel}>Thời gian Bắt đầu</label>
        <DatePicker
          selected={startTime}
          onChange={(date) => {
            const newStartTime = new Date(date);
            newStartTime.setHours(0, 0, 0, 0);
            setStartTime(newStartTime);
          }}
          dateFormat="yyyy-MM-dd"
          className="form-control fw-bold"
        />
      </div>
    </div>
    <div className="col-6">
      <div className={styles.datePickerContainer}>
        <label className={styles.datePickerLabel}>Thời gian kết thúc</label>
        <DatePicker
          selected={endTime}
          onChange={(date) => {
            const newEndTime = new Date(date);
            newEndTime.setHours(23, 59, 59, 999);
            setEndTime(newEndTime);
          }}
          dateFormat="yyyy-MM-dd"
          className="form-control fw-bold"
        />
      </div>
    </div>
  </div>
</div>
    <div className="col-12 col-sm-6 col-md-3">
      <button className="btn btn-link transparent-button me-2" onClick={handleSearch}>
        Tìm Kiếm
      </button>
    </div>
  </div>
</div>
      <Paper style={{ marginTop: '5px', padding: '10px' }}>
        <div className={styles.legend}>
          <div className={styles.legendSquare}></div>
          <span className={styles.legendLabel}>Chưa sử dụng</span>
        </div>
        <div className={styles.timelineWrapper}>       
          {!isMultiDay(startTime, endTime) ? <TimeLine/> : (daySub(startTime, endTime) <= 2 ? <TimeLine2day/> : <TimeLine3day/>)}          
          {Object.keys(groupedBookings).map((room, index) => {
            const bookRoom = bookRooms.find(br => br._id === room);
            const roomName = bookRoom ? `${bookRoom.RoomNumber}` : room;
            return (
              <div key={index} >
                <div className={`${styles.roomName} ${styles.roomNameFix}`}>{roomName}</div>
                <div className={!isMultiDay(startTime, endTime) ? styles.timelineContainer : (daySub(startTime, endTime) <=2 ? styles.timelineContainer2Day : styles.timelineContainer3Day)}>
                  {groupedBookings[room].map((booking, idx, arr) => {
                    const bookingStart = new Date(booking.StartBookTime);
                    const bookingEnd = new Date(booking.EndBookTime);
                    const left = calculatePosition(bookingStart, startTime, endTime);
                    const width = calculatePosition(bookingEnd, startTime, endTime) - left;
                    const nextBookingStart = arr[idx + 1] ? new Date(arr[idx + 1].StartBookTime) : endTime;
                    const unusedLeft = calculatePosition(bookingEnd, startTime, endTime);
                    const unusedWidth = calculatePosition(nextBookingStart, startTime, endTime) - unusedLeft;
                    const timeFirstUnusedWidth = dayDifference(startTime, booking.StartBookTime);
                    const lastUsedWidth = 100 - left;

                    // Calculate the unused time slot from startTime to bookingStart
                    const firstUnusedWidth = idx === 0 ? calculatePosition(bookingStart, startTime, endTime) : 0;
                                        
                    return (
                      <React.Fragment key={idx}>
                        {booking.status === 'unused' && bookingStart.getTime() === startTime.getTime() && endTime.getTime() === bookingEnd.getTime() && (
                        <div className={styles.timelineBarUnused}
                        style={{ left: '0%', width: '100%' }}
                        >
                        <div className={styles.usedTimeContainer}>
                          <span className={styles.unusedTimeLabel}>
                            {startTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}-{endTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.unusedTimeLabel}>
                            {startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {endTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                        </div>
                        )}
                         {firstUnusedWidth > 0 && (
                          <div
                            className={(timeFirstUnusedWidth > 1) ? styles.timelineBarUnused : styles.timelineBarUnusedShort}
                            style={{ left: '0%', width: `${firstUnusedWidth}%` }}
                            title={`${startTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} ${startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(booking.StartBookTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${new Date(booking.StartBookTime).toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}`}
                          >
                          { (firstUnusedWidth >= (100/(12*daySub(startTime,endTime)))) 
                          && (
                          <div className={styles.usedTimeContainer}>
                          <span className={styles.unusedTimeLabel}>
                            {startTime.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}-{new Date(booking.StartBookTime).toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.unusedTimeLabel}>
                            {startTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(booking.StartBookTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          )}
                          </div>
                        )}                         
                        {unusedWidth > 0 && (
                          <div
                            className={styles.timelineBarUnused}
                            style={{ left: `${unusedLeft}%`, width: `${unusedWidth}%` }}
                            title={`${bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} ${bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${nextBookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${nextBookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}`}
                          >
                          {(unusedWidth >= (100/(12*daySub(startTime,endTime)))) && (
                          <div className={styles.usedTimeContainer}>
                          <span className={styles.usedTimeLabel}>
                            {bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}-{nextBookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.unusedTimeLabel}>
                            {bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {nextBookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          )}
                          </div>
                        )}   
                       {startTime >= bookingStart && startTime <= bookingEnd && endTime >= bookingEnd && (booking.status === 'used') && (
                          <div
                            className={styles.timelineBar}
                            style={{ left: '0%', width: `${calculatePosition(bookingEnd, startTime, endTime)}%` }}
                            title={`${bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} ${bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}`}
                          >
                          {(calculatePosition(bookingEnd, startTime, endTime)>=(100/(12*daySub(startTime,endTime)))) && (
                          <div className={styles.usedTimeContainer}>
                            <span className={styles.usedTimeLabel}>
                            {bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} - {bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.usedTimeLabel}>
                            {bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                            </span>
                          </div>
                          )}
                          </div>
                        )} 
                        {startTime <= bookingStart && endTime >= bookingEnd && (booking.status === 'used') && (
                          <div
                            className={styles.timelineBar}
                            style={{ left: `${left}%`, width: `${width}%` }}
                            title={`${bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} ${bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}`}
                          >
                          {(width >= (100/(12*daySub(startTime,endTime)))) && (
                          <div className={styles.usedTimeContainer}>
                            <span className={styles.usedTimeLabel}>
                            {bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} - {bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.usedTimeLabel}>
                             {bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} 
                            </span>
                            </div>
                          )}
                          </div>                          
                        )}
                        {endTime <=  bookingEnd && endTime >= bookingStart && startTime <= bookingStart && (booking.status === 'used') && (
                          <div
                            className={styles.timelineBar}
                            style={{ left: `${left}%`, width: `${lastUsedWidth}%` }}
                            title={`${bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} ${bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}`}
                          >
                          {(lastUsedWidth >= (100/(12*daySub(startTime,endTime))))  && (
                           <div className={styles.usedTimeContainer}>
                           <span className={styles.usedTimeLabel}>
                            {bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}-{bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.usedTimeLabel}>
                           {bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            </div>
                          )}
                          </div>
                        )}
                          { endTime <=  bookingEnd && startTime >= bookingStart && (booking.status === 'used') && (
                          <div
                            className={styles.timelineBar}
                            style={{ left: '0%', width: '100%' }}
                            title={`${bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })} ${bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} ${bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}`}
                          >
                          <div className={styles.usedTimeContainer}>
                          <span className={styles.usedTimeLabel}>
                            {bookingStart.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}-{bookingEnd.toLocaleDateString('en-GB', { month: '2-digit', day: '2-digit' })}
                            </span>
                            <span className={styles.usedTimeLabel}>
                            {bookingStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })} - {bookingEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                          </div>
                          </div>
                        )}                        
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Paper>
    
    </main>  
    </div>     
        <footer>
          <div className="mdc-layout-grid">
            <div className="mdc-layout-grid__inner">
              <div className="mdc-layout-grid__cell stretch-card mdc-layout-grid__cell--span-6-desktop">
                <span className="text-center text-sm-left d-block d-sm-inline-block tx-14">
                  sản phẩm của{" "}
                  <a href="https://www.facebook.com/amorehousehomestay" target="_blank">
                    AmoreHouse{" "}
                  </a>
                  2024
                </span>
              </div>
              <div className="mdc-layout-grid__cell stretch-card mdc-layout-grid__cell--span-6-desktop d-flex justify-content-end">
                <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center tx-14">
                 Born{" "}
                  <a
                    href="https://www.facebook.com/amorehousehomestay"
                    target="_blank"
                  >
                    {" "}
                    with love{" "}
                  </a>{" "}
                  dịch vụ tốt, giá cả hợp lý
                </span>
              </div>
            </div>
          </div>
        </footer>      
      </div>
     </div>
    </div>    
  );
};
export default BookingTimeReportPage;