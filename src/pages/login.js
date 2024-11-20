import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Helmet } from 'react-helmet';
import '../assets/css/material-dashboard.css?v=3.1.0';


const Login = () => {
  const [form, setForm] = useState();
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
 // const router = useRouter();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));    
  }; 

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      navigate('/bookingRoom');
    }
    setForm({ username: '', password: '' });
    setLoading(false);    
  }, []);

  const handleSubmit = async (event) => {
   // console.log('sumited', form);
    event.preventDefault();
    try {          
      const response = await axios.post('http://103.124.92.222:6868/auth/login', form);
      const data = response.data;         
      if (data.access_token) {        
        localStorage.setItem('access_token', data.access_token);        
        localStorage.setItem('username', form.username);      
        navigate('/bookingRoom');
      } else {
        setError(data.msg || 'Login failed');
      }
    } catch (error) {
      setError('Login failed');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (   
    <div>  
    <Helmet>
    <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link rel="apple-touch-icon" sizes="76x76" href="../assets/img/apple-icon.png" />
        <link rel="icon" type="image/png" href="../assets/img/favicon.png" />       
        <link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900|Roboto+Slab:400,700" />
        <link href="../assets/css/nucleo-icons.css" rel="stylesheet" />
        <link href="../assets/css/nucleo-svg.css" rel="stylesheet" />
        <script src="https://kit.fontawesome.com/42d5adcbca.js" crossorigin="anonymous" defer></script>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        {/* <link id="pagestyle" href="../assets/css/material-dashboard.css?v=3.1.0" rel="stylesheet" /> */}
        <script defer data-site="YOUR_DOMAIN_HERE" src="https://api.nepcha.com/js/nepcha-analytics.js"></script>
    </Helmet>
  <main className="main-content  mt-0">
    <div
      className="page-header align-items-start min-vh-100"
      style={{
        backgroundImage:
          'url("https://images.unsplash.com/photo-1497294815431-9365093b7331?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1950&q=80")'
      }}
    >
      <span className="mask bg-gradient-dark opacity-6" />
      <div className="container my-auto">
        <div className="row">
          <div className="col-lg-4 col-md-8 col-12 mx-auto">
            <div className="card z-index-0 fadeIn3 fadeInBottom">
              <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                  <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">
                    Sign in
                  </h4>                  
                </div>
              </div>
              <div className="card-body">
              <form role="form" className="text-start" onSubmit={handleSubmit}>
  <div className="input-group input-group-outline my-3">
  {error && <div className="error-message">{error}</div>}
  {(!form || form.username === '') && <label className="form-label">Username</label>}
    <input
      type="text"
      name="username"
      value={!form ? '' : form.username}
      onChange={handleChange}
      className="form-control"
      required
    />
  </div>
  <div className="input-group input-group-outline mb-3">
  {(!form || form.password === '') && <label className="form-label">Password</label>}
    <input
      type={showPassword ? "text" : "password"}
      name="password"
      value={!form ? '' : form.password}
      onChange={handleChange}
      className="form-control"
      required
    />
  </div>
  <div className="form-check form-switch d-flex align-items-center mb-3">
    <input
      className="form-check-input"
      type="checkbox"
      id="rememberMe"
      onChange={() => setShowPassword(!showPassword)}
    />
    <label className="form-check-label mb-0 ms-3" htmlFor="rememberMe">
      Show Password
    </label>
  </div>
  <div className="text-center">
    <button type="submit" className="btn bg-gradient-primary w-100 my-4 mb-2">
      Đăng nhập
    </button>
  </div>
</form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer position-absolute bottom-2 py-2 w-100">
        <div className="container">
          <div className="row align-items-center justify-content-lg-between">
            <div className="col-12 col-md-6 my-auto">
              <div className="copyright text-center text-sm text-white text-lg-start">
                ©2024 , made with <i className="fa fa-heart" aria-hidden="true" />{" "}
                by
                <a
                  href="https://www.creative-tim.com"
                  className="font-weight-bold text-white"
                  target="_blank"
                >
                  Amore House 
                </a>
                 cho một dịch vụ tốt hơn
              </div>
            </div>
            <div className="col-12 col-md-6">
              <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                <li className="nav-item">
                  <a
                    href="https://www.facebook.com/amorehousehomestay"
                    className="nav-link text-white"
                    target="_blank"
                  >
                    AmoreHouse
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    href="https://www.facebook.com/amorehousehomestay"
                    className="nav-link text-white"
                    target="_blank"
                  >
                    FanPage
                  </a>
                </li>               
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </main> 
</div>
  );
};

export default Login;