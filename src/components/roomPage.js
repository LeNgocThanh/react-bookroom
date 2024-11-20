import axios from 'axios';
import { Table, Button, Form, Pagination, FormControl, ToastContainer, Container, Tab, Tabs } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav  } from 'react-bootstrap';
import styles_admin from '../assets/css/admin.module.css'; 
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../assets/css/component.module.css';


const RoomPage = () => {
  const [form, setForm] = useState({
    BrandName: '',
    RoomNumber: '',
    RoomType: '',
    RoomAmenities: '',
    RoomDetail: '',
  });
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [bookRooms, setBookRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [action, setAction] = useState('get');  
  const [originDatas, setOriginDatas] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [uniqueBrands, setUniqueBrands] = useState([]);
  const [username, setUsername] = useState('');
 
  const asideRef = useRef();
  const [isSidenavVisible, setIsSidenavVisible] = useState(true);
  const roomsPerPage = 20;    

  const sortedRooms = [...bookRooms].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    }
    return 0;
  });
  const roomByBrandNames = sortedRooms.filter((room) => room.BrandName === selectedBrand);

  const totalPages = Math.ceil(roomByBrandNames.length / roomsPerPage);

  const currentRooms = roomByBrandNames.slice(    
    (currentPage - 1) * roomsPerPage,
    currentPage * roomsPerPage
  );

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
 
  const handlePageChange = (pageNumber) => {      
    setCurrentPage(pageNumber);    
  };  

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
  
  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
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
    const response = await axios.get(
      'http://103.124.92.222:6868/rooms'
    );
    setRooms(response.data);
    const bookRoomsData = response.data;
    const brands = [...new Set(bookRoomsData.map(bookRoom => bookRoom.BrandName))];
    setUniqueBrands(brands);
    setSelectedBrand(brands[0]);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setForm({
      BrandName: brand,
      RoomNumber: '',
      RoomType: '',
      RoomAmenities: '',
      RoomDetail: '',
    });
    console.log('formBySelectedBrandIn', form);
    console.log('selectedBrand', selectedBrand);
    console.log('brand', brand);
  };

  useEffect(() => {
    console.log('formBySelectedBrandOut', form);
  }, [form]);

  const fetchRoomTypes = async () => {
    const response = await axios.get(
      'http://103.124.92.222:6868/rooms/type/all'
    );
    setRoomTypes(response.data);
  };

  const fetchBookRooms = async () => {
    const response = await axios.get(
      'http://103.124.92.222:6868/rooms/book/all'
    );
    setBookRooms(response.data);
    setOriginDatas(response.data);
  };
  

  const handleSubmit = async (event) => {
    event.preventDefault();   
     
    let result;
    try {
      if (action === 'search') {
        const filteredRooms = originDatas.filter((originData) => {
          let isMatch = true;
          if (form.BrandName) {
            isMatch = isMatch && originData.BrandName === form.BrandName;
          }
          if (form.RoomNumber) {
            isMatch = isMatch && originData.RoomNumber === form.RoomNumber;
          }
          if (form.RoomType) {
            isMatch = isMatch && originData.RoomType === form.RoomType;
          }
          if (form.RoomAmenities) {
            isMatch = isMatch && originData.RoomAmenities === form.RoomAmenities;
          }
          if (form.RoomDetail) {
            isMatch = isMatch && originData.RoomDetail === form.RoomDetail;
          }
          return isMatch;
        });
        setBookRooms(filteredRooms);
        return;
      }
      if (editingId) {
        result = await axios.put(
          `http://103.124.92.222:6868/rooms/book/${editingId}`,
          form
        );  
        alert('Sửa phòng thành công!');        
      } else {
        console.log('form', form);
        result = await axios.post(
          'http://103.124.92.222:6868/rooms/book',
          form
        )     
        alert('Tạo phòng thành công!');

      }
      fetchBookRooms();
      setShowForm(false);
    } catch (error) {
      console.log('error', error);      
    }
      setForm({
      BrandName: '',
      RoomNumber: '',
      RoomType: '',
      RoomAmenities: '',
      RoomDetail: '',
    });
    setEditingId(null);
  };
  const handleChange = (name, value) => {
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };
  const handleEdit = (room) => {
    setForm(room);
    setEditingId(room._id);
    setShowForm(true);
    setAction('update');
  };

  const handleDelete = async (room) => {
    const confirmDelete = window.confirm('Bạn có chắc chắn muốn xóa không?');
    if (confirmDelete) {
      await axios.delete(`http://103.124.92.222:6868/rooms/book/${room._id}`);     
      fetchBookRooms();
    }
  };

  const handleCreateNew = () => {
    setForm({
      BrandName: selectedBrand,
      RoomNumber: '',
      RoomType: '',
      RoomAmenities: '',
      RoomDetail: '',
    });
    setEditingId(null);
    setAction('create');
    setShowForm(true);
  };

  const handleSearchNew = () => {
    setForm({
      BrandName: '',
      RoomNumber: '',
      RoomType: '',
      RoomAmenities: '',
      RoomDetail: '',
    });
    setEditingId(null);
    setAction('search');
    setShowForm(true);
  };

  const handleClearSearch = () => {
    setForm({
      BrandName: '',
      RoomNumber: '',
      RoomType: '',
      RoomAmenities: '',
      RoomDetail: '',
    });
    setAction('get');
    fetchBookRooms();
    setShowForm(false);
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
      <h1>Phòng cơ sở {selectedBrand}</h1>
      <div className="mb-3">
        <Button onClick={handleCreateNew} variant="link" className="transparent-button me-2">Tạo Mới</Button>
        <Button onClick={handleSearchNew} variant="link" className="transparent-button me-2">Tìm Kiếm</Button>
        {showForm && action === 'search' && (
          <Button onClick={handleClearSearch} variant="link" className="transparent-button me-2">Xóa Tìm Kiếm</Button>
        )}
        {showForm && (
          <Button onClick={handleHideForm} variant="link" className="transparent-button me-2">Ẩn Form</Button>
        )}
      </div>
      {showForm && (
        <Form onSubmit={handleSubmit} className="mb-3">
        <div class="card-body px-0 pb-2">
              <div class="table-responsive p-0">
                <table class="table align-items-center mb-0">   
                <thead>                        
              <tr>
                <th>Cơ Sở</th> 
                <th>Số Phòng</th>
                <th>Loại Phòng</th>
                <th>Tài sản trong Phòng</th>
                <th>Chi tiết Phòng</th>
                <th>Hành động</th>
              </tr>  
              </thead>          
            <tbody>
              <tr>
              <td>                  
                  {selectedBrand}
                </td>              
                <td>
                  <FormControl
                    type="text"
                    name="RoomNumber"
                    value={form.RoomNumber}
                    onChange={(e) => handleChange('RoomNumber', e.target.value)}
                    placeholder="Số phòng"
                    required={action === 'create'|| action === 'update'}
                    style={{ border: '1px solid #130f01', borderRadius: '5px', height: '35px', backgroundColor: 'white' }}
                  />
                </td>
                <td>
                <FormControl as="select" name="Loại phòng" value={form.RoomType} onChange={(e) => handleChange('RoomType', e.target.value)} required={action === 'create'|| action === 'update'} style={{ border: '1px solid #130f01', borderRadius: '5px', height: '35px', backgroundColor: 'white' }}>
                      <option value="" disabled>Select RoomType</option>
                      {roomTypes.map((roomType) => (
                        <option key={roomType._id} value={roomType.TypeName}>
                          {roomType.TypeName}
                        </option>
                      ))}
                    </FormControl>
                </td>
                <td>
                  <FormControl
                    type="text"
                    name="RoomAmenities"
                    value={form.RoomAmenities}
                    onChange={(e) => handleChange('RoomAmenities', e.target.value)}
                    placeholder="Tài sản trong phòng"   
                    style={{ border: '1px solid #130f01', borderRadius: '5px', height: '35px', backgroundColor: 'white' }}                
                  />
                </td>
                <td>
                  <FormControl
                    type="text"
                    name="RoomDetail"
                    value={form.RoomDetail}
                    onChange={(e) => handleChange('RoomDetail', e.target.value)}
                    placeholder="Chi tiết"  
                    style={{ border: '1px solid #130f01', borderRadius: '5px', height: '35px', backgroundColor: 'white' }}                  
                  />
                </td>
                <td>
                  <Button type="submit" variant="link" className="transparent-button me-2">
                    {action === 'search' ? 'Tìm' : editingId ? 'Sửa' : 'Tạo mới'}
                  </Button>
                </td>
              </tr>
            </tbody>
         </table>
         </div>
         </div>
        </Form>
      )}
      <Tabs
          id="brand-tabs"
          activeKey={selectedBrand}
          onSelect={handleBrandChange}
        >
          {uniqueBrands.map((brand) => (
            <Tab eventKey={brand} title={brand} key={brand}>
              {/* Content for each tab can go here if needed */}
            </Tab>
          ))}
        </Tabs>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>STT</th>
            <th>Cơ Sở</th>
            <th onClick={() => handleSort('RoomNumber')}>Số Phòng</th>
            <th onClick={() => handleSort('RoomType')}>Loại Phòng</th>
            <th>Tài sản trong Phòng</th>
            <th>Chi tiết Phòng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>        
       
          {currentRooms.map((room, index) => (
            <tr key={room._id}>
              <td>{index + 1 + (currentPage - 1) * roomsPerPage}</td>
              <td>{room.BrandName}</td>
              <td>{room.RoomNumber}</td>
              <td>{room.RoomType}</td>
              <td>{room.RoomAmenities}</td>
              <td>{room.RoomDetail}</td>
              <td>              
                <Button
                  onClick={() => handleEdit(room)}
                  variant="link" className="transparent-button me-2"
                >
                  Sửa
                </Button>
                <Button
                  onClick={() => handleDelete(room)}
                  variant="link" className="transparent-button"
                >
                  Xóa
                </Button>
              </td>        
            </tr>
          ))}
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

export default RoomPage;