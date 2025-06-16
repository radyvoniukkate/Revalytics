import React, { useState, useEffect } from "react";
import LoginForm from "../../components/Forms/LoginForm";
import RegisterForm from "../../components/Forms/RegisterForm";
import css from "./AuthPage.module.css"
import { useNavigate } from "react-router-dom";
import { selectIsLoggedIn } from "../../redux/real_estate/selector";
import { useSelector } from "react-redux";


const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/user", { replace: true }); 
    }
  }, [isLoggedIn, navigate]);

  if (isLoggedIn) {
    return <Navigate to="/user" replace />;
  }
  return (
      <div className={css.AuthPage}>
        <div className={css.component}>
          <div className={css.buttonsContainer}>
            <button
              onClick={() => setIsLogin(true)}
              className={`${css.authButton} ${isLogin ? css.active : css.inactive}`}
            >
              Увійти
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`${css.authButton} ${!isLogin ? css.active : css.inactive}`}
            >
              Реєстрація
            </button>
          </div>
    
          {isLogin ? <LoginForm /> : <RegisterForm />}
        </div>
      </div>
    );
};

export default AuthPage;
