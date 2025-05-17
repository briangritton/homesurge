import "./Footer.css";
// import { Link } from "react-router-dom";

import Privacy from "./Privacy";
import { useRef } from "react";

import "./Privacy.css";

function Footer() {
  const termsRef = useRef(null);
  const privacyRef = useRef(null);

  const handleTermsClick = (clickedLink) => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // Add this line

    if (clickedLink === "terms") {
      termsRef.current.style.display = "flex";
    } else if (clickedLink === "close-terms") {
      termsRef.current.style.display = "none";
    } else if (clickedLink === "privacy") {
      privacyRef.current.style.display = "flex";
    } else if (clickedLink === "close-privacy") {
      privacyRef.current.style.display = "none";
    }
  };

  return (
    <div className="Footer">
      {/* <div className="footer-copyright">
        All Rights Reserved © 2023 SellForCash.Online
      </div> */}

      <div className="footer-nav-container">
        <ul className="nav-links">
          <div onClick={(e) => handleTermsClick("privacy")}>
            <li> Privacy Policy </li>
          </div>
          <li>
            <a href="/#about">About Us</a>
          </li>
          <li>
            <a href="/#how-it-works">How it Works</a>
          </li>
          <li>
            <a href="/#benefits">Benefits</a>
          </li>
          <li>
            <a href="/#contact">Contact</a>
          </li>
        </ul>
      </div>

      <div
        ref={privacyRef}
        style={{ display: "none" }}
        className="privacy-container"
      >
        <Privacy handleTermsClick={handleTermsClick} />
      </div>
    </div>
  );
}

export default Footer;
