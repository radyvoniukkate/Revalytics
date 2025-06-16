import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchRegionsList,
  fetchYearsList,
} from "../../redux/real_estate/operators.js";
import RegionTranslations from "/public/regionTranslations.js"
import {
  setSelectedRegion,
  setSelectedYear,
} from "../../redux/real_estate/slice.js";

const Dropdown = ({ options, selected, onSelect, label, translate }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  
  return (
    <div ref={ref} style={{ position: "relative", minWidth: 150 }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          padding: "0.5rem 1rem",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        {(translate && RegionTranslations[selected]) ||
          selected ||
          `Select ${label}`}
        <span style={{ float: "right" }}>▼</span>
      </button>
      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: 200,
            overflowY: "auto",
            margin: 0,
            padding: 0,
            listStyle: "none",
            border: "1px solid #ccc",
            backgroundColor: "#fff",
            zIndex: 10,
          }}
        >
          {options.map((opt) => (
            <li
              key={opt}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={{
                padding: "0.5rem 1rem",
                cursor: "pointer",
                backgroundColor: opt === selected ? "#ddd" : "transparent",
              }}
            >
              {translate ? RegionTranslations[opt] : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const FilterPanel = () => {
  const dispatch = useDispatch();

  const regions = useSelector((state) => state.realEstate.regionsList);
  const years = useSelector((state) => state.realEstate.yearsList);
  const selectedRegion = useSelector(
    (state) => state.realEstate.selectedRegion
  );
  const selectedYear = useSelector((state) => state.realEstate.selectedYear);

  useEffect(() => {
    dispatch(fetchRegionsList());
    dispatch(fetchYearsList());
  }, [dispatch]);


  const onRegionChange = (region) => {
    dispatch(setSelectedRegion(region));
  };

  const onYearChange = (year) => {
    dispatch(setSelectedYear(year));
  };

  return (
    <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
      <Dropdown
        options={regions || []}
        selected={selectedRegion}
        onSelect={onRegionChange}
        label="Region"
        translate={true} 
      />
      <Dropdown
        options={years || []}
        selected={selectedYear}
        onSelect={onYearChange}
        label="Year"
      />
    </div>
  );
};

export default FilterPanel;