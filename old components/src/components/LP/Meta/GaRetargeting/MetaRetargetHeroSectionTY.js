import "./MetaRetargetHeroSectionTY.css";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import ReactPixel from "react-facebook-pixel";
import TagManager from "react-gtm-module";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;
TagManager.initialize(tagManagerArgs);

function MetaRetargetHeroSectionTY() {
  const formData = useSelector((state) => state.form); // Use Redux to get formData

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "MetaRetargetHeroTYPageView",
        title: "MetaRetargetHeroSectionTY.js",
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
    <div className="MetaRetargetHeroSectionTY">
      <div className="meta-retarget-hero-ty-headline">Request Completed</div>
      <div className="meta-retarget-hero-ty-text">
        You'll be receiving your requested details at your contact number
        shortly, thank you!
      </div>
    </div>
  );
}

export default MetaRetargetHeroSectionTY;
