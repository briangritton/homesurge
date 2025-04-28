import "./GaFastOfferHeroSection1.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;
TagManager.initialize(tagManagerArgs);

function GaFastOfferHeroSection2(props) {
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
    }
  }, [formData]); // formData comes from Redux now

  let thankYouHeadline = formData.thankYouHeadline;
  let thankYouSubHeadline = formData.thankYouSubHeadline;

  return (
    <div className="GaFastOfferHeroSectionTY">
      <div className="ga-fast-offer-hero-ty-headline">
        Great! Let's confirm your exact cash offer amount.
      </div>
      <div className="ga-fast-offer-hero-ty-text">
        <div className="ga-fast-offer-hero-middle-map-sub-info">
          <div className="ga-fast-offer-hero-middle-estimated-value">
            $551,233
          </div>
          <div className="ga-fast-offer-hero-middle-estimated-value-text">
            Estimated market value
          </div>

          {formData.phone ? (
            <div className="ga-fast-offer-hero-address-owner-and-phone-container">
              <div className="ga-fast-offer-hero-address-owner">
                Owner: {formData.name ? formData.name : formData.apiOwnerName}
              </div>
              <div className="ga-fast-offer-hero-address-phone">
                Phone:{" "}
                {formData.phone
                  ? formData.phone
                  : formData.phones && formData.phones[0]
                    ? formData.phones[0].number
                    : "Not available"}
              </div>
            </div>
          ) : null}

          <div className="ga-fast-offer-hero-middle-map-buttons">
            {/* <button
              className="ga-fast-offer-hero-middle-map-edit-button"
              onClick={() => setEditInfoOverlayVisible(true)}
            >
              Edit info
            </button> */}
            {/* <button
              className="ga-fast-offer-hero-middle-map-submit-button"
              onClick={handleRegister}
            >
              Yep, that's correct
            </button> */}
          </div>
        </div>
        <br></br>Let's get a few more details to get your exact maximum cash
        offer. Click to continue...
      </div>
      <button
        className="ga-fast-offer-hero-ty-button"
        onClick={() => props.nextStep(3)}
      >
        FINALIZE OFFER
      </button>
    </div>
  );
}

export default GaFastOfferHeroSection2;
