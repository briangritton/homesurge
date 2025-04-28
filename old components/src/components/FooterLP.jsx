import "./Footer.css";
// import { Link } from "react-router-dom";

import { Link } from "react-router-dom";
import "./Privacy.css";

function FooterLP() {
  return (
    <div className="FooterLP">
      <div className="footer-copyright-lp">
        All Rights Reserved © 2023 SellForCash.Online
      </div>

      <div className="footer-nav-container-lp">
        <ul className="nav-links">
          <div>
            <Link to="/privacy" className="footer-lp-privacy-link">
              Privacy Policy
            </Link>
          </div>
        </ul>
      </div>
    </div>
  );
}

export default FooterLP;
