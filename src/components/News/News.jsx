import React from "react";
import css from "./News.module.css"

const News = ({ title, link, published }) => {
    return (
      <div className={css.newsCard}>
        <h3>{title}</h3>
        <p>{new Date(published).toLocaleDateString()}</p>
        <a href={link} target="_blank" rel="noopener noreferrer">Читати більше</a>
      </div>
    );
  };  

export default News;
