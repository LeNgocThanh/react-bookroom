import axios from 'axios';
import { Table, Button, Form, FormControl, Container, Pagination, Tabs, Tab, DropdownButton, Dropdown } from 'react-bootstrap';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React, { useState, useEffect, useRef } from 'react';
import styles_admin from '../assets/css/admin.module.css'; 
import { useNavigate } from 'react-router-dom';
import styles from '../assets/css/component.module.css';

const BookingRoomPage = () => {
  const [username, setUsername] = useState('');
  const [form, setForm] = useState({ StartBookTime: '', EndBookTime: '', RoomBook: '', Customer: '', Phone: '', Payment: '', User: username, Status: 'alive' });
  const [editingId, setEditingId] = useState(null);
  const [rooms, setRooms] = useState([]); 
  const [bookRooms, setBookRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [action, setAction] = useState('get');   
  const [originDatas, setOriginDatas] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filter, setFilter] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [roomsPerPage, setRoomsPerPage] = useState('1000');
  const [isAdmin, setIsAdmin] = useState(false);

  const [selectedStartTime, setSelectedStartTime] = useState();
  const [selectedEndTime, setSelectedEndTime] = useState();
  const [Text, setText] = useState('');
  const asideRef = useRef();
  const [isSidenavVisible, setIsSidenavVisible] = useState(true);
  const [isNumberValid, setIsNumberValid] = useState(true);
  const navigate = useNavigate();

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
                  navigate('/login');
                }
                else{
                  if(!response.data.valid){
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('username');                   
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
                localStorage.removeItem('username');         
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
    if (!action === 'edit') {
      setSelectedStartTime(new Date());      
      setSelectedEndTime(new Date());   
      setForm((prevForm) => ({ ...prevForm, StartBookTime: selectedStartTime, EndBookTime: selectedEndTime })); }
  }, [action]);

  const [isPhoneValid, setIsPhoneValid] = useState(true);

  const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/; // Kiểm tra số điện thoại có 10 chữ số
    return phoneRegex.test(phone);
  };

  const handleStartTimeChange = (date) => {    
    setSelectedStartTime(date);  
    setSelectedEndTime(date);    
    setForm((prevForm) => ({ ...prevForm, StartBookTime: date, EndBookTime: date }));
  };

  const handleEndTimeChange = (date) => {
    setSelectedEndTime(date);
    setForm((prevForm) => ({ ...prevForm, EndBookTime: date }));
  };  

  const brandRooms = rooms.filter((room) => {
    const bookRoom = bookRooms.find(br => br._id === room.RoomBook);
    return bookRoom && bookRoom.BrandName === selectedBrand;
  });

  const sortRoomByUpdateAts = brandRooms.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); 

  const totalPages = Math.ceil(brandRooms.length / roomsPerPage);  
  const currentRooms = sortRoomByUpdateAts.slice((currentPage - 1) * roomsPerPage, currentPage * roomsPerPage);
  
  const handlePageChange = (pageNumber) => {      
    setCurrentPage(pageNumber);    
  };  
  const handleRoomsPerPageChange = (number) => {
    setRoomsPerPage(number+1);
    setCurrentPage(1); // Reset to first page
  };

  useEffect(() => {    
    fetchRooms();    
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

  const fetchRooms = async () => {
    const response = await axios.get('http://103.124.92.222:6868/rooms/bookRoom-time/not-deleted');
    setRooms(response.data);
    setOriginDatas(response.data);    
  };

  const fetchBookRooms = async () => {
    const response = await axios.get('http://103.124.92.222:6868/rooms/book/all');
    const bookRoomsData = response.data;
    console.log('bookRoomsData', bookRoomsData);
    setBookRooms(bookRoomsData);

    // Extract unique BrandNames
    const brands = [...new Set(bookRoomsData.map(bookRoom => bookRoom.BrandName))];
    console.log('brands', brands);
    setUniqueBrands(brands);
    setSelectedBrand(brands[0]); // Set the first brand as the default selected brand
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { StartBookTime, EndBookTime, RoomBook, Customer, Phone, Payment, User, Status } = form;  
    console.log('form', form);  
    const bookRoom = bookRooms.find(br => br._id === form.RoomBook);
    const startDate = new Date(form.StartBookTime);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1
    const formattedDate = `${startDay}/${startMonth}`; // Lấy ngày theo định dạng yyyy-mm-dd
    const formattedTime = startDate.toTimeString().split(' ')[0].slice(0, 5); // Lấy giờ phút theo định dạng HH:mm
    const endDate = new Date(form.EndBookTime);
    const endDay = startDate.getDate();
    const endMonth = startDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1
    const formattedEndDate = `${endDay}/${endMonth}`;    
    const formattedEndTime = endDate.toTimeString().split(' ')[0].slice(0, 5);
    const payment = form.Payment/1000; // Lấy giờ phút theo định dạng HH:mm
    
    const customText = `Phòng ${bookRoom ? bookRoom.RoomNumber : ''} ${selectedBrand}\nIn ${formattedTime} ${formattedDate}- Out ${formattedEndTime} ${formattedEndDate}\n${payment}k\n${form.Phone}\n${form.Customer}`;
    setText(customText);

    if (action === 'search') {
      const searchResult = originDatas.filter((originData) => {
        let isMatch = true;        
         if (form.StartBookTime&&form.EndBookTime&&form.StartBookTime!==""&&form.EndBookTime!=="") {  
          console.log('originData.StartBookTime', originData.StartBookTime);        
           isMatch = isMatch && new Date(originData.StartBookTime) <= new Date(form.EndBookTime) && new Date(originData.EndBookTime) >= new Date(form.StartBookTime);
         }
         //startTime < bookingEnd && bookingStart < endTime
        // if (form.EndBookTime) {
        //   isMatch = isMatch && originData.EndBookTime === form.EndBookTime;
        // }
        if(form.RoomBook&&form.RoomBook!=="") {    
          console.log('originData.RoomBook', originData.RoomBook);       
          isMatch = isMatch && originData.RoomBook === form.RoomBook;
        }
        return isMatch;
      });
      setRooms(searchResult);
      return;
    }
    if (action === 'create') {
      console.log('originDatas', originDatas);
      const hasOverlap = originDatas.some((originData) => {
        return originData.RoomBook === RoomBook &&
          new Date(originData.StartBookTime) < new Date(EndBookTime) &&
          new Date(originData.EndBookTime) > new Date(StartBookTime);
      });  
      if (hasOverlap) {        
        alert('phòng đã được sử dụng trong thời gian chọn');
        return;
      }
    }
    const formattedForm = {
      ...form,
      StartBookTime: new Date(form.StartBookTime).toISOString(),
      EndBookTime: new Date(form.EndBookTime).toISOString(),
    };

    if (editingId) {
      setAction('edit');
      const hasOverlap = originDatas.some((originData) => {
        return originData.RoomBook === RoomBook &&
          new Date(originData.StartBookTime) < new Date(EndBookTime) &&
          new Date(originData.EndBookTime) > new Date(StartBookTime) && originData._id !== editingId;
      });
  
      if (hasOverlap) {
        alert('phòng đã được sử dụng trong thời gian chọn');
        return;
      }
      const timeDifference = (new Date(form.EndBookTime) - new Date(form.StartBookTime)) / (1000 * 60 * 60); // Tính khoảng cách thời gian theo giờ
   
      if (new Date(form.EndBookTime) <= new Date(form.StartBookTime)) {
        alert('Thời gian kết thúc không được nhỏ hơn hoặc bằng thời gian bắt đầu.');
        return;
      }
      await axios.put(`http://103.124.92.222:6868/rooms/bookRoom-time/${editingId}`, formattedForm);
      alert('Đã sửa thành công.');
    } else {
      const timeDifference = (new Date(form.EndBookTime) - new Date(form.StartBookTime)) / (1000 * 60 * 60); 
      // Tính khoảng cách thời gian theo giờ
      
      if (new Date(form.EndBookTime) <= new Date(form.StartBookTime)) {
        alert('Thời gian kết thúc không được nhỏ hơn hoặc bằng thời gian bắt đầu.');
        return;
      }    

      await axios.post('http://103.124.92.222:6868/rooms/bookRoom-time', formattedForm);
      alert('Đã tạo thành công.');
    }

    setForm({  StartBookTime: '', EndBookTime: '', RoomBook: '', Customer: '', Phone: '', Payment: '', User: username, Status: 'alive' });
    setEditingId(null);
    fetchRooms();       
    setShowForm(false);
  };

  const handleChange = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    if (name === 'Phone') {
      setIsPhoneValid(isValidPhoneNumber(value));
    }
    if (name === 'Payment') {
      setIsNumberValid(isValidNumber(value));
    }
  };

  const handleEdit = (room) => {
    setSelectedStartTime(new Date(room.StartBookTime));
    setSelectedEndTime(new Date(room.EndBookTime));
    setForm({
      ...room,
      StartBookTime: new Date(room.StartBookTime).toISOString().slice(0, 16),
      EndBookTime: new Date(room.EndBookTime).toISOString().slice(0, 16),
    });
    setAction('edit');    
    setEditingId(room._id);
    setShowForm(true);
  };

  const handleCopy = (room) => {
    setForm({
      ...room,
      StartBookTime: new Date(room.StartBookTime).toISOString().slice(0, 16),
      EndBookTime: new Date(room.EndBookTime).toISOString().slice(0, 16),
    });
    const bookRoom = bookRooms.find(br => br._id === room.RoomBook);
    const startDate = new Date(room.StartBookTime);
    const startDay = startDate.getDate();
    const startMonth = startDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1
    const formattedDate = `${startDay}/${startMonth}`; // Lấy ngày theo định dạng yyyy-mm-dd
    const formattedTime = startDate.toTimeString().split(' ')[0].slice(0, 5); // Lấy giờ phút theo định dạng HH:mm
    const endDate = new Date(room.EndBookTime);
    const endDay = endDate.getDate();
    const endMonth = endDate.getMonth() + 1; // Tháng trong JavaScript bắt đầu từ 0, nên cần cộng thêm 1
    const formattedEndDate = `${endDay}/${endMonth}`;    
    const formattedEndTime = endDate.toTimeString().split(' ')[0].slice(0, 5);
    const payment = room.Payment/1000;
    const textCopy = `Phòng ${bookRoom ? bookRoom.RoomNumber : ''} ${selectedBrand}\nIn ${formattedTime} ${formattedDate}- Out ${formattedEndTime} ${formattedEndDate}\n${payment ? payment : ''}k\n${room.Phone ? room.Phone : ''}\n${room.Customer ? room.Customer : ''}`;
    console.log('textCopy', textCopy);     
    setText(textCopy);
    console.log('Text', Text);
    copyToClipboard(textCopy);     
  };

  const handleDelete = async (room) => {
    console.log('room', room);
    setSelectedStartTime(new Date(room.StartBookTime));
    setSelectedEndTime(new Date(room.EndBookTime));
    setForm({
      ...room,
      StartBookTime: new Date(room.StartBookTime).toISOString(),
      EndBookTime: new Date(room.EndBookTime).toISOString(),
    });
    console.log('form', form);  
    setAction('delete'); 
    await axios.put(`http://103.124.92.222:6868/rooms/bookRoom-time/delete/${room._id}`, form);
    alert('Đã xóa thành công.');
    fetchRooms();
  };

  const handleCreateNew = () => {
    setAction('create');
    setSelectedStartTime(new Date());
    setSelectedEndTime(new Date());
    setForm({  StartBookTime: new Date(), EndBookTime: new Date(), RoomBook: '', Customer: '', Phone: '', Payment: '', User: username, Status: 'alive' });    
    setEditingId(null);
    setShowForm(true);
  };

  const handleSearchNew = () => {
    setForm({  StartBookTime: '', EndBookTime: '', RoomBook: '', Customer: '', Phone: '', Payment: '', User: username, Status: 'alive'  });
    setAction('search');
    setEditingId(null);
    setShowForm(true);
  };

  const handleClearSearch = () => {
    setRooms(originDatas);
    setForm({  StartBookTime: '', EndBookTime: '', RoomBook: '', Customer: '', Phone: '', Payment: '', User: username  });
    setAction('get');
    setShowForm(false);
  };

  const handleHideForm = () => {
    setShowForm(false);
  }; 

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedRooms = [...currentRooms].sort((a, b) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'RoomNumber') {
        const aBookRoom = bookRooms.find(br => br._id === a.RoomBook);
        const bBookRoom = bookRooms.find(br => br._id === b.RoomBook);
        aValue = aBookRoom ? aBookRoom.RoomNumber : '';
        bValue = bBookRoom ? bBookRoom.RoomNumber : '';
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredRooms = sortedRooms.filter((room) => {
    const bookRoom = bookRooms.find(br => br._id === room.RoomBook);
    if (!bookRoom) {
      return;
    }
    const roomName = bookRoom ? `${bookRoom.BrandName} - ${bookRoom.RoomNumber}` : '';
    return roomName.toLowerCase().includes(filter.toLowerCase()) 
    // && bookRoom.BrandName === selectedBrand;
  });

  const exportToCSV = () => {
    const csvData = filteredRooms.map((room, index) => {
      const bookRoom = bookRooms.find(br => br._id === room.RoomBook);
      const formattedStartBookTime = format(new Date(room.StartBookTime), 'yyyy-MM-dd HH:mm');
      const formattedEndBookTime = format(new Date(room.EndBookTime), 'yyyy-MM-dd HH:mm');
      return {
        'STT': index + 1,
        'Phòng': bookRoom ? `${bookRoom.RoomNumber}` : '',
        'Thời gian Bắt đầu': formattedStartBookTime,
        'Thời gian Kết thúc': formattedEndBookTime,
        'Khách': room.Customer,
        'Điện thoại': room.Phone,
        'Thanh toán': room.Payment,
        'Người tạo': room.User,
      };
    });
    return csvData;
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(exportToCSV());
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BookingRoomTime');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'BookingRoomTime.xlsx');
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';  // Tránh việc textarea bị cuộn ra ngoài khung nhìn
    textArea.style.opacity = '0';  // Làm cho textarea vô hình
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'Đã sao chép vào clipboard' : 'Không thể sao chép vào clipboard';
      alert(msg);
    } catch (err) {
      console.error('Không thể sao chép vào clipboard', err);
    }
  
    document.body.removeChild(textArea);
  };

  const isValidNumber = (value) => {
    return /^\d+$/.test(value); // Kiểm tra xem giá trị có phải là số
  };
  
  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value) + ' đ'; // Định dạng số và thêm 'đ'
  };

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
    <Container fluid>
      <h1>Lịch sử đặt phòng {selectedBrand}</h1>
      <Tabs
          id="brand-tabs"
          activeKey={selectedBrand}
          onSelect={handleBrandChange}
        >
          {uniqueBrands.map((brand) => (
            <Tab eventKey={brand} title={brand} key={brand} >
              {/* Content for each tab can go here if needed */}
            </Tab>
          ))}
        </Tabs>
      <div style={{ marginBottom: '16px' }}>
        <Button onClick={handleCreateNew} variant="link" className="transparent-button me-2">Tạo mới</Button>
                 
          <Button onClick={() => copyToClipboard(Text)} variant="link" className="transparent-button">Sao chép thông tin</Button>
        
         <Button onClick={handleSearchNew} variant="link" className="transparent-button">Tìm kiếm</Button>  
        {showForm && action === 'search' && (
          <Button onClick={handleClearSearch}>Xóa Tìm kiếm</Button>   
        )} 
        {showForm && (
          <Button onClick={handleHideForm} variant="link" className="transparent-button me-2">Ẩn Form</Button>
        )}
        {showForm && (
          <Form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
          <div className="table-responsive">
  <div className="d-flex flex-column">
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Phòng</div>
      <div className="p-2 flex-grow-1">
        <FormControl as="select" name="RoomBook" value={form.RoomBook} onChange={(e) => handleChange('RoomBook', e.target.value)} required={action !== 'search'}  style={{ backgroundColor: 'white', borderRadius: '5px' }}>
          <option value="" disabled>Chọn phòng</option>
          {bookRooms
            .filter(bookRoom => bookRoom.BrandName === selectedBrand)
            .map((bookRoom) => (
              <option key={bookRoom._id} value={bookRoom._id}>
                {bookRoom.RoomNumber}
              </option>
            ))}
        </FormControl>
      </div>
    </div>
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Thời gian Bắt đầu</div>
      <div className="p-2 flex-grow-1">
        <DatePicker
          selected={selectedStartTime}
          onChange={handleStartTimeChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={5}
          dateFormat="dd-MM HH:mm"
          placeholderText="StartBookTime"
          required={action !== 'search'}
        />
      </div>
    </div>
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Thời gian Kết thúc</div>
      <div className="p-2 flex-grow-1">
        <DatePicker
          selected={selectedEndTime}
          onChange={handleEndTimeChange}
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={5}
          dateFormat="dd-MM HH:mm"
          placeholderText="EndBookTime"
          required={action !== 'search'}
        />
      </div>
    </div>
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Khách</div>
      <div className="p-2 flex-grow-1">
        <FormControl
          name="Customer"
          value={form.Customer}
          onChange={(e) => handleChange('Customer', e.target.value)}
          placeholder="Khách"
          style={{ backgroundColor: 'white', borderRadius: '5px' }}
        />
      </div>
    </div>
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Điện thoại</div>
      <div className="p-2 flex-grow-1">
        <FormControl
          name="Phone"
          value={form.Phone}
          onChange={(e) => handleChange('Phone', e.target.value)}
          placeholder="Điện thoại"
          style={{ backgroundColor: 'white', borderRadius: '5px' }}
        />
      </div>
    </div>
    {!isPhoneValid && <div className="text-danger">Số điện thoại không hợp lệ</div>}
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Thanh toán</div>
      <div className="p-2 flex-grow-1">
        <FormControl
          name="Payment"
          value={form.Payment}
          onChange={(e) => handleChange('Payment', e.target.value)}
          placeholder="Thanh Toán"
          style={{ backgroundColor: 'white', borderRadius: '5px' }}
        />
      </div>
    </div>
    {!isNumberValid && <div className="text-danger">Số tiền Thanh toán không hợp lệ</div>}
    <div className="d-flex align-items-center">
      <div className={`p-2 fw-bold ${styles.labelWidth}`}>Hành động</div>
      <div className="p-2 flex-grow-1">
        <Button type="submit" variant="link" className="transparent-button me-2" disabled={!isPhoneValid||(!isNumberValid)}>
          {action === 'search' ? 'Tìm Kiếm' : (editingId ? 'Sửa' : 'Tạo')}
        </Button>
      </div>
    </div>
  </div>
</div>
          </Form>
        )}
        <FormControl
          type="text"
          placeholder="Filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginBottom: '16px', backgroundColor: '#f0f0f0', border: '1px solid #000', borderRadius: '5px'  }}
        />
         <div className="export-buttons">
        {/* <CSVLink data={exportToCSV()} filename="BookingRoomTime.csv" variant="link" className="transparent-button">
          Export to CSV
        </CSVLink> */}
        <Button onClick={exportToExcel} variant="link" className="transparent-button">
          Export to Excel
        </Button>        
      </div>   
      
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>STT</th>
              <th onClick={() => handleSort('RoomNumber')}>Phòng</th>
              <th onClick={() => handleSort('StartBookTime')}>Thời gian Bắt đầu</th>
              <th onClick={() => handleSort('EndBookTime')}>Thời gian Kết thúc</th>   
              <th>Khách</th>
                  <th>Điện thoại</th>
                  <th>Thanh toán</th>    
                  <th>Người tạo</th> 
                  <th onClick={() => handleSort('UpdatedAt')}>Thời gian tạo</th>      
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room, index) => {
              const bookRoom = bookRooms.find(br => br._id === room.RoomBook);
              const formattedStartBookTime = format(new Date(room.StartBookTime), 'yyyy-MM-dd HH:mm');
              const formattedEndBookTime = format(new Date(room.EndBookTime), 'yyyy-MM-dd HH:mm');
              const UpdatedAt = format(new Date(room.updatedAt), 'yyyy-MM-dd HH:mm');
              const paymentFormatted = formatNumber(room.Payment);
              return (
                <tr key={room._id}>
                  <td>{index + 1}</td>
                  <td>{bookRoom ? `${bookRoom.RoomNumber}` : ''}</td>
                  <td>{formattedStartBookTime}</td>
                  <td>{formattedEndBookTime}</td>  
                  <td>{room.Customer}</td>
                  <td>{room.Phone}</td>
                  <td>{paymentFormatted === 'NaN đ' ? '' : paymentFormatted}</td>    
                  <td>{room.User}</td>  
                  <td>{UpdatedAt}</td>           
                  <td>
                    <Button onClick={() => handleEdit(room)} variant="link" className="transparent-button me-2">Cập Nhật</Button>
                    <Button onClick={() => handleDelete(room)} variant="link" className="transparent-button">Xóa</Button>
                    <Button onClick={() => handleCopy(room)} variant="link" className="transparent-button me-2">Copy</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        
        <Pagination className="mt-3">
        <Pagination.First onClick={() => handlePageChange(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />  
        {[...Array(totalPages).keys()].map((page) => (
          <Pagination.Item key={page + 1} active={page + 1 === currentPage} onClick={() => handlePageChange(page + 1)}>
            {page + 1}
          </Pagination.Item>
        ))}          
        <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}/>
        <Pagination.Last onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
      <DropdownButton id="dropdown-basic-button" title={`Số lượng mỗi trang: ${roomsPerPage-1}`} className="mb-3">
        <Dropdown.Item onClick={() => handleRoomsPerPageChange(5)}>5</Dropdown.Item>
        <Dropdown.Item onClick={() => handleRoomsPerPageChange(10)}>10</Dropdown.Item>
        <Dropdown.Item onClick={() => handleRoomsPerPageChange(20)}>20</Dropdown.Item>
        <Dropdown.Item onClick={() => handleRoomsPerPageChange(rooms.length)}>{rooms.length}</Dropdown.Item>
      </DropdownButton> 
      </div>
    </Container>
    </main>       
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
    </div>
  );
};

export default BookingRoomPage;