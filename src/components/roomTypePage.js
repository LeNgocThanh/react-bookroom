
import axios from 'axios';
import { Table, Button, Form, Pagination, FormControl, ToastContainer, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav  } from 'react-bootstrap';
import styles_admin from '../assets/css/admin.module.css'; 
import { useNavigate } from 'react-router-dom';
import styles from '../assets/css/component.module.css';



const RoomType = () => {
  const [formRoomType, setFormRoomType] = useState({ TypeName: '', TypeDetail: '' });
  const [editingId, setEditingId] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const roomTypesPerPage = 10;
  const totalPages = Math.ceil(roomTypes.length / roomTypesPerPage);
  const currentRoomTypes = roomTypes.slice((currentPage - 1) * roomTypesPerPage, currentPage * roomTypesPerPage); 
  
  const [username, setUsername] = useState('');
 
const navigate = useNavigate();
const asideRef = useRef();
const [isSidenavVisible, setIsSidenavVisible] = useState(true);

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
        axios.get('http://103.124.92.222:6868/auth/verify-token', {
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
                console.log('Token hết hạn, vui lòng đăng nhập lại');
                navigate('/login');
              }
              else{setUsername(localStorage.getItem('username'));}
            }
          })
          .catch(() => {
            localStorage.removeItem('access_token');            
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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    const response = await axios.get('http://103.124.92.222:6868/rooms/type/all');
    setRoomTypes(response.data);
  };

  useEffect(() => {
    if (isSidenavVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isSidenavVisible]);

  const handleRoomTypeSubmit = async (event) => {
    event.preventDefault();
    if (editingId) {
      await axios.put(`http://103.124.92.222:6868/rooms/type/${editingId}`, formRoomType);
    } else {
      await axios.post('http://103.124.92.222:6868/rooms/type', formRoomType);
    }
    fetchRoomTypes();
    setShowForm(false);
  };

  const handleRoomTypeChange = (event) => {
    const { name, value } = event.target;
    setFormRoomType({ ...formRoomType, [name]: value });
  };

  const handleRoomTypeEdit = (roomType) => {
    setFormRoomType({ TypeName: roomType.TypeName, TypeDetail: roomType.TypeDetail });
    setEditingId(roomType._id);
    setShowForm(true);
  };

  const handleRoomTypeDelete = async (id) => {
    await axios.delete(`http://103.124.92.222:6868/rooms/type/${id}`);
    fetchRoomTypes();
  };

  const handleCreateNew = () => {
    setFormRoomType({ TypeName: '', TypeDetail: '' });
    setEditingId(null);
    setShowForm(true);
  };

  const handleHideForm = () => {
    setShowForm(false);
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
                <p className="name">Terry Nguyen</p>
                <p className="email">terryNguyen@amore.com</p>
              </div>
              <div className="mdc-list-group">
                <nav className="mdc-list mdc-drawer-menu">
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
      <ToastContainer />
      <h1>Loại Phòng</h1>
      <Button onClick={handleCreateNew} variant="link" className="transparent-button me-2">Tạo Mới</Button>
      {showForm && (
        <Button onClick={handleHideForm} variant="link" className="transparent-button me-2">Ẩn Form</Button>
      )}
      {showForm && (
        <Form onSubmit={handleRoomTypeSubmit} className="mb-3">
  <Table striped bordered hover responsive>
    <thead>
      <tr>
        <th>Loại phòng</th>
        <th>Thông tin</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <FormControl
            type="text"
            name="TypeName"
            value={formRoomType.TypeName}
            onChange={handleRoomTypeChange}
            placeholder="Loại Phòng"
            required
          />
        </td>
        <td>
          <FormControl
            type="text"
            name="TypeDetail"
            value={formRoomType.TypeDetail}
            onChange={handleRoomTypeChange}
            placeholder="Thông tin"
            
          />
        </td>
        <td>
          <Button type="submit" variant="link" className="transparent-button me-2">
            {editingId ? 'Sửa' : 'Tạo Mới'}
          </Button>
        </td>
      </tr>
    </tbody>
  </Table>
</Form>
      )}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Loại Phòng</th>
            <th>Thông tin</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {currentRoomTypes.map((roomType, index) => (
            <tr key={roomType._id}>
              <td>{index + 1 + (currentPage - 1) * roomTypesPerPage}</td>
              <td>{roomType.TypeName}</td>
              <td>{roomType.TypeDetail}</td>
              <td>
                <Button onClick={() => handleRoomTypeEdit(roomType)} variant="link" className="transparent-button me-2">
                  Sửa
                </Button>
                <Button onClick={() => handleRoomTypeDelete(roomType._id)} variant="link" className="transparent-button">
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Pagination>
        {[...Array(totalPages).keys()].map(number => (
          <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => handlePageChange(number + 1)}>
            {number + 1}
          </Pagination.Item>
        ))}
      </Pagination>
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

export default RoomType;