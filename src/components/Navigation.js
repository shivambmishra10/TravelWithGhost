// // components/Navigation.js
// import { useState } from 'react';
// import Link from 'next/link';
// import { useRouter } from 'next/router';
// import { Navbar, Container, Nav, Button, Modal } from 'react-bootstrap';
// import { useAuth } from '../contexts/AuthContext';
// import { createContext, useContext, useEffect } from 'react';

// // const AuthContext = createContext({
// //   user: null,
// //   isAuthenticated: false,
// //   loading: true,
// //   login: async () => {},
// //   logout: () => {},
// //   register: async () => {},
// //   googleLogin: async () => {}
// // });


// const Navigation = () => {
//   const router = useRouter();
//   const { user, isAuthenticated, logout } = useAuth();
//   const [showLogoutModal, setShowLogoutModal] = useState(false);
//   console.log(router)
//   const handleLogout = () => {
//     logout();
//     setShowLogoutModal(false);
//     router.push('/');
//   };

//   return (
//     <>
//       <Navbar bg="light" expand="lg" className="shadow-sm py-3">
//         <Container>
//           <Link href="/" passHref>
//             <Navbar.Brand className="fw-bold" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
//               Circulus
//             </Navbar.Brand>
//           </Link>
          
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="ms-auto">
//               <Link href="/" passHref>
//                 <Nav.Link className={router.pathname === '/' ? 'active' : ''}>
//                   Home
//                 </Nav.Link>
//               </Link>
              
//               <Link href="/trips/create" passHref>
//                 <Nav.Link className={router.pathname === '/trips/create' ? 'active' : ''}>
//                   Create Trip
//                 </Nav.Link>
//               </Link>
              
//               {isAuthenticated ? (
//                 <>
//                   <Link href="/profile" passHref>
//                     <Nav.Link className={router.pathname === '/profile' ? 'active' : ''}>
//                       Profile
//                     </Nav.Link>
//                   </Link>
                  
//                   {user.is_host && (
//                     <Link href="/manage-requests" passHref>
//                       <Nav.Link className={router.pathname === '/manage-requests' ? 'active' : ''}>
//                         Requests
//                       </Nav.Link>
//                     </Link>
//                   )}
                  
//                   <Button 
//                     variant="outline-danger" 
//                     size="sm" 
//                     className="ms-2"
//                     onClick={() => setShowLogoutModal(true)}
//                   >
//                     Logout
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Link href="/login" passHref>
//                     <Nav.Link className={router.pathname === '/login' ? 'active' : ''}>
//                       Login
//                     </Nav.Link>
//                   </Link>
                  
//                   <Link href="/register" passHref>
//                     <Button variant="primary" size="sm" className="ms-2">
//                       Sign Up
//                     </Button>
//                   </Link>
//                 </>
//               )}
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>
      
//       <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Confirm Logout</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>Are you sure you want to logout?</Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="danger" onClick={handleLogout}>
//             Logout
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default Navigation;


//new code added

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Navbar, Container, Nav, Button, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navigation.css';

const Navigation = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    router.push('/');
  };

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <>
      <Navbar expand="lg">
        <Container>
        <Navbar.Brand 
  className="fw-bold d-flex align-items-center" 
  style={{ cursor: "pointer" }}
  onClick={() => handleNavigation('/')}
>
  <div style={{ position: 'relative', width: '50px', height: '50px', marginRight: '10px' }}>
    <Image
      src="/logoproj.png"
      alt="Logo"
      layout="fill"
      objectFit="contain"
      priority
    />
  </div>
  <span style={{ fontFamily: "'Comic Sans MS', cursive", fontSize: "1.8rem", color: "#1E88E5" }}>
    travelwithghost™
  </span>
</Navbar.Brand>

          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link 
                active={router.pathname === '/'}
                onClick={() => handleNavigation('/')}
                style={{ cursor: 'pointer' }}
              >
                Home
              </Nav.Link>
              
              <Nav.Link 
                active={router.pathname === '/trips/create'}
                onClick={() => handleNavigation('/trips/create')}
                style={{ cursor: 'pointer' }}
              >
                Create Trip
              </Nav.Link>
              
              {isAuthenticated ? (
                <>
                  <Nav.Link 
                    active={router.pathname === '/profile'}
                    onClick={() => handleNavigation('/profile')}
                    style={{ cursor: 'pointer' }}
                  >
                    Profile
                  </Nav.Link>
                  
                  {user?.is_host && (
                    <Nav.Link 
                      active={router.pathname === '/manage-requests'}
                      onClick={() => handleNavigation('/manage-requests')}
                      style={{ cursor: 'pointer' }}
                    >
                      Requests
                    </Nav.Link>
                  )}
                  
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="ms-2"
                    onClick={() => setShowLogoutModal(true)}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Nav.Link 
                    active={router.pathname === '/login'}
                    onClick={() => handleNavigation('/login')}
                    style={{ cursor: 'pointer' }}
                  >
                    Login
                  </Nav.Link>
                  
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="ms-2"
                    onClick={() => handleNavigation('/register')}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Navigation;
