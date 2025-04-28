/* eslint-disable no-unused-vars */
import React, { useContext, useEffect, useRef, useState, useCallback } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { GlobalContext } from "../context/GlobalContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { apiService } from "../service/api.service";
import Swal from "sweetalert2";
import { Footer } from "../common/Footer";
import TagManager from 'react-gtm-module'; // Import the TagManager




 







export const LandingPage = () => {

    const tagManagerArgs = {
        gtmId: "GTM-MD3PPCXX",
      };
    
      TagManager.initialize(tagManagerArgs);
      useEffect(() => {
        window.dataLayer.push({
          event: "LpGetHelpPageView",
          title: "LandingPage.js",
        });
      }, []);





      const [hasSubmitted, setHasSubmitted] = useState(false); // Track if form has been submitted








    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const globalContext = useContext(GlobalContext);

    const [queryParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [messages, setMessages] = useState([]);
    const [showLogin, setShowLogin] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [passType, setPassType] = useState("password");
    const [goToCheckout, setGoToCheckout] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const textareaRef = useRef(null); // Create a ref for the textarea

    const TypingIndicator = () => {
        return (
          <div className="typing-indicator">
            <span>Lauren is responding</span>
            <span className="dots">...</span>
          </div>
        );
      };
    const { register, handleSubmit, formState: { errors }, setError } = useForm();

    const buyFreeTrial = useCallback(() => {
        // navigate(`/checkout?trial=${selectedPlan}`);
        // INTEGRATED FOR STRIPE
        navigate(`/stripe-checkout?plan=${selectedPlan}`, { replace: true });
    }, [navigate, selectedPlan]);




  //------------------------------ START DYNAMIC SITELINK CONTENT -------------------------------
//   Create a mapping from hash values to site link content
//   const [siteLinkText, setSiteLinkText] = useState("");
//   const siteLinkMap = {
//     "sl-one": "Taking the stress out of browsing online!",
//     "sl-two":
//       "How It Works:\n 1. Submit Your Question. 2. Get Your Answer. 3. Feel Better!",
//     "sl-three":
//       "Benefits of a Helpr Chat Subscription:\n 1. No Cost First 7 Days. 2. No Hidden Fees. 3. Cancel Anytime",
//     "sl-four":
//       "Questions?\n Call 770-765-7969 or submit your inquiry and we'll contact you asap",
//     // Add more mappings as needed
//   };

//   const hash = window.location.hash.substring(1); // Remove the '#' character

//   // If the hash value is in the map, set the site link text accordingly
//   if (hash in siteLinkMap) {
//     setSiteLinkText(siteLinkMap[hash]);
//   }
  //------------------------------ END DYNAMIC SITELINK CONTENT -------------------------------






 
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus(); // Focus on the textarea when the component loads
        }
    }, []);



    useEffect(() => {
        if (queryParams.get('action') === 'login') {
            setShowLogin(true);
        }
    }, [queryParams]);

    useEffect(() => {
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            // Check if the last message contains the trigger phrase or `goToCheckout` is true
            if (lastMessage.assistant && lastMessage.assistant.includes("7 day trial") && goToCheckout) {
                setTimeout(() => {
                    buyFreeTrial();
                }, 10000);
                // Set showSubscribeButton on the last message
                lastMessage.showSubscribeButton = true;
                setMessages([...messages.slice(0, messages.length - 1), lastMessage]); // Update last message with the button
            }
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, goToCheckout, buyFreeTrial]);

    useEffect(() => {
        const chatbotChat = localStorage.getItem("chatbot-chat");
        if (chatbotChat) {
            setMessages(JSON.parse(chatbotChat));
        } else {
            setMessages([{ "assistant": "<p>Welcome! I'm Lauren, I'm here to help you get your free personal AI chat access set up!</p>" }]);
        }
        // getPlanList();
        getStripePlanList();
    }, []);

    // const getPlanList = () => {
    //     apiService.getPlans().then((res) => {
    //         if (res.status === 200) {
    //             setSelectedPlan(res.data.data[0].id);
    //         }
    //     }).catch((err) => {
    //         console.log("plan list error: ", err);
    //     });
    // };

    const getStripePlanList = () => {
        apiService.getStripePlans().then((res) => {
            if (res.status === 200) {
                setSelectedPlan(res.data.data[0].id);
            }
        }).catch((err) => {
            console.log("plan list error: ", err);
        })
    };
    const sendMessage = () => {
        if (query && messages.length < 4) {
            const newMessages = [...messages];
            newMessages[newMessages.length - 1].user = query;
    
            // Clear the input immediately after submitting
            setQuery("");
    
            setMessages([...newMessages, { typing: true }]);
    
            setTimeout(() => {
                let newAssistantMessage = "";
    
                // switch (newMessages.length) {
                //     case 1:
                //         newAssistantMessage = "<p>Ok, how long has this been an issue for you?</p>";
                //         break;
                //     case 2:
                //         newAssistantMessage = "<p>Don't worry, we can get this worked out for you! Your expert AI trained chat agent is standing by to help. Any other info I should share before connecting you?</p>";
                //         break;
                //     case 3:
                //         newAssistantMessage = `<p>Ok, while I'm getting you connected to your personalized chat agent, please fill out the free registration form to get started. It's no cost to get your issue fixed with a 7 day trial!</p>`;
                //         setGoToCheckout(true);
                //         break;
                //     default:
                //         newAssistantMessage = "<p>I'm sorry, I can't provide more information at this time. Please click the 'Subscribe now!' link to continue.</p>";
                // }






                switch (newMessages.length) {
                    case 1:
                        newAssistantMessage = "<p>Your AI chat assistant can definiltey answer your question, and chat with you about pretty much anything you can think of! To gain access, please finish setting up your free trial on the next page. It's no cost at all to get started with a free 7 day trial!</p>";
                        setGoToCheckout(true);
                        break;
                    default:
                        newAssistantMessage = "<p>Your AI chat assistant can definiltey answer your question, and chat with you about pretty much anything you can think of! To gain access, please finish setting up your free trial on the next page. It's no cost at all to get started with a free 7 day trial!</p>";

                }


            



    
                const updatedMessages = newMessages.filter(msg => !msg.typing);
                setMessages([
                    ...updatedMessages,
                    {
                        assistant: newAssistantMessage,
                        showSubscribeButton: newMessages.length === 1,
                    },
                ]);
                localStorage.setItem("chatbot-chat", JSON.stringify(updatedMessages));
                textareaRef.current.focus(); // Keep focus in the text area
            }, 3000); // 3-second delay for typing simulation
        }
    };

    const onSubmitLogin = (data) => {

        if (!hasSubmitted) {
            // First form submission event
            window.dataLayer.push({
                event: "LpGetHelpChatEnter",
                title: "LandingPage.js",
                eventCategory: "Form",
                eventAction: "Submit",
               
            });
            setHasSubmitted(true);
        }

 




        globalContext.setLoader(true);
        apiService.login(data).then((res) => {
            globalContext.setLoader(false);
            if (res.status === 200) {
                localStorage.setItem("user-info", JSON.stringify(res.data));
                globalContext.setLoggedIn(true);
                globalContext.setUserInfo(res.data.data);
                globalContext.setSessionComplete(false);
                setShowLogin(false);
                navigate("/?chatType=text", { replace: true });
            }
        }).catch((err) => {
            console.log("login error: ", err);
            globalContext.setLoader(false);
            setError('password', { type: 'custom', message: err.response.data.detail });
        });
    };

 

    const handleSubscribeClick = (e) => {
        e.preventDefault();
        alert("Subscribe link clicked!");
        // We'll uncomment this once we confirm the alert is working
        // buyFreeTrial();
    };

    return (
        <>
            <div className="main-landing-page">
                <header>
                    <div className="header-logo">
                        <img src={require("../assets/images/logo-main.svg").default} alt="logo_img" />
                    </div>
                </header>

                <section className="hero-section">
                    <div className="hero-text-and-image-container">
                        <Row className="align-items-center">
                            <Col md={12}>
                                <div className="hero-content">
                                    {/* <h1>Technical problems? Enter your question below to get instant help from your AI tech expert</h1> */}
                                    <h1>Need Answers? Enter your question to get instant help from your AI expert</h1>
                                </div>
                            </Col>
                        </Row>
                        <Row className="align-items-center">
                            <Col md={12}>
                                <div className="hero-img">
                                    <img src={require("../assets/images/arrowimage.png")} alt="logo_img" />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </section>

                <div className="chat-container">
                    <div className="th-prominent-chat dqt-chat">
                        <div className="th-prominent-chat-window">
                            <div className="chat-header-main">
                                <div className="expert-profile expert-profile--blue">
                                    <div className="avatar">
                                        <div className="avatar-wrapper">
                                            <img src={require("../assets/images/helprpfp.png")} alt="logo_img" />
                                        </div>
                                    </div>
                                    <div className="details">
                                        <p className="name">Lauren </p>
                                        <p className="title">Personal AI Assistant</p>
                                    </div>
                                </div>
                            </div>
                            <div data-testid="dialog" className="dialog body">
                                <div className="content">
                                    <div className="hero-content-mobile-chat-container">
                                        <div className="hero-content-mobile-chat-headline">
                                        <h1>Need Answers? Enter your question to get instant help from your AI expert</h1>
                                        </div>
                                    </div>

                                    <div className="conversation">
    {messages?.map((msg, index) =>
        <div key={index}>
            {msg.typing ? (
                <TypingIndicator />
            ) : (
                <>
                    <div className="expert message th-chat-message">
                        <img className="right-message-img" src={require("../assets/images/helprpfp.png")} alt="logo_img" />
                        <div className="content">
                            <span className="name">Lauren, Personal AI Assistant</span>
                            <div className="text">
                                <span dangerouslySetInnerHTML={{ __html: msg?.assistant }} />
                                {msg.showSubscribeButton && (
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            buyFreeTrial();
                                        }}
                                        data-testid="subscribe-link-button"
                                        className="subscribe-button-link"
                                    >
                                        <strong>Gain free access! &gt;&gt;</strong>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {msg?.user && (
                        <div className="customer message th-chat-message">
                            <div className="content">
                                <div className="text message-text-lp">
                                    <span dangerouslySetInnerHTML={{ __html: msg?.user }} />
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )}
</div>
                                </div>
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="th-chat-integrated-question-box">
                                <div className="wrapper">
                                    <div className="text-box text-box-lp-format">
                                    <textarea 
    ref={textareaRef} // Apply the ref here
    placeholder="Type your question here..." 
    value={query} 
    onChange={(e) => setQuery(e.target.value.trimStart())} 
    data-testid="chat-input" 
    className="text-area" 
    onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }}
/>
                                    </div>
                                    <div className="bottom">
                                        <input type="button" value="Send" onClick={sendMessage} disabled={!query} className="lp-send-btn submit-button dqt-send disabled" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="how-it-work">
                    <div className="how-it-works-inner">
                        <h2>How It Works </h2>
                        <div className="how-it-works-inner-content">
                            <div className="how-it-works-bullet-numbers">1</div>
                            <div className="work-content-right">
                                <h6>Chat</h6>
                                <p>Tell your Helpr Personal AI Assistant what you need help with</p>
                            </div>
                        </div>
                        <div className="how-it-works-inner-content">
                            <div className="how-it-works-bullet-numbers">2</div>
                            <div className="work-content-right">
                                <h6>Create Account</h6>
                                <p>Create your Helpr account with a free 7 day trial, completely risk free</p>
                            </div>
                        </div>
                        <div className="how-it-works-inner-content">
                            <div className="how-it-works-bullet-numbers">3</div>
                            <div className="work-content-right">
                                <h6>Solve Your Problem</h6>
                                <p>With the help of your Personal AI Assistant, you can get almost any question answered instantly. 24/7 help and unlimited questions, so you never have to go it alone online</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="pricing-area-outer">
                    <div className="pricing-area-inner">
                        <h2>Free 7 Day Trial, Then Only $20/month. No commitments.</h2>
                        <p>Unlock unlimited Helpr chat with your Personal AI Assistant for just $20 per month, cancel anytime.</p>
                        <Button variant="unset" onClick={() => buyFreeTrial()}>Get Started <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.2203 10.9062L11.3313 1.14895L1.57769 1.43685M10.2334 2.26696L0.821276 11.8513" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg></Button>
                    </div>
                </section>

            </div>
            <Footer />
        </>
    );
};