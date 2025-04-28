// import logo from "../assets/images/rooflogonotext.png";
import logo from "../assets/images/logo.png";

import "./Header.css";
import { BsTelephoneFill } from "react-icons/bs";
import "../assets/fonts/AGENCYB.TTF";
function Header() {
  return (
    <header className="Header">
      <div className="header-left">
        {/* <img src={logo} className="header-log-45" alt="logo" /> */}
        <img src={logo} className="header-logo" alt="logo" />
        <div className="header-logo-text">SELL FOR CASH</div>
      </div>

      <a href="tel:+17707657969">
        <div className="header-right">
          <div className="number-positioner">
            <div className="header-phone-icon">
              <BsTelephoneFill />
            </div>
            <div className="header-call-number">770-765-7969</div>
            <div className="header-call-number-phone">
              <br></br>770-765-7969
            </div>
            <div className="header-call-number-phone-500">770-765-7969</div>
          </div>
        </div>
      </a>
    </header>
  );
}

export default Header;
