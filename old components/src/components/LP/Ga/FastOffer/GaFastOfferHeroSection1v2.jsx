// --- get thank you page dynamic text passing through
// --- possibly slowed down google maps displaying with changes I made, ask alex check

//realtor.com home value is inserting the matched address into the actual field as a user is typing, maybe try this

//-- mobile line height for section 3 suections messed up
//---

import { useEffect, useRef, useState } from "react";
import TagManager from "react-gtm-module";
import Footer from "../../../Footer";
import emailjs from "emailjs-com";
import ReactPixel from "react-facebook-pixel";
import { set } from "react-ga";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import axios from "axios";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import {
  formDataChanged,
  formSubmitted,
  recordChanged,
  verifyCode,
} from "./../../../../formSlice";
import { Marker } from "@react-google-maps/api";
import mapIcon from "../../../../assets/images/mapicon.png";
import "./GaFastOfferHeroSection1.css";
import { useNavigate } from "react-router-dom";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;

TagManager.initialize(tagManagerArgs);

function GaFastOfferHeroSection1v2(props) {
  // !!!!!!!!!!!!!!!!!!!!!!!!   LIMIT TO ONE TIME  -----------------

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 1) {
      window.dataLayer.push({
        event: "GoogleSearchPageView",
      });
    }
  }, []);

  // create function to fire a window.dataLayer.push event to trigger a Google Ads conversion
  const fireAutoFillPhoneConversionEvent = () => {
    // console.log("fireAutoFillPhoneConversionEvent() triggered");
    window.dataLayer.push({
      event: "GoogleSearchAutoFillPhoneRegistration",
    });
  };

  useEffect(() => {
    ReactPixel.init("230683406108508");
    ReactPixel.pageView();
  }, []);

  // fire a window.dataLayer.push event to trigger a Google Ads conversion
  const phoneNumberLeadSubmitted = () => {
    console.log("phoneNumberLeadSubmitted() triggered");
    window.dataLayer.push({
      event: "GaPhoneNumberLeadSubmitted",
    });
  };

  const formData = useSelector((state) => state.form);
  const dispatch = useDispatch();

  const [googlePlacesAddressSelected, setGooglePlacesAddressSelected] =
    useState(false);
  const navigate = useNavigate();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [editInfoOverlayVisible, setEditInfoOverlayVisible] = useState(false);
  const [localFormDisplayStep, setLocalFormDisplayStep] = useState(1);

  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get("keyword");
  const campaignId = urlParams.get("campaignid");
  const adgroupId = urlParams.get("adgroupid");
  const device = urlParams.get("device");
  const gclid = urlParams.get("gclid");
  const [campaignName, setCampaignName] = useState("no ID found");
  const [adgroupName, setAdgroupName] = useState("no ID found");
  const [urlParamsReady, setUrlParamsReady] = useState(false);
  const [campaignNameSet, setCampaignNameSet] = useState(false);
  const [adgroupNameSet, setAdgroupNameSet] = useState(false);

  const streetRef = useRef(null);
  const [autocompleteValue, setAutocompleteValue] = useState("street-address");

  const phoneRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [confirmedAddress, setConfirmedAddress] = useState(null);
  const [mapDisplay, setMapDisplay] = useState(null);

  //create useEffect if urlParamsReady = true, then set campaignName and adgroupName from campaignId and adgroupId
  useEffect(() => {
    if (urlParamsReady) {
      // console.log("urlParamsReady if triggered");
      if (campaignId === "20196006239") {
        setCampaignName("Sell For Cash Form Submit (Google only)");
        setCampaignNameSet(true);
      } else if (campaignId === "20490389456") {
        setCampaignName("Sell For Cash Form Submit (Search Partners)");
        setCampaignNameSet(true);
      } else if (campaignId === "20311247419") {
        setCampaignName(
          "Sell Fast, On Own, No Agent, Form Submit (Google only)"
        );
        setCampaignNameSet(true);
      } else if (campaignId === "20490511649") {
        setCampaignName(
          "Sell Fast, On Own, No Agent, Form Submit (Search Partners)"
        );
        setCampaignNameSet(true);
      } else {
        setCampaignName("not set");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParamsReady]);

  //create useEffect if urlParamsReady = true, then set campaignName and adgroupName from campaignId and adgroupId
  useEffect(() => {
    if (urlParamsReady) {
      // console.log(
      //   "second urlParamsReady if triggered, adggroupID = " + adgroupId
      // );

      if (adgroupId === "149782006756") {
        setAdgroupName("(exact)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "153620745798") {
        setAdgroupName("(phrase)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "151670982418") {
        setAdgroupName("(exact)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "156658963430") {
        setAdgroupName("(phrase)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "153325247952") {
        setAdgroupName("(exact)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "153325247992") {
        setAdgroupName("(phrase)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "156355988601") {
        setAdgroupName("(exact)");
        setAdgroupNameSet(true);
      } else if (adgroupId === "156355988761") {
        setAdgroupName("(phrase)");
        setAdgroupNameSet(true);
      } else {
        setAdgroupName("not set");
        setAdgroupNameSet(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParamsReady]);

  // create useEffect if campaignNameSet = true, then dispatch campaignName and adgroupName
  useEffect(() => {
    if (campaignNameSet) {
      // console.log("campaignNameSet if triggered");
      dispatch(
        formDataChanged({
          campaignName: campaignName,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignNameSet]);

  useEffect(() => {
    if (adgroupNameSet) {
      // console.log("adgroupNameSet if triggered");
      dispatch(
        formDataChanged({
          adgroupName: adgroupName,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adgroupNameSet]);

  useEffect(() => {
    if (urlParams) {
      // console.log("urlParams if triggered");
      setUrlParamsReady(true);
      dispatch(
        formDataChanged({
          keyword: keyword,
          campaignId: campaignId,
          adgroupId: adgroupId,
          device: device,
          gclid: gclid,
          verifyPhone: false,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //useEffect addressConfirmed
  useEffect(() => {
    if (confirmedAddress) {
      // console.log("confirmedAddress if triggered");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedAddress]);

  // useEffect console log localFormDisplayStep
  useEffect(() => {
    // console.log("localFormDisplayStep = " + localFormDisplayStep);
    window.scrollTo(0, 0);
  }, [localFormDisplayStep]);

  // Function to handle closing of the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
    setEditInfoOverlayVisible(false);
  };

  //------------------------------ DECLARE DEFAULT LANDING PAGE TEXT -------------------------------
  const [headline, setHeadline] = useState("Sell Your House For Cash Fast!");
  const [subHeadline, setSubHeadline] = useState(
    "Get a Great Cash Offer For Your House and Close Fast! Enter Your Address Below To Generate Your Cash Amount"
  );
  const [confirmWhereHeadline, setConfirmWhereHeadline] = useState(
    "Great! Now confirm where you'd like us to text your official cash offer:"
  );
  const [buttonText, setButtonText] = useState("CHECK OFFER");
  const [invalidMessage, setInvalidMessage] = useState(
    "Please enter a valid address to check your cash offer"
  );
  const [phoneInvalidMessage, setPhoneInvalidMessage] = useState(
    "Valid phone required to receive your cash offer details via text message (No Spam Ever)"
  );
  const [formHeadline, setFormHeadline] = useState(
    "Where should we send your cash offer?"
  );
  const [thankYouHeadline, setThankYouHeadline] = useState(
    "Cash Offer Request Completed!"
  );
  const [thankYouSubHeadline, setThankYouSubHeadline] = useState(
    "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!"
  );

  //------------------------------ REASSIGN LANDING PAGE TEXT BASED ON CAMPAIGN ID -------------------------------

  //-------START OF IF() DYNAMIC FOR: Sell For Cash Form Submit Campaigns
  useEffect(() => {
    if (campaignId === "20196006239" || campaignId === "20490389456") {
      // 20196006239 = Sell For Cash Form Submit (Google only)
      // 20434712523 = Sell For Cash Form Submit (Search Partenrs)
      const possibleHeadlines = [
        {
          keywords: ["get", "cash"],
          headline: "Get Cash For Your House Fast!",
          subHeadline:
            "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your official cash offer:",
          buttonText: "CHECK OFFER",
          invalidMessage:
            "Please enter a valid address to check your cash offer",
          phoneInvalidMessage:
            "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
          formHeadline: "Where should we send your cash offer?",
          thankYouHeadline: "Cash Offer Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
        },
        {
          keywords: ["cash", "out"],
          headline: "Check Your Home Cash Out Amount",
          subHeadline:
            "Get a great cash out offer for your house and close fast! Enter your address below to generate your cash amount",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your official cash out offer:",
          buttonText: "CHECK OFFER",
          invalidMessage:
            "Please enter a valid address to check your cash offer",
          phoneInvalidMessage:
            "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
          formHeadline: "Where should we send your cash offer?",
          thankYouHeadline: "Cash Offer Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
        },
        {
          keywords: ["sell", "cash"],
          headline: "Sell Your House For Cash Fast",
          subHeadline:
            "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your official cash offer:",
          buttonText: "CHECK OFFER",
          invalidMessage:
            "Please enter a valid address to check your cash offer",
          phoneInvalidMessage:
            "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
          formHeadline: "Where should we send your cash offer?",
          thankYouHeadline: "Cash Offer Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
        },
        {
          keywords: ["sell", "cash", "fast"],
          headline: "Sell Your House For Cash Fast",
          subHeadline:
            "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your official cash offer:",
          buttonText: "CHECK OFFER",
          invalidMessage:
            "Please enter a valid address to check your cash offer",
          phoneInvalidMessage:
            "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
          formHeadline: "Where should we send your cash offer?",
          thankYouHeadline: "Cash Offer Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
        },
        {
          keywords: ["cash"],
          headline: "Sell Your House For Cash Fast",
          subHeadline:
            "Get a great cash offer for your house and close fast! Enter your address below to generate your cash offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your official cash offer:",
          buttonText: "CHECK OFFER",
          invalidMessage:
            "Please enter a valid address to check your cash offer",
          phoneInvalidMessage:
            "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
          formHeadline: "Where should we send your cash offer?",
          thankYouHeadline: "Cash Offer Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
        },
      ];

      let headlineSet = false;

      if (keyword) {
        const sanitizedKeyword = keyword
          .replace(/[^a-z0-9\s]/gi, "")
          .toLowerCase();
        const keywordWords = sanitizedKeyword.split(" ");

        for (let i = 0; i < possibleHeadlines.length; i++) {
          if (headlineSet) break;
          if (
            possibleHeadlines[i].keywords.every((kw) =>
              keywordWords.includes(kw)
            )
          ) {
            setHeadline(possibleHeadlines[i].headline);
            setSubHeadline(possibleHeadlines[i].subHeadline);
            setConfirmWhereHeadline(possibleHeadlines[i].confirmWhereHeadline);
            setButtonText(possibleHeadlines[i].buttonText);
            setInvalidMessage(possibleHeadlines[i].invalidMessage);
            setPhoneInvalidMessage(possibleHeadlines[i].phoneInvalidMessage);
            setFormHeadline(possibleHeadlines[i].formHeadline);

            dispatch(
              formDataChanged({
                dynamicHeadline: possibleHeadlines[i].headline,
                dynamicSubHeadline: possibleHeadlines[i].subHeadline,
                thankYouHeadline: possibleHeadlines[i].thankYouHeadline,
                thankYouSubHeadline: possibleHeadlines[i].thankYouSubHeadline,
                url: window.location.href,
                trafficSource: "Google Search",
              })
            );
            headlineSet = true;
          }
        }
      }

      if (!headlineSet) {
        setHeadline("Sell Your House For Cash Fast!");
        setSubHeadline(
          "We Buy Houses In Any Condition. Get an Instant Cash Offer Now!"
        );
        setButtonText("CHECK OFFER");
        setConfirmWhereHeadline(
          "Great! Now confirm where you'd like us to text your official cash offer:"
        );

        setThankYouHeadline("Home Value Request Completed!");
        setThankYouSubHeadline(
          "You'll be receiving your home value details at your contact number shortly, thank you!"
        );
        dispatch(
          formDataChanged({
            dynamicHeadline: "Sell Your House For Cash Fast!",
            dynamicSubHeadline:
              "We Buy Houses In Any Condition. Get an Instant Cash Offer Now!",
            thankYouHeadline: "Request Completed!",
            thankYouSubHeadline:
              "You'll be receiving your requested details at your contact number shortly, thank you!",
            trafficSource: "Google Search",
          })
        );
      }
    }
    //-------END OF IF() DYNAMIC FOR: Sell For Cash Form Submit Campaigns

    //-------START OF IF() DYNAMIC FOR: Sell Fast, On Own, No Agent, Campaigns
    if (campaignId === "20490511649" || campaignId === "20311247419") {
      // 20311247419 = Sell Fast, On Own, No Agent, Form Submit
      const possibleHeadlines = [
        {
          keywords: ["sell", "home"],
          headline: "Sell Your House Fast With No Stress!",
          subHeadline:
            "We Help Sell Houses In Any Condition Fast. Check Your Easy Sell Options Now!",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your fast sell details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive your fast sell details via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your fast sell details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your fast sell details at your contact number shortly, thank you!",
        },
        {
          keywords: ["sell", "house"],
          headline: "Sell Your House Fast With No Stress!",
          subHeadline:
            "We Help Sell Houses In Any Condition Fast. Check Your Easy Sell Options Now!",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your fast sell details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive your fast sell details via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your fast sell details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your fast sell details at your contact number shortly, thank you!",
        },
        {
          keywords: ["sell", "fast"],
          headline: "Sell Your House Fast With No Stress!",
          subHeadline:
            "We Help Sell Houses In Any Condition Fast. Check Your Easy Sell Options Now!",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your fast sell details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive your fast sell details via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your fast sell details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your fast sell details at your contact number shortly, thank you!",
        },
        {
          keywords: ["without", "realtor"],
          headline: "Sell Your House Fast Without An Agent!",
          subHeadline:
            "Check your sell price and get an instant offer options for your house. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your fast sell details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["no", "realtor"],
          headline: "Sell Your House Fast Without An Agent!",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          subHeadline:
            "Check your sell price and get an instant offer options for your house. Enter your address below to generate your no stress offer",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["without", "agent"],
          headline: "Sell Your House Fast Without An Agent!",
          subHeadline:
            "Check your sell price and get an instant offer options for your house. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["no", "agent"],
          headline: "Sell Your House Fast Without An Agent!",
          subHeadline:
            "Check your sell price and get an instant offer options for your house. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["without", "repairs"],
          headline: "Sell Your House Fast With No Repairs Or Contingencies!",
          subHeadline:
            "No showings, no repairs, no contingencies. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["without", "contingencies"],
          headline: "Sell Your House Fast With No Repairs Or Contingencies!",
          subHeadline:
            "No showings, no repairs, no contingencies. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["without", "showings"],
          headline:
            "Sell Your House Fast With No Showings, Repairs, Or Contingencies!",
          subHeadline:
            "No showings, no repairs, no contingencies. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["no", "repairs"],
          headline: "Sell Your House Fast With No Repairs Or Contingencies!",
          subHeadline:
            "No showings, no repairs, no contingencies. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["no", "contingencies"],
          headline: "Sell Your House Fast With No Repairs Or Contingencies!",
          subHeadline:
            "No showings, no repairs, no contingencies. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
        },
        {
          keywords: ["no", "showings"],
          headline:
            "Sell Your House Fast With No Showings, Repairs, Or Contingencies!",
          subHeadline:
            "No showings, no repairs, no contingencies. Enter your address below to generate your no stress offer",
          confirmWhereHeadline:
            "Great! Now confirm where you'd like us to text your requested details:",
          buttonText: "CHECK OPTIONS",
          invalidMessage: "Please enter a valid address to check your options",
          phoneInvalidMessage:
            "Valid phone required to receive option offers via text message (No Spam Ever)",
          formHeadline:
            "Address Confirmed. Where do you want to send your requested details?",
          thankYouHeadline: "Home Sell Info Request Completed!",
          thankYouSubHeadline:
            "You'll be receiving your requested details at your contact number shortly, thank you!",
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
            possibleHeadlines[i].keywords.every((kw) =>
              keywordWords.includes(kw)
            )
          ) {
            setHeadline(possibleHeadlines[i].headline);
            setSubHeadline(possibleHeadlines[i].subHeadline);
            setConfirmWhereHeadline(possibleHeadlines[i].confirmWhereHeadline);
            setButtonText(possibleHeadlines[i].buttonText);
            setInvalidMessage(possibleHeadlines[i].invalidMessage);
            setPhoneInvalidMessage(possibleHeadlines[i].phoneInvalidMessage);
            setFormHeadline(possibleHeadlines[i].formHeadline);

            dispatch(
              formDataChanged({
                dynamicHeadline: possibleHeadlines[i].headline,
                dynamicSubHeadline: possibleHeadlines[i].subHeadline,

                thankYouHeadline: possibleHeadlines[i].thankYouHeadline,
                thankYouSubHeadline: possibleHeadlines[i].thankYouSubHeadline,
                url: window.location.href,
                trafficSource: "Google Search",
              })
            );
            headlineSet = true;
          }
        }
      }

      if (!headlineSet) {
        setHeadline("Sell Your House Fast With No Stress!");
        setSubHeadline(
          "We Help Sell Houses In Any Condition. Check Your Easy Sell Options Now!"
        );
        setButtonText("CHECK OPTIONS");
        setConfirmWhereHeadline(
          "Great! Now confirm where you'd like us to text your requested details:"
        );
        setThankYouHeadline("Home Sell Information Request Completed!");
        setThankYouSubHeadline(
          "You'll be receiving your rapid home selling details at your contact number shortly, thank you!"
        );

        dispatch(
          formDataChanged({
            dynamicHeadline: "Sell Your House Fast With No Stress!",
            dynamicSubHeadline:
              "We Help Sell Houses In Any Condition. Check Your Easy Sell Options Now!",
            thankYouHeadline: "Home Sell Information Request Completed!",
            thankYouSubHeadline:
              "You'll be receiving your rapid home selling details at your contact number shortly, thank you!",
            trafficSource: "Google Search",
          })
        );
      }
    }
    //-------END OF IF() DYNAMIC FOR: Sell Fast, On Own, No Agent, Form Submit

    //-------START OF IF() DYNAMIC FOR: NO CAMPAIGN ID MATCHED
    // else {
    //   // 20311247419 = Sell Fast, On Own, No Agent, Form Submit
    //   const possibleHeadlines = [];

    //   const urlParams = new URLSearchParams(window.location.search);
    //   const keyword = urlParams.get("keyword");
    //   let headlineSet = false;

    //   if (keyword) {
    //     const sanitizedKeyword = keyword
    //       .replace(/[^a-z0-9\s]/gi, "")
    //       .toLowerCase();
    //     const keywordWords = sanitizedKeyword.split(" ");

    //     for (let i = 0; i < possibleHeadlines.length; i++) {
    //       if (headlineSet) break;
    //       if (
    //         possibleHeadlines[i].keywords.every((kw) =>
    //           keywordWords.includes(kw)
    //         )
    //       ) {
    //         setHeadline(possibleHeadlines[i].headline);
    //         setSubHeadline(possibleHeadlines[i].subHeadline);
    //         setButtonText(possibleHeadlines[i].buttonText);
    //         setInvalidMessage(possibleHeadlines[i].invalidMessage);
    //         setPhoneInvalidMessage(possibleHeadlines[i].phoneInvalidMessage);
    //         setFormHeadline(possibleHeadlines[i].formHeadline);

    //         dispatch(
    //           formDataChanged({
    //             dynamicHeadline: possibleHeadlines[i].headline,
    //             dynamicSubHeadline: possibleHeadlines[i].subHeadline,
    //             thankYouHeadline: possibleHeadlines[i].thankYouHeadline,
    //             thankYouSubHeadline: possibleHeadlines[i].thankYouSubHeadline,
    //             url: window.location.href,
    //             trafficSource: "Google Search",
    //           })
    //         );
    //         headlineSet = true;
    //       }
    //     }
    //   }

    //   if (!headlineSet) {
    //     setHeadline("Sell Your House Fast With No Stress!");
    //     setSubHeadline(
    //       "We Help Sell Houses In Any Condition. Check Your Easy Sell Options Now!"
    //     );
    //     setThankYouHeadline("Home Sell Information Request Completed!");
    //     setThankYouSubHeadline(
    //       "You'll be receiving your rapid home selling details at your contact number shortly, thank you!"
    //     );

    //     dispatch(
    //       formDataChanged({
    //         dynamicHeadline: "Sell Your House Fast With No Stress!",
    //         dynamicSubHeadline:
    //           "We Help Sell Houses In Any Condition. Check Your Easy Sell Options Now!",
    //         thankYouHeadline: "Home Sell Information Request Completed!",
    //         thankYouSubHeadline:
    //           "You'll be receiving your rapid home selling details at your contact number shortly, thank you!",
    //         trafficSource: "Google Search",
    //       })
    //     );
    //   }
    // }
    //-------END OF IF() DYNAMIC FOR: NO CAMPAIGN ID MATCHED

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //------------------------------ END DYNAMIC CONTENT USEEFFECT -------------------------------

  //------------------------------ START DYNAMIC SITELINK CONTENT -------------------------------
  // Create a mapping from hash values to site link content
  // const [siteLinkText, setSiteLinkText] = useState("");
  // const siteLinkMap = {
  //   "sl-one": "Taking the stress out of selling your home!",
  //   "sl-two":
  //     "How a Cash Offer Works:\n 1. Submit Your Address. 2. Get Your Cash Offer. 3. Close Fast!",
  //   "sl-three":
  //     "Benefits of a Cash Offer:\n 1. No Repairs. 2. No Fees. 3. No Hassle!",
  //   "sl-four":
  //     "Questions?\n Call 770-765-7969 or submit your address and we'll contact you asap",
  //   // Add more mappings as needed
  // };

  // const hash = window.location.hash.substring(1); // Remove the '#' character

  // // If the hash value is in the map, set the site link text accordingly
  // if (hash in siteLinkMap) {
  //   setSiteLinkText(siteLinkMap[hash]);
  // }
  //------------------------------ END DYNAMIC SITELINK CONTENT -------------------------------

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      !googlePlacesAddressSelected
    ) {
      const currentStreetRef = streetRef.current;

      const onInput = () => {
        const autocomplete = new window.google.maps.places.Autocomplete(
          currentStreetRef
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (!place.formatted_address) return;

          // We want to submit the form and move to the next step when the user selects a place from the dropdown
          dispatch(
            formSubmitted({
              street: place.formatted_address,
              city:
                place.address_components?.find((c) =>
                  c.types.includes("locality")
                )?.short_name ?? "",
              addressSelectionType: "Google",
            })
          );

          // Set the selected place for the Google Maps display
          setSelectedPlace({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });

          // Indicate that a Google Places address has been selected
          setGooglePlacesAddressSelected(true);

          // Call your API here, similar to what you're doing in handleSubmit
          propertyLookup(place.formatted_address);
        });

        return () => {
          window.google.maps.event.clearInstanceListeners(autocomplete);
        };
      };

      currentStreetRef.addEventListener("input", onInput);

      return () => {
        if (currentStreetRef) {
          currentStreetRef.removeEventListener("input", onInput);
        }
      };
    }
    window.scrollTo(0, 0);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect with localFormDisplayStep as dependency
  useEffect(() => {
    // console.log("localFormDisplayStep: " + localFormDisplayStep);
    window.scrollTo(0, 0);
  }, [localFormDisplayStep]);

  // useEffect with googlePlacesSelected as a dependency that console logs googlePlacesSelected
  useEffect(() => {
    // console.log("googlePlacesAddressSelected: " + googlePlacesAddressSelected);
    // if googlePlaaces address selected is true set localFormDisplayStep to 2
    if (googlePlacesAddressSelected) {
      setLocalFormDisplayStep(2);
    }
    window.scrollTo(0, 0);
  }, [googlePlacesAddressSelected]);

  const propertyLookup = async (address) => {
    console.log("Getting property data for address: " + address);
    var url =
      "https://property.melissadata.net/v4/WEB/LookupProperty?id=" +
      encodeURIComponent("TyXpKLplL6R0lDTHV7B8Bb**nSAcwXpxhQ0PC2lXxuDAZ-**") +
      "&format=json&cols=GrpAll&opt=desc:on&ff=" +
      encodeURIComponent(address);
    const options = {
      method: "GET",
      url,
    };
    try {
      const { data } = await axios.request(options);
      // console.log("Full API Response:", JSON.stringify(data, null, 2));

      if (data.Records) {
        var first;
        for (var record of data.Records) {
          if (!first) first = record;
        }
        if (first) {
          const apiOwnerName = first.PrimaryOwner?.Name1Full ?? "";
          const apiMaxValue = first.EstimatedValue?.EstimatedMaxValue ?? 0;
          const apiEstimatedValue = first.EstimatedValue?.EstimatedValue ?? 0;

          // Format apiMaxValue as a currency string in USD with no decimal places
          const formattedApiMaxValue = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(apiMaxValue);

          const formattedApiEstimatedValue = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(apiEstimatedValue);

          const updates = {
            propertyRecord: first,
            recordSubmitted: false,
            recordSubmitting: false,
            apiOwnerName,
            apiMaxValue,
            formattedApiMaxValue, // Include formattedApiMaxValue in updates
            apiEstimatedValue,
            formattedApiEstimatedValue, // Include formattedApiEstimatedValue in updates
          };
          if (!formData.name) updates.apiOwnerName = apiOwnerName;
          dispatch(recordChanged(updates));
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
    window.scrollTo(0, 0);
  };

  // inmported from redux
  const handleFormChange = (e) => {
    let updatedFormData;

    if (e.target.name === "street") {
      updatedFormData = {
        [e.target.name]: e.target.value,
        manualStreet: e.target.value,
      };
      if (e.target.value?.length - formData.street?.length > 2)
        updatedFormData.addressSelectionType = "Autocomplete";
    } else {
      updatedFormData = {
        [e.target.name]: e.target.value,
      };
    }

    //if the phone was autofilled then send the lead. Otherwise, update the form data
    //This will also catch partial autocompletes and copy and pastes.
    if (formData.phone?.length < 9 && updatedFormData.phone?.length > 9) {
      const updates = { phone: updatedFormData.phone };
      if (
        (formData.street?.length > 5 || updatedFormData.street?.length > 5) &&
        !selectedPlace
      ) {
        dispatch(formDataChanged(updates));
        phoneNumberLeadSubmitted();

        handleSubmit();
      } else dispatch(formSubmitted(updates));
    } else dispatch(formDataChanged(updatedFormData));
    if (
      formData.submitted &&
      updatedFormData.name?.length &&
      updatedFormData.name.length - formData.name.length >= 2
    ) {
      dispatch(
        formSubmitted({
          name: updatedFormData.name,
          autoCompleteName: updatedFormData.name,
        })
      );
    } else if (
      updatedFormData.name?.length &&
      updatedFormData.name.length - formData.name.length < 2
    ) {
      dispatch(formDataChanged({ manualName: updatedFormData.name }));
    }

    if (formData.street.length > 0) {
      setAutocompleteValue("none");
    }
    window.scrollTo(0, 0);
  };

  const handleVerifyCodeChange = (e) => {
    dispatch(formDataChanged({ verificationCode: e.target.value }));
  };

  const [errorMessage, setErrorMessage] = useState("");
  const [phoneErrorMessage, setPhoneErrorMessage] = useState("");

  const mapStyles = [
    {
      featureType: "poi",
      elementType: "labels.text",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "poi.business",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "road",
      elementType: "labels.icon",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
    {
      featureType: "transit",
      stylers: [
        {
          visibility: "off",
        },
      ],
    },
  ];

  const handleSubmit = (e) => {
    // console log handle submit called
    // console.log("handle submit called");
    if (e) {
      e.preventDefault();
    }
    // Call formValidation and check if it returns false
    if (!formValidation()) {
      // console.log("Form validation failed. Exiting handleSubmit.");
      return; // Exit the handleSubmit function early
    }
    if (!googlePlacesAddressSelected) {
      // If the user has not selected an address from the Google Places dropdown, use AutocompleteService
      setGooglePlacesAddressSelected(true);
      const autocompleteService =
        new window.google.maps.places.AutocompleteService();

      autocompleteService.getPlacePredictions(
        {
          input: formData.street ? formData.street : formData.manualStreet,
        },

        (predictions, status) => {
          if (status === "OK") {
            if (predictions && predictions.length > 0) {
              // Use PlacesService to get the place details
              const hiddenMap = new window.google.maps.Map(
                document.createElement("div")
              );
              const placesService = new window.google.maps.places.PlacesService(
                hiddenMap
              );

              placesService.getDetails(
                {
                  placeId: predictions[0].place_id,
                  fields: ["formatted_address", "geometry"],
                },
                (place, status) => {
                  if (status === "OK") {
                    setSelectedPlace({
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    });
                    dispatch(
                      formSubmitted({
                        street: place.formatted_address,
                      })
                    );
                    propertyLookup(place.formatted_address);
                    setLocalFormDisplayStep(2);
                  }
                }
              );
            }
          }
        }
      );
    } else {
      propertyLookup(props.formData.street);
      setLocalFormDisplayStep(2);
      window.scrollTo(0, 0);
    }
  };

  const phoneValidation = (phone) => {
    const strippedPhone = phone.replace(/[\s-+()]/g, ""); // remove dashes, spaces, plus symbols, and parentheses
    const phoneRegex = /^[0-9]{10,13}$/; // check for at least 10 and at most 13 digits
    return phoneRegex.test(strippedPhone);
  };

  const formValidation = () => {
    if (formData.street.trim().length < 5) {
      // console.log("invalid address");
      streetRef.current.className =
        "ga-fast-offer-hero-middle-zip-field-container-1-invalid";
      return false;
    } else {
      // console.log("valid address");
      return true;
    }
  };

  const handleRegister = (e, fromOverlay = false) => {
    e.preventDefault();

    setPhoneErrorMessage("");

    if (!formData.phone) {
      setOverlayVisible(true);
      return;
    }

    if (fromOverlay && !phoneValidation(formData.phone)) {
      setPhoneErrorMessage(
        "Valid phone required to receive details via text message (No Spam Ever)"
      );
    } else {
      dispatch(formSubmitted({ phone: formData.phone }));
      phoneNumberLeadSubmitted();
      props.nextStep(2);
    }
  };

  const verifyPhoneCode = (e) => {
    console.warn(e);
    e.preventDefault();
    dispatch(verifyCode(formData.code));
  };

  useEffect(() => {
    if (formData.phoneVerified) {
      props.nextStep(2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.phoneVerified]);

  // navigate("/ga/fast-offer/ty");
  return (
    <div className="ga-fast-offer-hero-1-full-width-parent">
      <div className="GaFastOfferHeroSection1">
        <div className="ga-fast-offer-hero-1-middle-postioner ">
          <div className="ga-fast-offer-hero-middle-section-1 ga-fast-offer-hero-fade-in ">
            {localFormDisplayStep === 1 && (
              <>
                <div className="ga-fast-offer-hero-middle-headline-1">
                  {headline}
                </div>

                <div className="ga-fast-offer-hero-middle-section-text-1">
                  {subHeadline}
                </div>

                <form
                  className="ga-fast-offer-hero-middle-form-container-1"
                  // on submit call handleSubmit
                  onSubmit={handleSubmit}
                >
                  <div className="ga-fast-offer-hero-1-form-auto-container">
                    <input
                      autocomplete="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                    />

                    <input
                      autocomplete="phone"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />

                    <input
                      autocomplete="email"
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />

                    <input
                      autocomplete="postal-code"
                      type="text"
                      name="zip"
                      value={formData.zip}
                      onChange={handleFormChange}
                    />
                  </div>

                  <input
                    ref={streetRef}
                    autocomplete={autocompleteValue}
                    type="text"
                    name="street"
                    placeholder="Street address..."
                    className="ga-fast-offer-hero-middle-zip-field-container-1"
                    value={formData.street} // changed from props.formData.street to formData.street
                    onChange={handleFormChange}
                    onBlur={(e) => {
                      e.target.placeholder = "Street address...";
                    }}
                    onFocus={(e) => (e.target.placeholder = "")}
                  />

                  <button
                    className="ga-fast-offer-hero-middle-form-button-1"
                    onClick={(e) => handleSubmit(e)}
                  >
                    {buttonText}
                  </button>
                </form>
                {/* <div className="ga-fast-offer-hero-1-address-disclaimer">
                  How It Works: Enter your address and we'll use our enhanced
                  system to retrieve your available property details and instant
                  cash offer, then we'll send it to your matching contact
                  details. That's it!
                </div> */}

                {/* <div className="ga-fast-offer-hero-1-dynamic-sitelink-text">
                  {siteLinkText.split("\n").map((item, key) => {
                    return (
                      <span key={key}>
                        {item}
                        <br />
                      </span>
                    );
                  })}
                </div> */}
              </>
            )}

            {localFormDisplayStep === 2 && (
              <div className="max-width-500">
                <div className="ga-fast-offer-hero-middle-map-headline">
                  Is this your house?
                </div>
                <div className="ga-fast-offer-hero-1-api-address">
                  {formData.street &&
                    formData.street.split(", ").slice(0, -1).join(", ")}
                </div>
                <div className="ga-fast-offer-hero-middle-map-container">
                  <div className="google-map-container">
                    <GoogleMap
                      center={selectedPlace}
                      zoom={17}
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      options={{
                        styles: mapStyles,
                      }}
                    />
                  </div>
                  <img src={mapIcon} alt="Map Marker" className="map-marker" />
                </div>

                <div className="ga-fast-offer-hero-middle-map-sub-info">
                  {/* {formData.formattedApiMaxValue !== null &&
                  formData.formattedApiMaxValue !== undefined &&
                  formData.formattedApiMaxValue !== "$0" ? (
                    <>
                      <div className="ga-fast-offer-hero-middle-estimated-value">
                      
                        {formData.formattedApiMaxValue}
                      </div>
                      <div className="ga-fast-offer-hero-middle-estimated-value-text">
                        *Maximum estimated market value
                      </div>
                    </>
                  ) : null} */}

                  {formData.formattedApiEsimatedValue !== null &&
                  formData.formattedApiEstimatedValue !== undefined &&
                  formData.formattedApiEstimatedValue !== "$0" ? (
                    <>
                      <div className="ga-fast-offer-hero-middle-estimated-value">
                        {formData.formattedApiEstimatedValue}
                      </div>
                      <div className="ga-fast-offer-hero-middle-estimated-value-text">
                        *Estimated market value
                      </div>
                    </>
                  ) : null}

                  {/* {formData.phone ? (
                    <div className="ga-fast-offer-hero-address-owner-and-phone-container">
                      <div className="ga-fast-offer-hero-address-owner">
                       
                        Owner:{" "}
                        {formData.name ? formData.name : formData.apiOwnerName}
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
                  ) : null} */}

                  {/* add two buttons, one to edit, one to submit. If submit is clicked, handleRegister, if edit is clicked set overlay to true */}
                  <div className="ga-fast-offer-hero-middle-map-buttons">
                    <button
                      className="ga-fast-offer-hero-middle-map-submit-button"
                      // onClick setConfirmedAddress true and set selected place to false

                      onClick={() => {
                        setLocalFormDisplayStep(3);
                      }}

                      // onClick={() => setConfirmedAddress(true)}
                    >
                      Yes, that's correct
                    </button>

                    <button
                      className="ga-fast-offer-hero-middle-map-edit-button"
                      onClick={() => setEditInfoOverlayVisible(true)}
                    >
                      Edit info
                    </button>
                  </div>
                </div>
              </div>
            )}

            {localFormDisplayStep === 3 && (
              <div className="max-width-500">
                <div className="ga-fast-offer-hero-middle-confirm-value-headline">
                  {confirmWhereHeadline}
                </div>

                <div className="ga-fast-offer-hero-middle-map-sub-info">
                  {/* <div className="ga-fast-offer-hero-middle-estimated-value">
                    $551,233
                  </div>
                  <div className="ga-fast-offer-hero-middle-estimated-value-text">
                    Estimated market value
                  </div> */}

                  <form className="ga-fast-offer-hero-confirm-offer-form-fields">
                    <input
                      className="ga-fast-offer-hero-confirm-offer-form-input"
                      autocomplete="name"
                      placeholder="Enter owner name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onBlur={(e) =>
                        (e.target.placeholder = "Enter owner name...")
                      }
                      onFocus={(e) => (e.target.placeholder = "")}
                      onChange={handleFormChange}
                    />
                    <input
                      className="ga-fast-offer-hero-confirm-offer-form-input"
                      autocomplete="phone"
                      placeholder="Phone (get offer via text)"
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onBlur={(e) =>
                        (e.target.placeholder = "Phone (get offer via text)")
                      }
                      onFocus={(e) => (e.target.placeholder = "")}
                      onChange={handleFormChange}
                    />

                    {phoneErrorMessage && (
                      <div className="ga-fast-offer-hero-phone-error-message">
                        {phoneInvalidMessage}
                      </div>
                    )}

                    <button
                      className="ga-fast-offer-hero-middle-confirm-offer-submit-button"
                      onClick={(e) => handleRegister(e, true)}
                    >
                      {buttonText}
                    </button>
                  </form>

                  {/* add two buttons, one to edit, one to submit. If submit is clicked, handleRegister, if edit is clicked set overlay to true */}
                </div>
              </div>
            )}
          </div>
        </div>

        {overlayVisible && (
          <div className="ga-fast-offer-hero-overlay">
            <div className="ga-fast-offer-hero-overlay-form-container">
              <button onClick={closeOverlay} className="overlay-close-button">
                X
              </button>

              <div className="ga-fast-offer-hero-overlay-form-headline">
                {formHeadline}
              </div>
              <form className="ga-fast-offer-hero-overlay-form-fields">
                <input
                  className="ga-fast-offer-hero-overlay-form-input"
                  autocomplete="name"
                  placeholder="Enter owner name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onBlur={(e) => (e.target.placeholder = "Enter owner name...")}
                  onChange={handleFormChange}
                />
                <input
                  className="ga-fast-offer-hero-overlay-form-input"
                  autocomplete="phone"
                  placeholder="Enter phone (receieve offer via text)"
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onBlur={(e) =>
                    (e.target.placeholder =
                      "Enter phone (receieve offer via text)")
                  }
                  onChange={handleFormChange}
                />

                {phoneErrorMessage && (
                  <div className="ga-fast-offer-hero-phone-error-message">
                    {phoneInvalidMessage}
                  </div>
                )}

                <button
                  className="ga-fast-offer-hero-registration-form-button-1"
                  onClick={(e) => handleRegister(e, true)}
                >
                  {buttonText}
                </button>
              </form>
            </div>
          </div>
        )}

        {editInfoOverlayVisible && (
          <div className="ga-fast-offer-hero-overlay">
            <div className="ga-fast-offer-hero-overlay-form-container">
              <button
                onClick={closeOverlay}
                className="ga-fast-offer-hero-overlay-close-button"
              >
                X
              </button>

              <div className="ga-fast-offer-hero-overlay-form-headline">
                {formHeadline}
              </div>
              <form className="ga-fast-offer-hero-overlay-form-fields">
                <input
                  className="ga-fast-offer-hero-overlay-form-input"
                  autocomplete="name"
                  placeholder="name..."
                  type="text"
                  name="name"
                  value={formData.name}
                  onBlur={(e) => (e.target.placeholder = "name")}
                  onChange={handleFormChange}
                />

                <input
                  className="ga-fast-offer-hero-overlay-form-input"
                  autocomplete="phone"
                  placeholder="phone..."
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onBlur={(e) =>
                    (e.target.placeholder = "phone (receieve offer via text)")
                  }
                  onChange={handleFormChange}
                />
                <input
                  className="ga-fast-offer-hero-overlay-form-input"
                  autocomplete="street-address"
                  placeholder="Street address..."
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleFormChange}
                  onBlur={(e) => (e.target.placeholder = "Street address...")}
                />

                {phoneErrorMessage && (
                  <div className="ga-fast-offer-hero-phone-error-message">
                    {phoneInvalidMessage}
                  </div>
                )}

                <button
                  className="ga-fast-offer-hero-registration-form-button-1"
                  onClick={(e) => handleRegister(e, true)}
                >
                  {buttonText}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default GaFastOfferHeroSection1v2;

// START ----   alternate number prompt sequence for verificatino code
// {localFormDisplayStep === 3 && (
//   <>
//     <div className="ga-fast-offer-hero-middle-confirm-value-headline">
//       Great! Now, let's confirm your exact cash offer amount.
//     </div>

//     <div className="ga-fast-offer-hero-middle-map-sub-info">
//       {/* <div className="ga-fast-offer-hero-middle-estimated-value">
//         $551,233
//       </div>
//       <div className="ga-fast-offer-hero-middle-estimated-value-text">
//         Estimated market value
//       </div> */}
//       <div className="ga-fast-offer-hero-middle-confirm-value-sub-headline">
//         First, let's verify that we have correct number to send your
//         official cash offer to:
//       </div>
//       {formData.phone ? (
//         <div className="ga-fast-offer-hero-address-owner-and-phone-container">
//           <div className="ga-fast-offer-hero-confirm-address-owner">
//             Owner:{" "}
//             {formData.name ? formData.name : formData.apiOwnerName}
//           </div>
//           <div className="ga-fast-offer-hero-confirm-address-phone">
//             Phone:{" "}
//             {formData.phone
//               ? formData.phone
//               : formData.phones && formData.phones[0]
//               ? formData.phones[0].number
//               : "Not available"}
//           </div>
//         </div>
//       ) : null}

//       {/* add two buttons, one to edit, one to submit. If submit is clicked, handleRegister, if edit is clicked set overlay to true */}
//       <div className="ga-fast-offer-hero-middle-map-buttons">
//         <button
//           className="ga-fast-offer-hero-middle-map-submit-button"
//           onClick={handleRegister}
//         >
//           Yes, that's correct
//         </button>
//         <button
//           className="ga-fast-offer-hero-middle-map-edit-button"
//           onClick={() => setEditInfoOverlayVisible(true)}
//         >
//           Edit info
//         </button>
//       </div>
//     </div>
//   </>
// )}

// {localFormDisplayStep === 4 && (
//   <>
//     <div className="ga-fast-offer-hero-middle-confirm-value-headline">
//       You should see a verification code message come through
//       shortly. Enter it here once you receive it..
//     </div>

//     <div className="ga-fast-offer-hero-middle-map-sub-info">
//       {/* <div className="ga-fast-offer-hero-middle-estimated-value">
//         $551,233
//       </div>
//       <div className="ga-fast-offer-hero-middle-estimated-value-text">
//         Estimated market value
//       </div> */}

//       {/* add two buttons, one to edit, one to submit. If submit is clicked, handleRegister, if edit is clicked set overlay to true */}
//       <div className="ga-fast-offer-hero-middle-map-buttons">
//         <input
//           ref={streetRef}
//           autocomplete={autocompleteValue}
//           type="text"
//           name="phoneCode"
//           placeholder="Enter code..."
//           className="ga-fast-offer-hero-middle-verify-phone"
//           value={formData.phoneCode} // changed from props.formData.street to formData.street
//           onChange={handleFormChange}
//           onBlur={(e) => {
//             e.target.placeholder = "Enter code...";
//           }}
//           onFocus={(e) => (e.target.placeholder = "")}
//         />

//         <button
//           className="ga-fast-offer-hero-middle-phone-verify-button"
//           onClick={verifyCode}
//         >
//           Verify
//         </button>
//       </div>
//     </div>
//   </>
// )}

// END ----   alternate number prompt sequence for verificatino code
