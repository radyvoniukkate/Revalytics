import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../redux/real_estate/operators";
import css from "./Header.module.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const isLoggedIn = useSelector((state) => state.realEstate.isLoggedIn); // <-- заміни на свій селектор

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await dispatch(logoutUser());
    navigate("/auth");
    setIsLoggingOut(false);
  };

  return (
    <nav className={css.headRow}>
      <div className={css.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? css.active : css.text)}
        >
          Головна
        </NavLink>
        <NavLink
          to="/analytics"
          end
          className={({ isActive }) => (isActive ? css.active : css.text)}
        >
          Аналітика
        </NavLink>
        <NavLink
          to="/news"
          end
          className={({ isActive }) => (isActive ? css.active : css.text)}
        >
          Новини
        </NavLink>
      </div>

      <div className={css.auth}>
        <NavLink
          to="/auth"
          end
          className={({ isActive }) => (isActive ? css.active : css.text)}
        >
          <img
            src="/public/avatar_16845277.png"
            alt="Авторизація"
            className={css.img}
          />
        </NavLink>

        {isLoggedIn && ( // показуємо кнопку тільки якщо користувач авторизований
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={css.logoutButton}
          >
            {isLoggingOut ? "Вихід..." : "Вийти"}
          </button>
        )}
      </div>
    </nav>
  );
};

export default Header;
