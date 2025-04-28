import "./GaFastOfferHeroSectionTY.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;
TagManager.initialize(tagManagerArgs);

function GaFastOfferHeroSectionTY(props) {
  const formData = useSelector((state) => state.form); // Use Redux to get formData

  const continueForm = (e) => {
    props.nextStep(e);
  };

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "GaFastOfferHeroTYPageView",
        title: "GaFastOfferHeroSectionTY.js",
      });

      const { name, email, phone, zip, street } = formData; // Destructuring formData props
      ReactPixel.track("Lead", {
        name: name,
        email: email,
        phone: phone,
        zip: zip,
        street: street,
      });
    }
  }, [formData]); // formData comes from Redux now

  useEffect(() => {
    ReactPixel.init("230683406108508");
    ReactPixel.pageView();
  }, []);

  let thankYouHeadline = formData.thankYouHeadline;
  let thankYouSubHeadline = formData.thankYouSubHeadline;

  return (
    <div className="GaFastOfferHeroSectionTY ">
      <div className="ga-fast-offer-hero-ty-headline ">Request Received</div>

      <div className="ga-fast-offer-hero-ty-text">
        {/* API RETRIVED VALUE HERE.  */}
        You'll be receiving a text shortly with your estimated cash offer.{" "}
        <b>
          <i>Now let's get you the highest offer possible</i>
        </b>{" "}
        by confirming a few more details about your home.
      </div>
      {/* add button continue calls props.nextStep(3) */}
      <button
        className="ga-fast-offer-hero-ty-button"
        onClick={() => props.nextStep(3)}
        value="Continue"
      >
        Continue
      </button>
    </div>
  );
}

export default GaFastOfferHeroSectionTY;
