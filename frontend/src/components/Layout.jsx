import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Modal from './Modal';

const Layout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('login');

  const openModal = (mode = 'login') => {
      setModalMode(mode);
      setIsModalOpen(true);
  };

  return (
    <>
      <Navbar onOpenModal={() => openModal('login')} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} mode={modalMode} />
      <Outlet context={{ onOpenModal: (mode) => openModal(mode) }} />
      <Footer />
    </>
  );
};

export default Layout;
