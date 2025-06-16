import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {clearMessage } from "../../redux/real_estate/slice";
import {
  selectAuthStatus,
  selectAuthError,
  selectAuthMessage,
} from "../../redux/real_estate/selector";
import { loginUser } from "../../redux/real_estate/operators";
import css from "./AuthForm.module.css";


const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const action = await dispatch(loginUser({ username, password }));
      console.log("✅ [LoginForm] Login result:", action);
    if (loginUser.fulfilled.match(action)) {
      navigate("/user"); 
    }
    } catch (error) {
      console.error("❌ [LoginForm] Login error:", error);
    }
    
  };

  useEffect(() => {
    return () => {
      dispatch(clearMessage());
    };
  }, [dispatch]);
  
  return (
    <div className={css.authFormContainer}>
      <h2 className={css.authFormTitle}>Вхід</h2>
      <form onSubmit={handleLogin} className={css.authForm}>
        <input
          type="text"
          placeholder="Ім'я користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className={css.loginButton}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Вхід..." : "Увійти"}
        </button>
      </form>

      {message && <p className={css.messageSuccess}>{message}</p>}
      {error && <p className={css.messageError}>{error}</p>}
    </div>
  );
};

export default LoginForm;
