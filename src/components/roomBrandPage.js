import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Button, Container, Offcanvas, OffcanvasHeader, OffcanvasBody,Table, Form } from 'react-bootstrap';
import styles_admin from '../assets/css/admin.module.css'; 
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../assets/css/component.module.css'; 


const RoomBrandPage = () => {
  const [form, setForm] = useState({ BrandName: '', Address: '', GoogleMapUrl: '', imageDetail: '' });
  const [editingId, setEditingId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [oldBrandName, setOLdBrandName] = useState('');
  const [action, setAction] = useState('get');
  const [showForm, setShowForm] = useState(false);
  const [expandedRows, setExpandedRows] = useState([]);
  const [originRooms, setOriginRooms] = useState([]);  
  const navigate = useNavigate();
  const [username, setUsername] = useState('');  
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
// useEffect(() => {
//     const win = navigator.platform.indexOf('Win') > -1;
//     if (win && document.querySelector('#sidenav-scrollbar')) {
//       const options = { damping: '0.5' };
//       Scrollbar.init(document.querySelector('#sidenav-scrollbar'), options);
//     }
//   }, []);  

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
                  console.log('Token hết hạn, vui lòng đăng nhập lại');
                  navigate('/login');
                }
                else{
                  setUsername(localStorage.getItem('username'));
                }
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
    
    useEffect(() => {
      if (isSidenavVisible) {
        const timer = setTimeout(() => {
          handleClose();
        }, 4000);
  
        return () => clearTimeout(timer);
      }
    }, [isSidenavVisible]);

   const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    navigate('/login');
  };  

  useEffect(() => {
    fetchRooms();  
  }, []);

  const fetchRooms = async () => {
    const response = await axios.get(`http://103.124.92.222:6868/rooms`);
    setRooms(response.data);
    setOriginRooms(response.data);    
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    let result;
    try {      
      if(action === 'search') {        
        const filteredRooms = originRooms.filter((originRoom) => {
          let isMatch = true;
          if (form.BrandName) {
            isMatch = isMatch && originRoom.BrandName === form.BrandName;
          }
          if (form.Address) {
            isMatch = isMatch && originRoom.Address === form.Address;
          }
          if (form.GoogleMapUrl) {
            isMatch = isMatch && originRoom.GoogleMapUrl === form.GoogleMapUrl;
          }                    
          return isMatch;
        });
        setRooms(filteredRooms);
        return;
      }
      if (editingId) {        
        if (oldBrandName !== form.BrandName) {
          const confirmUpdate = window.confirm('cập nhật Brand Name ở đây sẽ cập nhật lại cả ở RoomBook bạn có muốn cập nhật?');
          if (confirmUpdate) {
            setAction('update');
            console.log('oldBrandName', oldBrandName, 'BrandName', form.BrandName);
            result = await axios.put(`http://103.124.92.222:6868/rooms/book/roomBrand/${oldBrandName}`, { BrandName: form.BrandName });
            console.log('result change BookRoom', result);
            result = await axios.put(`http://103.124.92.222:6868/rooms/${editingId}`, form); 
            toast.success('Room update RoomBrand, RoomBook successfully!');
            fetchRooms();
            setShowForm(false);
            return;
          } else {
            return;
          }
        } else {          
          result = await axios.put(`http://103.124.92.222:6868/rooms/${editingId}`, form); 
        } 
        console.log('result update BookRoom', result); 
        toast.success('Room update successfully!');      
      } else {
        setAction('create');
        result = await axios.post('http://103.124.92.222:6868/rooms', form);
        toast.success('Room create successfully!');
      }      
      fetchRooms();
      setShowForm(false);
    } catch (error) {
      toast.error('Error saving room!');
    }
    setForm({ BrandName: '', Address: '', GoogleMapUrl: '', imageDetail: '' });
    setEditingId(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleEdit = (room) => {
    setOLdBrandName(room.BrandName);
    setForm(room);
    setEditingId(room._id);
    setShowForm(true);
    setAction('update');
  };

  const handleDelete = async (room) => {
    setOLdBrandName(room.BrandName);
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa không? xóa cũng sẽ xóa các BrandName liên quan trong RoomBook');
    if (confirmDelete) {
      setAction('delete');    
      await axios.delete(`http://103.124.92.222:6868/rooms/${room._id}`);
      await axios.delete(`http://103.124.92.222:6868/rooms/book/roomBrand/${room.BrandName}`);
      toast.success('Room delete successfully!');
      fetchRooms();
    }  
  };

  const handleCellClick = (roomId) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(roomId)
        ? prevExpandedRows.filter((id) => id !== roomId)
        : [...prevExpandedRows, roomId]
    );
  };

  const handleCreateNew = () => {
    setForm({ BrandName: '', Address: '', GoogleMapUrl: '', imageDetail: '' });
    setEditingId(null);
    setAction('create');
    setShowForm(true);
  };
  const handleSearchNew = () => {
    setForm({ BrandName: '', Address: '', GoogleMapUrl: '', imageDetail: '' });
    setEditingId(null);
    setAction('search');
    setShowForm(true);
  };

  const handleClearSearch = () => {
    setForm({ BrandName: '', Address: '', GoogleMapUrl: '', imageDetail: '' });
    setAction('get');
    fetchRooms();
    setShowForm(false);
  }
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
          <h1>Cơ sở</h1>
      <div style={{ marginBottom: '16px' }}>
      <Button onClick={handleCreateNew} variant="link" className="transparent-button me-2">Tạo Mới</Button>  
      <Button onClick={handleSearchNew} variant="link" className="transparent-button me-2">Tìm Kiếm</Button>  
      {showForm && action === 'search' &&(
      <Button onClick={handleClearSearch} variant="link" className="transparent-button me-2">Xóa Tìm Kiếm</Button>   
       )}
      {showForm && (
        <Button onClick={handleHideForm} variant="link" className="transparent-button me-2">Ẩn Form</Button>
      )}
      </div>
      {showForm && (
        <Form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Cơ Sở</th>
            <th>Địa Chỉ</th>
            {/* <th>Google Map URL</th> */}
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Form.Control
                type="text"
                name="BrandName"
                value={form.BrandName}
                onChange={handleChange}
                placeholder="Brand Name"
                required
                style={{ border: '1px solid #130f01', borderRadius: '5px', height: '35px', backgroundColor: 'white' }}
              />
            </td>
            <td>
              <Form.Control
                type="text"
                name="Address"
                value={form.Address}
                onChange={handleChange}
                placeholder="Address"
                required
                style={{ border: '1px solid #130f01', borderRadius: '5px', height: '35px', backgroundColor: 'white' }}
              />
            </td>
            {/* <td>
              <Form.Control
                type="text"
                name="GoogleMapUrl"
                value={form.GoogleMapUrl}
                onChange={handleChange}
                placeholder="Google Map URL"
              />
            </td>            */}
            <td>
              <Button type="submit" variant="link" className={styles.transparentButton}>
                {action === 'search' ? 'Tìm' : (editingId ? 'Sửa' : 'Tạo mới')}
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </Form>
      )}             
      <Table striped bordered hover responsive className={styles.customTable}>
      <thead>
        <tr>
          <th style={{ fontWeight: 'bold', textAlign: 'center' }}>STT</th>
          <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Cơ Sở</th>
          <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Địa Chỉ</th>
          {/* <th>Google Map URL</th>           */}
          <th style={{ fontWeight: 'bold', textAlign: 'center' }}>Hành động</th>
        </tr>
      </thead>
      <tbody>
        {rooms.map((room, index) => (
          <React.Fragment key={room._id}>
            <tr onClick={() => handleCellClick(room._id)}>
              <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
               {index + 1}
              </td>
              <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{room.BrandName}</td>
              <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{room.Address}</td>
              {/* <td>
                <div className={styles.textWrapper}>{room.GoogleMapUrl}</div>
              </td>               */}
              <td style={{ fontWeight: 'bold', textAlign: 'center' }}>
                <Button
                  onClick={() => handleEdit(room)}
                 variant="link" className="transparent-button me-2"
                  style={{ margin: '0 4px' }}
                >
                  Sửa
                </Button>
                <Button
                  onClick={() => handleDelete(room)}
                  variant="link" className="transparent-button me-2"
                  style={{ margin: '0 4px' }}
                >
                  Xóa
                </Button>
              </td>
            </tr>
            {expandedRows.includes(room._id) && (
              <tr>
                <td colSpan={6} style={{ padding: '16px', backgroundColor: '#f9f9f9', wordWrap: 'break-word', wordBreak: 'break-all', textAlign: 'left' }}>
                  <strong>Thông tin:</strong>
                  <p>Cơ Sở: {room.BrandName}</p>
                  <p>Địa Chỉ: {room.Address}</p>
                  {/* <p>Google Map URL: {room.GoogleMapUrl}</p> */}
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </Table>         
      <ToastContainer />
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
        {/* partial */}
      </div>
     </div>
    </div>
    </div>
  );
};

export default RoomBrandPage;