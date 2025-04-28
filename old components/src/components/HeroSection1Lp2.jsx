import "./HeroSection1Lp2.css";
import homecollage from "../assets/images/homecollage.jpg";
import homecollagewide from "../assets/images/homecollagewide.jpg";
import FoldBottom from "./FoldBottom";
import { useEffect, useRef, useState } from "react";
import TagManager from "react-gtm-module";
import Footer from "./Footer";
import emailjs from "emailjs-com";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;

TagManager.initialize(tagManagerArgs);

function HeroSection1Lp2(props) {
  // !!!!!!!!!!!!!!!!!!!!!!!!   LIMIT TO ONE TIME  -----------------

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "Hero1Lp2PageView",
        title: "HeroSection1Lp2.js",
      });
    }
  }, []);

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
    finalLp: "HeroSection1Lp2",
  };

  //------------------------------ START DYNAMIC HEADLINE -------------------------------
  const [headline, setHeadline] = useState(
    "Sell Your House For Cash In As Little As 4 Days!"
  );
  const [subHeadline, setSubHeadline] = useState(
    "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount"
  );

  useEffect(() => {
    const possibleHeadlines = [
      {
        keywords: ["get", "cash"],
        headline: "Get Cash For Your House Fast!",
        subHeadline:
          "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["cash", "out"],
        headline: "Check Your Home Cash Out Amount",
        subHeadline:
          "Get a Great Cash Out Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount",
      },
      {
        keywords: ["cash", "refi"],
        headline: "Check Your Home Refi Cash Out Amount",
        subHeadline:
          "Get a Great Cash Refi Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount",
      },
      {
        keywords: ["cash", "refinance"],
        headline: "Check Your Home Refi Cash Out Amount",
        subHeadline:
          "Get a Great Cash Refi Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount",
      },
      {
        keywords: ["cash", "loan"],
        headline: "Check Your Home Cash Out Loan Amount",
        subHeadline:
          "Get a Great Cash Loan Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount",
      },
      {
        keywords: ["sell", "cash"],
        headline: "Sell Your House For Cash Fast",
        subHeadline:
          "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["sell", "cash", "fast"],
        headline: "Sell Your House For Cash Fast",
        subHeadline:
          "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["cash"],
        headline: "Sell Your House For Cash Fast",
        subHeadline:
          "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["sell", "home"],
        headline: "Sell Your House Fast In As Little As 4 Days!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House! Enter Your Address Below To Generate Your Cash Value",
      },
      {
        keywords: ["sell", "house"],
        headline: "Sell Your House Fast In As Little As 4 Days!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House! Enter Your Address Below To Generate Your Cash Value",
      },
      {
        keywords: ["sell", "fast"],
        headline: "Sell Your House Fast In As Little As 4 Days!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House! Enter Your Address Below To Generate Your Cash Value",
      },
      {
        keywords: ["value"],
        headline: "Check the Market Value Of Your House!",
        subHeadline:
          "Check Your House Value and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["valuation"],
        headline: "Check the Market Value Of Your House!",
        subHeadline:
          "Check Your House Value and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["worth"],
        headline: "Check the Market Worth Of Your House!",
        subHeadline:
          "Check Your House Value and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["without", "realtor"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["no", "realtor"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["without", "agent"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["no", "agent"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["without", "repairs"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["without", "contingencies"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["without", "showings"],
        headline: "Sell Your House Fast With Showings Or Contingencies!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["no", "repairs"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["no", "contingencies"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
      {
        keywords: ["no", "showings"],
        headline: "Sell Your House Fast With Showings Or Contingencies!",
        subHeadline:
          "Check Your Sell Price and Get an Instant Cash Offer for Your House.  Enter Your Address Below To Generate Your Cash Offer",
      },
    ];

    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("kw");
    if (keyword) {
      const sanitizedKeyword = keyword
        .replace(/[^a-z0-9\s]/gi, "")
        .toLowerCase();
      const keywordWords = sanitizedKeyword.split(" ");
      let headlineSet = false;

      for (let i = 0; i < possibleHeadlines.length; i++) {
        if (headlineSet) break;
        if (
          possibleHeadlines[i].keywords.every((kw) => keywordWords.includes(kw))
        ) {
          setHeadline(possibleHeadlines[i].headline);
          setSubHeadline(possibleHeadlines[i].subHeadline);
          headlineSet = true;
        }
      }

      if (!headlineSet) {
        setHeadline("Sell Your House Fast For Cash Fast!");
        setSubHeadline(
          "We Buy Houses In Any Condition. Get an Instant Cash Offer Now!"
        );
      }
    }
  }, []);
  //------------------------------ END DYNAMIC HEADLINE -------------------------------

  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const streetRef = useRef(null);

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

  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = formValidation();
    if (isValid === true) {
      sendEmail();
      props.nextStep(2);
      setErrorMessage(""); // Reset error message on success
    }
    if (isValid === false) {
      // Set error message when validation fails
      setErrorMessage("Please fill out all fields to generate your cash offer");
    }
  };

  const formValidation = () => {
    if (props.formData.street.trim().length < 7) {
      streetRef.current.className =
        "hero-middle-street-field-container-1Lp2-invalid";
      return false;
    }

    if (props.formData.name.trim().length > 50) {
      nameRef.current.className =
        "hero-middle-name-field-container-1Lp2-invalid";
      return false;
    }

    if (props.formData.name.trim().length < 5) {
      phoneRef.current.className =
        "hero-middle-phone-field-container-1Lp2-invalid";
      return false;
    }

    if (props.formData.name.trim().length > 15) {
      phoneRef.current.className =
        "hero-middle-phone-field-container-1Lp2-invalid";
      return false;
    }

    // const phone = props.formData.phone.trim();
    // const phonePattern =
    //   /^(\+\d{1,2}\s?)?1?-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

    // if (!phonePattern.test(phone)) {
    //   phoneRef.current.className =
    //     "hero-middle-street-field-container-1Lp2i-invalid";
    //   return false;
    // }
    else {
      return true;
    }
  };

  return (
    <div className="hero-1Lp2-full-width-parent">
      <div className="HeroSection1Lp2">
        <div className="hero-1Lp2-middle-postioner">
          <div className="hero-middle-section-1Lp2">
            <div className="hero-middle-headline-1Lp2">{headline}</div>

            <div className="hero-middle-section-text-1Lp2">{subHeadline}</div>
            <div className="hero-middle-form-container-1Lp2">
              {/* <div className="hero-left-zip-field-container-1">ZIP CODE</div> */}
              <input
                ref={streetRef}
                autocomplete="street-address"
                type="text"
                placeholder="Street address"
                className="hero-middle-street-field-container-1Lp2"
                value={props.formData.street}
                onChange={(e) =>
                  props.setFormData({
                    ...props.formData,
                    street: e.target.value,
                  })
                }
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Street address")}
              />
              <input
                ref={nameRef}
                autocomplete="name"
                type="text"
                placeholder="Full name"
                className="hero-middle-name-field-container-1Lp2"
                value={props.formData.name}
                onChange={(e) =>
                  props.setFormData({ ...props.formData, name: e.target.value })
                }
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Name")}
              />

              <input
                ref={phoneRef}
                autocomplete="Phone"
                type="text"
                placeholder="Phone"
                className="hero-middle-phone-field-container-1Lp2"
                value={props.formData.phone}
                onChange={(e) =>
                  props.setFormData({
                    ...props.formData,
                    phone: e.target.value,
                  })
                }
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Phone")}
              />
              <button
                className="hero-middle-form-button-1Lp2"
                onClick={(e) => handleSubmit(e)}
              >
                VIEW OFFER
              </button>
            </div>
            {errorMessage && (
              <div className="hero-1Lp2-error-message">{errorMessage}</div>
            )}
          </div>
        </div>

        {/* <FoldBottom /> */}

        <FoldBottom />

        {/* FORM AGAIN */}
      </div>

      <div className="HeroSection1Lp2-below-fold">
        <div className="hero-1Lp2-full-width-border" id="about">
          <div className="hero-1Lp2-below-fold-about-us-headline">About Us</div>

          <div className="hero-1Lp2-below-fold-about-us-parent-container">
            <div className="hero-1Lp2-below-fold-about-us-left-right-container">
              <img
                className="hero-1Lp2-below-fold-about-us-left-image"
                // homecollage
                src={homecollage}
                alt="Sell For Cash Online Aobut Us"
              />
              <img
                className="hero-1Lp2-below-fold-about-us-left-image-mobile"
                // homecollage
                src={homecollagewide}
                alt="Sell For Cash Online Aobut Us"
              />

              <div className="hero-1Lp2-below-fold-about-us-right">
                {/* <div className="hero-1Lp2-below-fold-about-us-right-headline">
                  We'll buy your house, for cash, in any condition.{" "}
                </div> */}
                <div className="hero-1Lp2-below-fold-about-us-right-text">
                  At Sell For Cash Online, we've simplified and streamlined the
                  home selling process. No more realtor meetings, repairs,
                  endless costs, or complicated closings. We pride ourselves in
                  providing great cash offers to anyone looking to get out of
                  their house as quickly or as easily as possible. No matter
                  what condition your house is in or what your timeline is, we
                  can help! Give us a call or fill out the form below to receive
                  your cash offer now.<br></br>
                  <br></br>Sell For Cash Online is a family run business that
                  started in Atlanta, GA, and has expanded nationwide. Our
                  absolute priority is giving our clients an excellent home
                  selling exeprience, no matter the timeline or condition of the
                  home. Reach out to us, we'd love to help in any way we can!{" "}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-1Lp2-full-width-border-alt" id="how-it-works">
          <div className="hero-1Lp2-below-fold-how-it-works-container">
            <div className="hero-1Lp2-below-fold-how-it-works-headline">
              How It Works
            </div>
            <div className="hero-1Lp2-below-fold-how-it-works-points-grid">
              <div className="hero-1Lp2-below-fold-how-it-works-individual-point">
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1Lp2-how-it-works-bullet-number-and-text">
                    <div className="hero-1Lp2-how-it-works-bullet-number">
                      1
                    </div>
                    <div className="hero-1Lp2-how-it-works-bullet-text">
                      Enter Your Address
                    </div>
                  </div>
                </div>
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-text">
                  Enter your address in the form to get started. We’ll ask you a
                  few questions about your house. If you’re ready to move
                  forward, we’ll schedule an appointment to see your home in
                  person.
                </div>
              </div>
              <div className="hero-1Lp2-below-fold-how-it-works-individual-point">
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1Lp2-how-it-works-bullet-number-and-text">
                    <div className="hero-1Lp2-how-it-works-bullet-number">
                      2
                    </div>
                    <div className="hero-1Lp2-how-it-works-bullet-text">
                      Get Your Offer
                    </div>
                  </div>
                </div>
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-text">
                  We’ll make you a cash offer for your house “as is” within 24
                  hours. If you accept the offer, we’ll set up a closing to
                  complete the transaction. It’s that easy!
                </div>
              </div>
              <div className="hero-1Lp2-below-fold-how-it-works-individual-point">
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1Lp2-how-it-works-bullet-number-and-text">
                    <div className="hero-1Lp2-how-it-works-bullet-number">
                      3
                    </div>
                    <div className="hero-1Lp2-how-it-works-bullet-text">
                      Close Quickly
                    </div>
                  </div>
                </div>
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-text">
                  Tired of waiting months to sell your house? We can close in as
                  little as 7 days from the date you accept our offer. We can
                  even help you with moving and relocation services!
                </div>
              </div>
            </div>
            <div className="hero-1Lp2-below-fold-summary-text">
              At Sell For Cash Online we want to take the stress out of selling.
            </div>
          </div>
        </div>

        <div className="hero-1Lp2-full-width-border" id="benefits">
          <div className="hero-1Lp2-below-fold-benefits-container">
            <div className="hero-1Lp2-below-fold-benefits-headline">
              Benefits of Working With Sell For Cash Online
            </div>
            <div className="hero-1Lp2-below-fold-benefits-points-grid">
              <div className="hero-1Lp2-below-fold-benefits-individual-point">
                <div className="hero-1Lp2-below-fold-benefits-individual-point-headline">
                  <div className="hero-1Lp2-benefits-bullet-number-and-text">
                    <div className="hero-1Lp2-benefits-bullet-number">1</div>
                    <div className="hero-1Lp2-benefits-bullet-text">
                      No Repairs, Closing Costs, or Time Consuming Listings
                    </div>
                  </div>
                </div>
                <div className="hero-1Lp2-below-fold-benefits-individual-point-text">
                  We’ll make you a cash offer for your house “as is” within 24
                  hours. No contingencies, repairs, or listing prep necessary.
                  You can receive cash for your home in as little as 14 days.
                </div>
              </div>
              <div className="hero-1Lp2-below-fold-benefits-individual-point">
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1Lp2-benefits-bullet-number-and-text">
                    <div className="hero-1Lp2-benefits-bullet-number">2</div>
                    <div className="hero-1Lp2-benefits-bullet-text">
                      Quick Transactions
                    </div>
                  </div>
                </div>
                <div className="hero-1Lp2-below-fold-benefits-individual-point-text">
                  No more waiting for buyers to get approved for financing. We
                  have the cash to buy your house without any need for loan
                  approval or any other time consuming processes.
                </div>
              </div>
              <div className="hero-1Lp2-below-fold-benefits-individual-point">
                <div className="hero-1Lp2-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1Lp2-benefits-bullet-number-and-text">
                    <div className="hero-1Lp2-benefits-bullet-number">3</div>
                    <div className="hero-1Lp2-benefits-bullet-text">
                      Packing, Moving, and Relocation Assistance
                    </div>
                  </div>
                </div>
                <div className="hero-1Lp2-below-fold-benefits-individual-point-text">
                  Not only will we buy your house, but we can also help you with
                  the moving process. We can help you pack, move, and even help
                  you find a new place, whether you plan on buying or renting.
                </div>
              </div>
            </div>
            <div className="hero-1Lp2-below-fold-summary-text">
              Choosing Sell For Cash Online means selling your house fast and
              and for a great price, without the hassle.
            </div>
          </div>
        </div>

        <div className="hero-1Lp2-below-fold-contact-container" id="contact">
          <div className="hero-1Lp2-below-fold-contact-headline">
            <div className="hero-1Lp2-below-fold-contact-headline-text">
              Contact Us
            </div>
            <div className="hero-1Lp2-below-fold-contact-headline-subtext">
              We’re here to help. Call us at 770-765-7969 or fill out the form
              below.
            </div>
          </div>
        </div>
        {/* FORM AGAIN */}
        <div className="hero-1Lp2-middle-form-postioner">
          <div className="hero-middle-form-container-1Lp2">
            {/* <div className="hero-left-zip-field-container-1">ZIP CODE</div> */}
            <input
              ref={streetRef}
              autocomplete="street-address"
              type="text"
              placeholder="Enter your street address"
              className="hero-middle-zip-field-container-1Lp2"
              value={props.formData.street}
              onChange={(e) =>
                props.setFormData({ ...props.formData, street: e.target.value })
              }
              onFocus={(e) => (e.target.placeholder = "")}
              onBlur={(e) =>
                (e.target.placeholder = "Enter your street address...")
              }
            />
            <button
              className="hero-middle-form-button-1Lp2"
              onClick={(e) => handleSubmit(e)}
            >
              VIEW OFFERS
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default HeroSection1Lp2;
