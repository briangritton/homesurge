import "./HeroSection3.css";
import emailjs from "emailjs-com";
// import { HelmetProvider } from 'react-helmet-async';
import { useEffect, useRef } from "react";
import TagManager from "react-gtm-module";
import FooterLP from "./FooterLP";
import Privacy from "./Privacy";

import "./Privacy.css";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;

TagManager.initialize(tagManagerArgs);

function HeroSection3(props) {
  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "Hero3PageView",
        title: "HeroSection3.js",
        // page: {
        //   url: "HeroSection1.js",
        //   title: "HeroSection1.js"
        // }
      });
    }
  }, []);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const streetRef = useRef(null);
  const zipRef = useRef(null);

  var templateParams = {
    name: props.formData.name,
    email: props.formData.email,
    phone: props.formData.phone,
    street: props.formData.street,
    zip: props.formData.zip,
    campaignid: props.clickData.campaignid,
    adgroupid: props.clickData.adgroupid,
    keyword: props.clickData.keyword,
    device: props.clickData.device,
    gclid: props.clickData.gclid,
    finalLp: "HeroSection3",
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // const isValid = formValidation();
    const isValid = formValidation();
    if (isValid === true) {
      // alert("isValid true");
      sendEmail();
      props.nextStep(7);
    }
    if (isValid === false) {
      // alert("isValid false");
    }
  };

  const formValidation = () => {
    if (props.formData.name.trim().length > 50) {
      nameRef.current.className = "hero-left-form-field-container-3-invalid";
      return false;
    }

    if (props.formData.email.trim().length > 50) {
      emailRef.current.className = "hero-left-form-field-container-3-invalid";
      return false;
    }

    if (props.formData.street.trim().length > 150) {
      streetRef.current.className = "hero-left-form-field-container-3-invalid";
      return false;
    }

    const phone = props.formData.phone.trim();
    const phonePattern =
      /^(\+\d{1,2}\s?)?1?-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

    if (!phonePattern.test(phone)) {
      phoneRef.current.className = "hero-left-form-field-container-3-invalid";
      return false;
    }

    return true;
  };
  const sendEmail = (e) => {
    emailjs
      .send(
        "service_zeuf0n8",
        "template_kuv08p4",
        templateParams,
        "afTroSYel0GQS1oMc"
      )
      .then(
        function (response) {
          console.log("SUCCESS!", response.status, response.text);
        },
        function (error) {
          console.log("FAILED...", error);
        }
      );
  };

  props.nextStep(6);

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
    <div className="HeroSection3">
      <div className="hero-3-section">
        <div className="hero-3-headline">
          Great! Click Check Cash Offer Below To Finish...
        </div>

        <div className="hero-3-form-container">
          <input
            ref={nameRef}
            autocomplete="name"
            type="text"
            placeholder="Full name"
            className="hero-left-form-field-container-3 margin-right-5-desktop"
            value={props.formData.name}
            onChange={(e) =>
              props.setFormData({ ...props.formData, name: e.target.value })
            }
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "Full name")}
          />
          <input
            ref={streetRef}
            autocomplete="street-address"
            type="text"
            placeholder="Street address"
            className="hero-left-form-field-container-3 margin-left-5-desktop"
            value={props.formData.street}
            onChange={(e) =>
              props.setFormData({ ...props.formData, street: e.target.value })
            }
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "Street address")}
          />

          <input
            ref={phoneRef}
            autocomplete="Phone"
            type="text"
            placeholder="Phone"
            className="hero-left-form-field-container-3 margin-right-5-desktop"
            value={props.formData.phone}
            onChange={(e) =>
              props.setFormData({ ...props.formData, phone: e.target.value })
            }
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "Phone")}
          />

          <input
            ref={zipRef}
            autocomplete="postal-code"
            type="text"
            placeholder="Zip Code"
            className="hero-left-form-field-container-3 margin-left-5-desktop"
            value={props.formData.zip}
            onChange={(e) =>
              props.setFormData({ ...props.formData, zip: e.target.value })
            }
            onFocus={(e) => (e.target.placeholder = "")}
            onBlur={(e) => (e.target.placeholder = "Zip Code")}
          />

          <div className="hero-3-button-and-disclaimer-container">
            <button
              className="hero-3-form-button"
              onClick={(e) => handleSubmit(e)}
            >
              CHECK CASH OFFER
            </button>
            <div className="hero-3-disclaimer-text">
              By clicking the button you agree to our
              <div
                className="hero-3-privacy-link"
                onClick={(e) => handleTermsClick("privacy")}
              >
                privacy policy
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        ref={privacyRef}
        style={{ display: "none" }}
        className="privacy-container"
      >
        <Privacy handleTermsClick={handleTermsClick} />
      </div>
      <FooterLP />
    </div>
  );
}

export default HeroSection3;
