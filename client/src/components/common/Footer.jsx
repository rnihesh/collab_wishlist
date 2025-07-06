import React from "react";
import wishList from "/wishlist.png";
import { FaGithub, FaPhoneAlt, FaLinkedin, FaEnvelope } from "react-icons/fa";
import "./Footer.css";

function Footer() {
  return (
    <footer className="bg-footer text-dark py-4 mt-5 text-center dark:text-white ">
      <div className="">
        <div className="footer-heading">
          <h3 style={{ fontFamily: "Cal Sans" }}>
            <a
              href="#"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{ textDecoration: "none" }}
              className="text-center flex justify-center"
            >
              <img
                src={wishList}
                width="70px"
                alt="nihesh_seller_portal_logo"
              />
            </a>
            <span  className="text-black dark:text-white">
              Nihesh's WishyL
            </span>
          </h3>
          <p style={{ color: "#667085" }}>
            Sharing insights from all around the world
          </p>
        </div>
        <div className="footer-made-with text-center">
          Made with <span className="heart">❤️</span> by{" "}
          <span className="author fw-bold animated-text">Nihesh</span>
        </div>
        <div className="social-icons flex-wrap text-gray-400 hover:text-gray-600">
          <a
            href="https://github.com/rnihesh"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/rachakonda-nihesh/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a href="tel:+918328094810" aria-label="Phone">
            <FaPhoneAlt />
          </a>
          <a href="mailto:niheshr03@gmail.com" aria-label="Email">
            <FaEnvelope />
          </a>
        </div>
        <div className="footer-bottom">
          <small>
            &copy; {new Date().getFullYear()} Nihesh's <span className="font-bold"> WishyL</span>. All rights
            reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
