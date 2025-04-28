// realtor.com home value is inserting the matched address into the actual field as a user is typing, maybe try this

import homecollagewide from "../../../../assets/images/homecollagewide.jpg";
import FoldBottom from "../../../FoldBottom";
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
} from "./../../../../formSlice";
import { Marker } from "@react-google-maps/api";
import mapIcon from "../../../../assets/images/mapicon.png";
import "./MetaRetargetHeroSection1.css";
import { useNavigate } from "react-router-dom";

const tagManagerArgs = {
  gtmId: "GTM-MXD6W8K",
};
let windowViewCount = 0;

TagManager.initialize(tagManagerArgs);

function MetaRetargetHeroSection1(props) {
  // !!!!!!!!!!!!!!!!!!!!!!!!   LIMIT TO ONE TIME  -----------------

  useEffect(() => {
    ++windowViewCount;
    if (windowViewCount <= 2) {
      window.dataLayer.push({
        event: "MetaRetargetHero1PageView",
        title: "MetaRetargetHeroSection1.js",
      });
      // ReactPixel.track("Lead", {
      //   // value: 10.0,
      //   // currency: "USD",
      // });
    }
  }, []);

  useEffect(() => {
    ReactPixel.init("230683406108508");
    ReactPixel.pageView();
  }, []);

  const formData = useSelector((state) => state.form);
  const dispatch = useDispatch();

  const [googlePlacesAddressSelected, setGooglePlacesAddressSelected] =
    useState(false);
  const navigate = useNavigate();
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [editInfoOverlayVisible, setEditInfoOverlayVisible] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const keyword = urlParams.get("keyword");
  const campaignId = urlParams.get("campaignid");
  const adgroupId = urlParams.get("adgroupid");
  const device = urlParams.get("device");
  const gclid = urlParams.get("gclid");
  const campaignName = "";
  const adgroupName = "";

  useEffect(() => {
    if (urlParams) {
      console.log("urlParams if triggered");

      dispatch(
        formDataChanged({
          campaignName: campaignName,
          adgroupName: adgroupName,
          keyword: keyword,
          campaignId: campaignId,
          adgroupId: adgroupId,
          device: device,
          gclid: gclid,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to handle closing of the overlay
  const closeOverlay = () => {
    setOverlayVisible(false);
    setEditInfoOverlayVisible(false);
  };

  //------------------------------ START DYNAMIC HEADLINE -------------------------------
  const [headline, setHeadline] = useState("Sell Your House For Cash Fast!");
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
    "Where should we send your cash offer?"
  );
  const [thankYouHeadline, setThankYouHeadline] = useState(
    "Cash Offer Request Completed!"
  );
  const [thankYouSubHeadline, setThankYouSubHeadline] = useState(
    "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!"
  );

  const [siteLinkText, setSiteLinkText] = useState("");

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
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
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
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
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
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
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
        buttonText: "CHECK OFFER",
        invalidMessage: "Please enter a valid address to check your cash offer",
        phoneInvalidMessage:
          "Valid phone required to receive your cash offer details via text message (No Spam Ever)",
        formHeadline: "Where should we send your cash offer?",
        thankYouHeadline: "Cash Offer Request Completed!",
        thankYouSubHeadline:
          "You'll be receiving your no obligation cash offer at your contact number shortly, thank you!",
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

          dispatch(
            formDataChanged({
              dynamicHeadline: possibleHeadlines[i].headline,
              dynamicSubHeadline: possibleHeadlines[i].subHeadline,
              thankYouHeadline: possibleHeadlines[i].thankYouHeadline,
              thankYouSubHeadline: possibleHeadlines[i].thankYouSubHeadline,
              url: window.location.href,
              trafficSource: "Meta Ads",
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
          trafficSource: "Meta Ads",
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //------------------------------ END DYNAMIC HEADLINE -------------------------------
  //------------------------------ START DYNAMIC SITELINK CONTENT -------------------------------
  useEffect(() => {
    // Create a mapping from hash values to site link content
    const siteLinkMap = {
      "sl-one": "Taking the stress out of selling your home!",
      "sl-two":
        "How a Cash Offer Works:\n 1. Submit Your Address. 2. Get Your Cash Offer. 3. Close Fast!",
      "sl-three":
        "Benefits of a Cash Offer:\n 1. No Repairs. 2. No Fees. 3. No Hassle!",
      "sl-four":
        "Questions?\n Call 770-765-7969 or submit your address and we'll contact you asap",
      // Add more mappings as needed
    };

    const hash = window.location.hash.substring(1); // Remove the '#' character

    // If the hash value is in the map, set the site link text accordingly
    if (hash in siteLinkMap) {
      setSiteLinkText(siteLinkMap[hash]);
    }
  }, []);
  //------------------------------ END DYNAMIC SITELINK CONTENT -------------------------------

  const streetRef = useRef(null);
  const [autocompleteValue, setAutocompleteValue] = useState("street-address");

  const phoneRef = useRef(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapDisplay, setMapDisplay] = useState(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect with googlePlacesSelected as a dependency that console logs googlePlacesSelected
  useEffect(() => {
    console.log("googlePlacesAddressSelected: " + googlePlacesAddressSelected);
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
      if (data.Records) {
        var first;
        for (var record of data.Records) {
          if (!first) first = record;
        }
        if (first) {
          const apiOwnerName = first.PrimaryOwner?.Name1Full ?? "";
          const updates = {
            propertyRecord: first,
            apiOwnerName,
          };
          if (!formData.name) updates.name = apiOwnerName;
          dispatch(formSubmitted(updates));
          return;
        }
      }
    } catch (error) {
      console.error(error);
    }
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
      if (
        (formData.street?.length > 5 || updatedFormData.street?.length > 5) &&
        !selectedPlace
      ) {
        dispatch(formDataChanged({ phone: updatedFormData.phone }));
        // Indicate that a Google Places address has been selected

        handleSubmit();
      } else dispatch(formSubmitted({ phone: updatedFormData.phone }));
    } else dispatch(formDataChanged(updatedFormData));

    if (formData.street.length > 0) {
      setAutocompleteValue("none");
    }
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
    console.log("handle submit called");
    if (e) {
      e.preventDefault();
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
                  }
                }
              );
            }
          }
        }
      );
    } else {
      propertyLookup(props.formData.street);
    }
  };

  const phoneValidation = (phone) => {
    const strippedPhone = phone.replace(/[\s-+()]/g, ""); // remove dashes, spaces, plus symbols, and parentheses
    const phoneRegex = /^[0-9]{10,13}$/; // check for at least 10 and at most 13 digits
    return phoneRegex.test(strippedPhone);
  };

  const formValidation = () => {
    if (props.formData.street.trim().length < 5) {
      streetRef.current.className =
        "meta-retarget-hero-middle-zip-field-container-1-invalid";
      return false;
    } else {
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
      // props.nextStep(2);
      // Redirect to the /ty page
      navigate("/meta/fast-offer/ty");
    }
  };

  return (
    <div className="meta-retarget-hero-1-full-width-parent">
      <div className="MetaRetargetHeroSection1">
        <div className="meta-retarget-hero-1-middle-postioner">
          <div className="meta-retarget-hero-middle-section-1 meta-retarget-hero-fade-in">
            {selectedPlace && (
              <>
                <div className="meta-retarget-hero-middle-map-container">
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

                <div>
                  <div className="meta-retarget-hero-1-api-address">
                    {formData.street &&
                      formData.street.split(", ").slice(0, -1).join(", ")}
                  </div>

                  {formData.phone ? (
                    <div className="meta-retarget-hero-address-owner-and-phone-container">
                      <div className="meta-retarget-hero-address-owner">
                        {/* if formdata.name exists, use that, otherwise use apiOwnerName, with text label */}
                        Owner:{" "}
                        {formData.name ? formData.name : formData.apiOwnerName}
                      </div>
                      <div className="meta-retarget-hero-address-phone">
                        Phone:{" "}
                        {formData.phone
                          ? formData.phone
                          : formData.phones && formData.phones[0]
                          ? formData.phones[0].number
                          : "Not available"}
                      </div>
                    </div>
                  ) : null}

                  {/* add two buttons, one to edit, one to submit. If submit is clicked, handleRegister, if edit is clicked set overlay to true */}
                  <div className="meta-retarget-hero-middle-map-buttons">
                    <button
                      className="meta-retarget-hero-middle-map-edit-button"
                      onClick={() => setEditInfoOverlayVisible(true)}
                    >
                      Edit info
                    </button>
                    <button
                      className="meta-retarget-hero-middle-map-submit-button"
                      onClick={handleRegister}
                    >
                      Yep, that's correct
                    </button>
                  </div>
                </div>
              </>
            )}

            {!selectedPlace && (
              <>
                <div className="meta-retarget-hero-middle-headline-1">
                  {headline}
                </div>

                <div className="meta-retarget-hero-middle-section-text-1">
                  {subHeadline}
                </div>

                <form
                  className="meta-retarget-hero-middle-form-container-1"
                  // on submit call handleSubmit
                  onSubmit={handleSubmit}
                >
                  <div className="meta-retarget-hero-1-form-auto-container">
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
                    className="meta-retarget-hero-middle-zip-field-container-1"
                    value={formData.street} // changed from props.formData.street to formData.street
                    onChange={handleFormChange}
                    onBlur={(e) => {
                      e.target.placeholder = "Street address...";
                    }}
                    onFocus={(e) => (e.target.placeholder = "")}
                  />

                  <button
                    className="meta-retarget-hero-middle-form-button-1"
                    onClick={(e) => handleSubmit(e)}
                  >
                    {buttonText}
                  </button>
                </form>
                <div className="meta-retarget-hero-1-address-disclaimer">
                  How It Works: Enter your address and we'll use our enhanced
                  system to retrieve your available property details and instant
                  cash offer, then we'll send it to your matching contact
                  details. That's it!
                </div>

                <div className="meta-retarget-hero-1-dynamic-sitelink-text">
                  {siteLinkText.split("\n").map((item, key) => {
                    return (
                      <span key={key}>
                        {item}
                        <br />
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {overlayVisible && (
          <div className="meta-retarget-hero-overlay">
            <div className="meta-retarget-hero-overlay-form-container">
              <button onClick={closeOverlay} className="overlay-close-button">
                X
              </button>

              <div className="meta-retarget-hero-overlay-form-headline">
                {formHeadline}
              </div>
              <form className="meta-retarget-hero-overlay-form-fields">
                <input
                  className="meta-retarget-hero-overlay-form-input"
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
                  <div className="meta-retarget-hero-phone-error-message">
                    {phoneInvalidMessage}
                  </div>
                )}

                <button
                  className="meta-retarget-hero-registration-form-button-1"
                  onClick={(e) => handleRegister(e, true)}
                >
                  {buttonText}
                </button>
              </form>
            </div>
          </div>
        )}

        {editInfoOverlayVisible && (
          <div className="meta-retarget-hero-overlay">
            <div className="meta-retarget-hero-overlay-form-container">
              <button
                onClick={closeOverlay}
                className="meta-retarget-hero-overlay-close-button"
              >
                X
              </button>

              <div className="meta-retarget-hero-overlay-form-headline">
                {formHeadline}
              </div>
              <form className="meta-retarget-hero-overlay-form-fields">
                <input
                  className="meta-retarget-hero-overlay-form-input"
                  autocomplete="name"
                  placeholder="name..."
                  type="text"
                  name="name"
                  value={formData.name}
                  onBlur={(e) => (e.target.placeholder = "name")}
                  onChange={handleFormChange}
                />

                <input
                  className="meta-retarget-hero-overlay-form-input"
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
                  className="meta-retarget-hero-overlay-form-input"
                  autocomplete="street-address"
                  placeholder="Street address..."
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleFormChange}
                  onBlur={(e) => (e.target.placeholder = "Street address...")}
                />

                {phoneErrorMessage && (
                  <div className="meta-retarget-hero-phone-error-message">
                    {phoneInvalidMessage}
                  </div>
                )}

                <button
                  className="meta-retarget-hero-registration-form-button-1"
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

export default MetaRetargetHeroSection1;

// module.exports = async function (context, req) {
//   context.log('JavaScript HTTP trigger function processed a request.');

//   const name = (req.query.name || (req.body && req.body.name));
//   const responseMessage = name
//       ? "Hello, " + name + ". This HTTP triggered function executed successfully."
//       : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";

//   context.res = {
//       // status: 200, /* Defaults to 200 */
//       body: responseMessage
//   };
// }
