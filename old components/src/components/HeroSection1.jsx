// lp variations
// just street address,
// street address and phone auto filled beneath,
// street address name and phone auto filled beneath,
// street address, name, phone, and email filled beneath

import "./HeroSection1.css";
import homecollage from "../assets/images/homecollage.jpg";
import homecollagewide from "../assets/images/homecollagewide.jpg";
import FoldBottom from "./FoldBottom";
import { useEffect, useRef, useState } from "react";
import TagManager from "react-gtm-module";
import Footer from "./Footer";
import emailjs from "emailjs-com";
import ReactPixel from "react-facebook-pixel";
const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;

TagManager.initialize(tagManagerArgs);

function HeroSection1(props) {
  // !!!!!!!!!!!!!!!!!!!!!!!!   LIMIT TO ONE TIME  -----------------

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 2) {
      window.dataLayer.push({
        event: "Hero1PageView",
        title: "HeroSection1.js",
      });
      ReactPixel.track("Lead", {
        // value: 10.0,
        // currency: "USD",
      });
    }
  }, []);
  useEffect(() => {
    ReactPixel.init("268197213521133");
    ReactPixel.pageView();
  }, []);
  var templateParamsStreetAddress = {
    LeadSource: "Google Search",
    street: props.formData.street,
    zip: props.formData.zip,
    campaignid: props.clickData.campaignid,
    adgroupid: props.clickData.adgroupid,
    keyword: props.clickData.keyword,
    device: props.clickData.device,
    dynamicHeadline: props.formData.dynamicHeadline,
    dynamicSubheadline: props.formData.dynamicSubheadline,
    gclid: props.clickData.gclid,
    finalLp: "HeroSection1",
  };

  var templateParamsRegistration = {
    LeadSource: "GA",
    name: props.formData.name,
    email: props.formData.email,
    phone: props.formData.phone,
    street: props.formData.street,
  };

  const [overlayVisible, setOverlayVisible] = useState(false);

  // Function to handle closing of the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
  };

  //------------------------------ START DYNAMIC HEADLINE -------------------------------
  const [headline, setHeadline] = useState(
    "Sell Your House For Cash In As Little As 4 Days!"
  );
  const [subHeadline, setSubHeadline] = useState(
    "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount"
  );
  const [buttonText, setButtonText] = useState("CHECK OFFER");
  const [invalidMessage, setInvalidMessage] = useState(
    "Please enter a valid address to check your cash offer"
  );
  const [phoneInvalidMessage, setPhoneInvalidMessage] = useState(
    "Valid phone required to receive your cash offer details via text message (No Spam Ever)"
  );
  const [formHeadline, setFormHeadline] = useState(
    "Address Confirmed. Where do you want to send your requested details?"
  );
  const [thankYouHeadline, setThankYouHeadline] = useState(
    "Cash Offer Request Completed!"
  );
  const [thankYouSubHeadline, setThankYouSubHeadline] = useState(
    "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!"
  );

  useEffect(() => {
    const possibleHeadlines = [
      {
        keywords: ["get", "cash"],
        headline: "Get Cash For Your House Fast!",
        subHeadline:
          "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your cash offer details?",
        thankYouHeadline: "Cash Offer Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["cash", "out"],
        headline: "Check Your Home Cash Out Amount",
        subHeadline:
          "Get a great cash out offer for your house and close fast! Enter your address below to generate your cash amount",
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your cash offer details?",
        thankYouHeadline: "Cash Offer Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["cash", "refi"],
        headline: "Check Your Home Refi Cash Out Amount",
        subHeadline:
          "Get a great cash refi offer for your house and close fast! Enter your address below to generate your cash amount",
        buttonText: "CHECK AMOUNT",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your your available cash refi details?",
        thankYouHeadline: "Cash Refi Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash out refi offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["cash", "refinance"],
        headline: "Check Your Home Refi Cash Out Amount",
        subHeadline:
          "Get a great cash refi offer for your house and close fast! Enter your address below to generate your cash amount",
        buttonText: "CHECK AMOUNT",
        invalidMessage:
          "Please enter a valid address to check your cash amount",
        phoneInvalidMessage:
          "Valid phone required to receive your cash amount details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your available cash refi details?",
        thankYouHeadline: "Cash Refi Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash out refi offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["cash", "loan"],
        headline: "Check Your Home Cash Out Loan Amount",
        subHeadline:
          "Get a great cash loan offer for your house and close fast! Enter your address below to generate your cash amount",
        buttonText: "CHECK AMOUNT",
        invalidMessage:
          "Please enter a valid address to check your cash amount",
        phoneInvalidMessage:
          "Valid phone required to receive your cash amount details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your available cash details?",
        thankYouHeadline: "Cash Out Loan Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash out offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["sell", "cash"],
        headline: "Sell Your House For Cash Fast",
        subHeadline:
          "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your cash offer?",
        thankYouHeadline: "Cash Offer Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["sell", "cash", "fast"],
        headline: "Sell Your House For Cash Fast",
        subHeadline:
          "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your cash offer?",
        thankYouHeadline: "Cash Offer Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
      },
      {
        keywords: ["cash"],
        headline: "Sell Your House For Cash Fast",
        subHeadline:
          "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your cash offer?",
        thankYouHeadline: "Cash Offer Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
      },

      {
        keywords: ["sell", "home"],
        headline: "Sell Your House Fast In As Little As 4 Days!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house! Enter your address below to generate your cash value",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["sell", "house"],
        headline: "Sell Your House Fast In As Little As 4 Days!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house! Enter your address below to generate your cash value",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["sell", "fast"],
        headline: "Sell Your House Fast In As Little As 4 Days!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house! Enter your address below to generate your cash value",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your fast sell offer?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["value"],
        headline: "Check The Market Value Of Your House!",
        subHeadline:
          "Check your home value fast. Enter your address below to generate.",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["valuation"],
        headline: "Check The Market Value Of Your House!",
        subHeadline:
          "Check your home value fast. Enter your address below to generate.",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["worth"],
        headline: "Check The Market Value Of Your House!",
        subHeadline:
          "Check your home value fast. Enter your address below to generate.",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["without", "realtor"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["no", "realtor"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["without", "agent"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["no", "agent"],
        headline: "Sell Your House Fast Without An Agent!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["without", "repairs"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["without", "contingencies"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["without", "showings"],
        headline: "Sell Your House Fast With Showings Or Contingencies!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["no", "repairs"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["no", "contingencies"],
        headline: "Sell Your House Fast With No Repairs Or Contingencies!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
      {
        keywords: ["no", "showings"],
        headline: "Sell Your House Fast With Showings Or Contingencies!",
        subHeadline:
          "Check your sell price and get an instant cash offer for your house. Enter your address below to generate your cash offer",
        buttonText: "CHECK VALUE",
        invalidMessage: "Please enter a valid address to check your home value",
        phoneInvalidMessage:
          "Valid phone required to receive your home value details via text message (No Spam Ever)",
        formHeadline:
          "Address Confirmed. Where do you want to send your home value details?",
        thankYouHeadline: "Home Value Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your home value details at your contact number shortly, thank you!",
      },
    ];

    const urlParams = new URLSearchParams(window.location.search);
    const keyword = urlParams.get("keyword");
    let headlineSet = false;

    if (keyword) {
      const sanitizedKeyword = keyword
        .replace(/[^a-z0-9\s]/gi, "")
        .toLowerCase();
      const keywordWords = sanitizedKeyword.split(" ");

      for (let i = 0; i < possibleHeadlines.length; i++) {
        if (headlineSet) break;
        if (
          possibleHeadlines[i].keywords.every((kw) => keywordWords.includes(kw))
        ) {
          setHeadline(possibleHeadlines[i].headline);
          setSubHeadline(possibleHeadlines[i].subHeadline);
          setButtonText(possibleHeadlines[i].buttonText);
          setInvalidMessage(possibleHeadlines[i].invalidMessage);
          setPhoneInvalidMessage(possibleHeadlines[i].phoneInvalidMessage);
          setFormHeadline(possibleHeadlines[i].formHeadline);

          props.setFormData({
            ...props.formData,
            dynamicHeadline: possibleHeadlines[i].headline,
            dynamicSubHeadline: possibleHeadlines[i].subHeadline,
            thankYouHeadline: possibleHeadlines[i].thankYouHeadline,
            thankYouSubHeadline: possibleHeadlines[i].thankYouSubHeadline,
          });
          headlineSet = true;
        }
      }
    }

    if (!headlineSet) {
      setHeadline("Sell Your House For Cash Fast!");
      setSubHeadline(
        "We Buy Houses In Any Condition. Get an Instant Cash Offer Now!"
      );
      setThankYouHeadline("Home Value Request Completed!");
      setThankYouSubHeadline(
        "You'll be receiving your home value details at your contact number shortly, thank you!"
      );
      props.setFormData({
        ...props.formData,
        dynamicHeadline: "Sell Your House For Cash Fast!",
        dynamicSubHeadline:
          "We Buy Houses In Any Condition. Get an Instant Cash Offer Now!",
        thankYouHeadline: "Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your requested details at your contact number shortly, thank you!",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //------------------------------ END DYNAMIC HEADLINE -------------------------------

  const streetRef = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    let autocomplete;
    const currentStreetRef = streetRef.current;

    // Define the onInput function
    const onInput = () => {
      autocomplete = new window.google.maps.places.Autocomplete(
        streetRef.current
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        props.setFormData({
          ...props.formData,
          street: place.formatted_address,
        });
      });
    };

    if (typeof window !== "undefined" && window.google) {
      // Initialize Google Places Autocomplete when the user starts typing in the input
      currentStreetRef.addEventListener("input", onInput);
    }

    // Cleanup function to remove the event listener and clear Google maps listeners
    return () => {
      if (currentStreetRef) {
        currentStreetRef.removeEventListener("input", onInput);
      }
      if (autocomplete) {
        window.google.maps.event.clearInstanceListeners(autocomplete);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Check if there's a hash in the URL
    const hash = window.location.hash;

    if (hash) {
      // If there is, remove the '#' at the start
      const id = hash.substring(1);

      // Find the element with that ID
      const element = document.getElementById(id);

      if (element) {
        // If the element exists, scroll to it
        element.scrollIntoView();
      }
    }
  }, []);

  const sendAddress = (e) => {
    emailjs
      .send(
        "service_zeuf0n8",
        "template_fw24ban",
        templateParamsStreetAddress,
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

  const sendRegistration = (e) => {
    emailjs
      .send(
        "service_zeuf0n8",
        "template_kuv08p4",
        templateParamsRegistration,
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
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const isValid = formValidation();
    if (isValid === true) {
      sendAddress();
      setOverlayVisible(true); // Show the overlay form after successful email sending
      setErrorMessage(""); // Reset error message on success
    }
    if (isValid === false) {
      // Set error message when validation fails
      setErrorMessage("Please enter a valid address to check your cash offer");
    }
  };

  const phoneValidation = (phone) => {
    const phoneRegex =
      /^(?:(?:\+1\s?)?[(]?[2-9][0-8][0-9][)]?\s?[-.\u200B]?[2-9][0-9]{2}\s?[-.\u200B]?[0-9]{4})$/;
    return phoneRegex.test(phone);
  };

  const formValidation = () => {
    if (props.formData.street.trim().length < 5) {
      streetRef.current.className = "hero-middle-zip-field-container-1-invalid";
      return false;
    } else {
      return true;
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();

    // Reset error messages before validating
    setPhoneErrorMessage("");

    if (!phoneValidation(props.formData.phone)) {
      // If the phone is not valid, set an error message
      setPhoneErrorMessage(
        "Valid phone required to receive your cash offer details via text message (No Spam Ever)"
      );
    } else {
      // If the phone is valid, send the registration and proceed to the next step
      sendRegistration();
      props.nextStep(2);
    }
  };

  return (
    <div className="hero-1-full-width-parent">
      <div className="HeroSection1">
        <div className="hero-1-middle-postioner">
          <div className="hero-middle-section-1 fade-in">
            <div className="hero-middle-headline-1">{headline}</div>

            <div className="hero-middle-section-text-1">{subHeadline}</div>
            <div className="hero-middle-form-container-1">
              {/* <div className="hero-left-zip-field-container-1">ZIP CODE</div> */}
              <input
                ref={streetRef}
                autocomplete="street-address"
                type="text"
                placeholder="Street address..."
                className="hero-middle-zip-field-container-1"
                value={
                  props.formData.street +
                  (props.formData.zip ? " " + props.formData.zip : "") // If zip exists, add it with a space
                }
                onChange={(e) =>
                  props.setFormData({
                    ...props.formData,
                    street: e.target.value,
                  })
                }
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "Street address...")}
              />
              <button
                className="hero-middle-form-button-1"
                onClick={(e) => handleSubmit(e)}
              >
                {buttonText}
              </button>
            </div>
            {errorMessage && (
              <div className="error-message">{invalidMessage}</div>
            )}
          </div>
        </div>

        {/* <FoldBottom /> */}

        {/* Overlay form */}
        {overlayVisible && (
          <div className="overlay">
            <div className="overlay-form-container">
              <button onClick={closeOverlay} className="overlay-close-button">
                X
              </button>
              {/* Add a close button */}

              <div className="overlay-form-headline">{formHeadline}</div>
              <form className="overlay-form-fields">
                <input
                  autocomplete="name"
                  placeholder="Name..."
                  className="overlay-form-input"
                  type="text"
                  value={props.formData.name}
                  onChange={(e) =>
                    props.setFormData({
                      ...props.formData,
                      name: e.target.value,
                    })
                  }
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "name")}
                />
                {/* <input
                  autocomplete="email"
                  placeholder="Email (used as username)"
                  className="overlay-form-input"
                  type="text"
                  value={props.formData.email}
                  onChange={(e) =>
                    props.setFormData({
                      ...props.formData,
                      email: e.target.value,
                    })
                  }
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) =>
                    (e.target.placeholder = "email (used as username)")
                  }
                /> */}
                <input
                  autocomplete="phone"
                  placeholder="Phone (receive quick offer text)"
                  className="overlay-form-input"
                  type="text"
                  value={props.formData.phone}
                  onChange={(e) =>
                    props.setFormData({
                      ...props.formData,
                      phone: e.target.value,
                    })
                  }
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) =>
                    (e.target.placeholder = "phone (used as password)")
                  }
                />
                {phoneErrorMessage && (
                  <div className="phone-error-message">
                    {phoneInvalidMessage}
                  </div>
                )}

                <button
                  className="hero-registration-form-button-1"
                  onClick={(e) => handleRegister(e)}
                >
                  {buttonText}
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="hero-1-form-auto-container">
          <input
            autocomplete="name"
            type="text"
            value={props.formData.name}
            onChange={(e) =>
              props.setFormData({ ...props.formData, name: e.target.value })
            }
          />
          {/* <input
          autocomplete="street-address"
          type="text"
          value={props.formData.street}
          onChange={(e) =>
            props.setFormData({ ...props.formData, street: e.target.value })
          }
        /> */}
          <input
            autocomplete="phone"
            type="text"
            value={props.formData.phone}
            onChange={(e) =>
              props.setFormData({ ...props.formData, phone: e.target.value })
            }
          />
          <input
            autocomplete="email"
            type="text"
            value={props.formData.email}
            onChange={(e) =>
              props.setFormData({ ...props.formData, email: e.target.value })
            }
          />
          <input
            autocomplete="postal-code"
            type="text"
            value={props.formData.zip}
            onChange={(e) =>
              props.setFormData({ ...props.formData, zip: e.target.value })
            }
          />
        </div>
        {/* <FoldBottom /> */}

        {/* FORM AGAIN */}
      </div>

      <div className="HeroSection1-below-fold">
        <div className="hero-1-full-width-border" id="about">
          <div className="hero-1-below-fold-about-us-headline">About Us</div>

          <div className="hero-1-below-fold-about-us-parent-container">
            <div className="hero-1-below-fold-about-us-left-right-container">
              <img
                className="hero-1-below-fold-about-us-left-image"
                // homecollage
                src={homecollage}
                alt="Sell For Cash Online Aobut Us"
              />
              <img
                className="hero-1-below-fold-about-us-left-image-mobile"
                // homecollage
                src={homecollagewide}
                alt="Sell For Cash Online Aobut Us"
              />

              <div className="hero-1-below-fold-about-us-right">
                {/* <div className="hero-1-below-fold-about-us-right-headline">
                  We'll buy your house, for cash, in any condition.{" "}
                </div> */}
                <div className="hero-1-below-fold-about-us-right-text">
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

        <div className="hero-1-full-width-border-alt" id="how-it-works">
          <div className="hero-1-below-fold-how-it-works-container">
            <div className="hero-1-below-fold-how-it-works-headline">
              How It Works
            </div>
            <div className="hero-1-below-fold-how-it-works-points-grid">
              <div className="hero-1-below-fold-how-it-works-individual-point">
                <div className="hero-1-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1-how-it-works-bullet-number-and-text">
                    <div className="hero-1-how-it-works-bullet-number">1</div>
                    <div className="hero-1-how-it-works-bullet-text">
                      Enter Your Address
                    </div>
                  </div>
                </div>
                <div className="hero-1-below-fold-how-it-works-individual-point-text">
                  Enter your address in the form to get started. We’ll ask you a
                  few questions about your house. If you’re ready to move
                  forward, we’ll schedule an appointment to see your home in
                  person.
                </div>
              </div>
              <div className="hero-1-below-fold-how-it-works-individual-point">
                <div className="hero-1-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1-how-it-works-bullet-number-and-text">
                    <div className="hero-1-how-it-works-bullet-number">2</div>
                    <div className="hero-1-how-it-works-bullet-text">
                      Get Your Offer
                    </div>
                  </div>
                </div>
                <div className="hero-1-below-fold-how-it-works-individual-point-text">
                  We’ll make you a cash offer for your house “as is” within 24
                  hours. If you accept the offer, we’ll set up a closing to
                  complete the transaction. It’s that easy!
                </div>
              </div>
              <div className="hero-1-below-fold-how-it-works-individual-point">
                <div className="hero-1-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1-how-it-works-bullet-number-and-text">
                    <div className="hero-1-how-it-works-bullet-number">3</div>
                    <div className="hero-1-how-it-works-bullet-text">
                      Close Quickly
                    </div>
                  </div>
                </div>
                <div className="hero-1-below-fold-how-it-works-individual-point-text">
                  Tired of waiting months to sell your house? We can close in as
                  little as 7 days from the date you accept our offer. We can
                  even help you with moving and relocation services!
                </div>
              </div>
            </div>
            <div className="hero-1-below-fold-summary-text">
              At Sell For Cash Online we want to take the stress out of selling.
            </div>
          </div>
        </div>

        <div className="hero-1-full-width-border" id="benefits">
          <div className="hero-1-below-fold-benefits-container">
            <div className="hero-1-below-fold-benefits-headline">
              Benefits of Working With Sell For Cash Online
            </div>
            <div className="hero-1-below-fold-benefits-points-grid">
              <div className="hero-1-below-fold-benefits-individual-point">
                <div className="hero-1-below-fold-benefits-individual-point-headline">
                  <div className="hero-1-benefits-bullet-number-and-text">
                    <div className="hero-1-benefits-bullet-number">1</div>
                    <div className="hero-1-benefits-bullet-text">
                      No Repairs, Closing Costs, or Time Consuming Listings
                    </div>
                  </div>
                </div>
                <div className="hero-1-below-fold-benefits-individual-point-text">
                  We’ll make you a cash offer for your house “as is” within 24
                  hours. No contingencies, repairs, or listing prep necessary.
                  You can receive cash for your home in as little as 14 days.
                </div>
              </div>
              <div className="hero-1-below-fold-benefits-individual-point">
                <div className="hero-1-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1-benefits-bullet-number-and-text">
                    <div className="hero-1-benefits-bullet-number">2</div>
                    <div className="hero-1-benefits-bullet-text">
                      Quick Transactions
                    </div>
                  </div>
                </div>
                <div className="hero-1-below-fold-benefits-individual-point-text">
                  No more waiting for buyers to get approved for financing. We
                  have the cash to buy your house without any need for loan
                  approval or any other time consuming processes.
                </div>
              </div>
              <div className="hero-1-below-fold-benefits-individual-point">
                <div className="hero-1-below-fold-how-it-works-individual-point-headline">
                  <div className="hero-1-benefits-bullet-number-and-text">
                    <div className="hero-1-benefits-bullet-number">3</div>
                    <div className="hero-1-benefits-bullet-text">
                      Packing, Moving, and Relocation Assistance
                    </div>
                  </div>
                </div>
                <div className="hero-1-below-fold-benefits-individual-point-text">
                  Not only will we buy your house, but we can also help you with
                  the moving process. We can help you pack, move, and even help
                  you find a new place, whether you plan on buying or renting.
                </div>
              </div>
            </div>
            <div className="hero-1-below-fold-summary-text">
              Choosing Sell For Cash Online means selling your house fast and
              and for a great price, without the hassle.
            </div>
          </div>
        </div>

        <div className="hero-1-below-fold-contact-container" id="contact">
          <div className="hero-1-below-fold-contact-headline">
            <div className="hero-1-below-fold-contact-headline-text">
              Contact Us
            </div>
            <div className="hero-1-below-fold-contact-headline-subtext">
              We’re here to help. Call us at 770-765-7969 or fill out the form
              below.
            </div>
          </div>
        </div>
        {/* FORM AGAIN */}
      </div>
      <Footer />
    </div>
  );
}

export default HeroSection1;
