import React, { useEffect, useState } from "react";
import white_logo from '../../assets/images/karstation-logo-white.svg';
import { getCurrentPortal } from "../../utils/portalUtils";
import Icons from "../../utils/icons";

const AuthHeader = ({isLoginPage}) => {

    const [currentSlide, setCurrentSlide] = useState(0);

    const defaultSlides = [
        {
            title: "Welcome!",
            text: "Enter your email and password to access your account."
        },
        {
            title: "Forgot Password?",
            text: "Click 'Forgot Password' to reset it quickly and securely."
        },
        {
            title: "Manage Your Profile",
            text: "Once signed in, you can easily update and manage your profile."
        }
    ];

    const forgotPasswordSlides = [
        {
            title: "Forgot Password?",
            text: "Reset Your Password and Get Back to Driving Performance and Efficiency!"
        },
        {
            title: "Reset Instructions",
            text: "Check your email for a link to reset your password securely."
        },
        {
            title: "Secure Your Account",
            text: "Remember to use a strong password to protect your account in the future."
        }
    ];

    const slides = isLoginPage ? defaultSlides : forgotPasswordSlides;

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <div className="left-side">
            {
                getCurrentPortal()!=='TECHNICIAN'?(
                    <img
                src={white_logo}
                alt="KarStation"
                className="logo hide-mobile"
                 />
                )
                :(<div className="logo technician-logo">
                    <div className="kartech-text">
                        KARTECH
                        </div> 
                        <div className="technician-logo-text">
                        <img src={Icons.karstaion_logo_technician} />
                        </div>
                </div>)
            
            }
            <div className="slider-container">
                <div className="slide">
                    <h2>{slides[currentSlide].title}</h2> 
                    <p>{slides[currentSlide].text}</p>
                </div>
                <div className="bullet-navigation">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`bullet ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default AuthHeader;