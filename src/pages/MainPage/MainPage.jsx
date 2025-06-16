import css from "./MainPage.module.css"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {

    
  const navigate = useNavigate();
    useEffect(() => {
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "auto";
      };
    }, []);
  
    const handleViewNowClick = () => {
      navigate("/analytics");
    };
  
    return (
      <div className={css.MainPage}>
        <h1 className={css.title}>
          Платформа для систематизації, пошуку та аналізу інформації про продаж
          і оренду нерухомості</h1>
        <button className={css.btn} onClick={handleViewNowClick}>
          Перейти
        </button>
      </div>
    );
}

export default MainPage;