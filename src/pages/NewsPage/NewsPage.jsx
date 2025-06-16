import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews } from "../../redux/real_estate/operators";
import NewsCard from "../../components/News/News";
import css from "./NewsPage.module.css"

const NewsPage = () => {
  const dispatch = useDispatch();
  const news = useSelector((state) => state.realEstate.news);
  const loading = useSelector((state) => state.realEstate.loading);

  useEffect(() => {
    dispatch(fetchNews());
  }, [dispatch]);

  return (
    <div className={css.NewsPage}>
      <h1>Останні новини</h1>
      {loading && <p>Завантаження...</p>}
      <div className={css.NewsContent}>
        {[...news]
          .sort((a, b) => new Date(b.published) - new Date(a.published)) // Сортування за спаданням
          .map((item) => (
            <NewsCard
              key={item._id}
              title={item.title}
              link={item.link}
              published={item.published}
            />
          ))}
      </div>
    </div>
  );
};

export default NewsPage;
