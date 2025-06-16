import { Outlet } from "react-router-dom";
import Header from "../Header/Header.jsx";
import css from "./Layout.module.css";

const Layout = () => {
  return (
    <div className={css.Layout}>
      <div className={css.header}>
        <div className={css.navbar}>
          <Header />
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default Layout;
