import React, { createContext, useContext, useState, useEffect } from 'react';
import Login from './auth/Login';
import SignUp from './auth/SignUp';
import authService from './services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const openLogin = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegister = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      const userData = {
        ...data.user,
        profilePic: "https://i.pinimg.com/736x/26/89/19/268919fb14ab9fb609647d7011140ab7.jpg",
        headline: data.profile?.headline || "Software Engineer",
      };
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
      closeModals();
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return { success: false, message: error.message || "Invalid credentials" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await authService.register(userData);
      const userObj = {
        ...data.user,
        profilePic: "https://i.pinimg.com/736x/26/89/19/268919fb14ab9fb609647d7011140ab7.jpg",
        headline: data.profile?.headline || userData.designation || "Professional",
      };
      setUser(userObj);
      localStorage.setItem("user", JSON.stringify(userObj));
      localStorage.setItem("token", data.token);
      closeModals();
      return { success: true };
    } catch (error) {
      console.error("Registration failed:", error);
      return { success: false, message: error.message || "Registration failed" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.removeItem("dailyQuizShown");
  };

  const updateUser = (updates) => {
    if(user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, openLogin, openRegister, closeModals, loading }}>
      {children}
      {isLoginModalOpen && <Login isOpen={isLoginModalOpen} onClose={closeModals} openSignUp={openRegister} />}
      {isRegisterModalOpen && <SignUp isOpen={isRegisterModalOpen} onClose={closeModals} openLogin={openLogin} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
