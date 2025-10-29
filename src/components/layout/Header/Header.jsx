import { Link } from "react-router-dom";

import "./header.css";

function Header() {
  return (
    <header className="navbar__header">
      <nav className="navbar__container">
        {/* Phần liên kết bên trái */}
        <ul className="navbar__links-left">
          <li>
            <Link to="/login" className="navbar__link">
              MEMBERSHIP
            </Link>
          </li>
        </ul>

        {/* Logo/Tên thương hiệu ở giữa */}
        <a href="https://new-goabove.webflow.io/" className="navbar__logo">
          <img src="/images/logo.svg" loading="lazy" alt="logo" />
        </a>

        {/* Nút hành động bên phải */}
        <Link to="/payment" className="navbar__button-right">
          BUY NOW
        </Link>
      </nav>
    </header>
  );
}

export default Header;
