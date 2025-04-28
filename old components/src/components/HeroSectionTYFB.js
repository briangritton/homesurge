import "./HeroSectionTY.css";
import { useEffect } from "react";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";
const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;
TagManager.initialize(tagManagerArgs);

function HeroSectionTYFB(props) {
  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "HeroTYPageViewFB",
        title: "HeroSectionTYFB.js",
        // page: {
        //   url: "HeroSection1.js",
        //   title: "HeroSection1.js"
        // }
      });

      const { name, email, phone, zip, street } = props.formData; // Destructuring formData props
      ReactPixel.track("Lead", {
        name: name,
        email: email,
        phone: phone,
        zip: zip,
        street: street,
      });
    }
  }, [props.formData]);

  // import thankYouHeadline and subHeadline as props and use them in the return statement
  let thankYouHeadline = props.formData.thankYouHeadline;
  let thankYouSubHeadline = props.formData.thankYouSubHeadline;

  return (
    <div className="HeroSectionTY">
      <div className="hero-ty-headline">{thankYouHeadline}</div>
      <div className="hero-ty-text">{thankYouSubHeadline}</div>
    </div>
  );
}

export default HeroSectionTYFB;
