import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {  clearMessage } from "../../redux/real_estate/slice";
import {
  selectAuthStatus,
  selectAuthError,
  selectAuthMessage,
} from "../../redux/real_estate/selector.js";
import { registerUser, loginUser } from "../../redux/real_estate/operators";
import css from "./AuthForm.module.css"
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);
  const message = useSelector(selectAuthMessage);

  const handleRegister = async (e) => {
    e.preventDefault();

    const action = await dispatch(registerUser({ username, password }));

    // Якщо реєстрація успішна — автоматичний логін
    if (registerUser.fulfilled.match(action)) {
      const loginAction = await dispatch(loginUser({ username, password }));
      if (loginUser.fulfilled.match(loginAction)) {
        navigate("/user");
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearMessage());
    };
  }, [dispatch]);

  return (
    <div className={css.authFormContainer}>
      <h2 className={css.authFormTitle}>Реєстрація</h2>
      <form onSubmit={handleRegister} className={css.authForm}>
        <input
          type="text"
          placeholder="Ім'я користувача"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-2 border rounded"
        />
        <button
          type="submit"
          className={css.registerButton}
          disabled={status === "loading"}
        >
          {status === "loading" ? "Реєстрація..." : "Зареєструватися"}
        </button>
      </form>

      {message && <p className={css.messageSuccess}>{message}</p>}
      {error && <p className={css.messageError}>{error}</p>}
    </div>
  );
};

export default RegisterForm;
