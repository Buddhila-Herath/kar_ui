import React, { useCallback, useEffect, useState } from 'react';
import { Modal } from "antd";
import terms_logo from '../../assets/images/terms-logo.svg';
import Icons from "../../utils/icons"

const TermsPopup = ({ onAccept, onDecline }) => {
    const [visible, setVisible] = useState(true);
    const [showDeclinePopup, setShowDeclinePopup] = useState(false);

    const handleDecline = () => {
        setShowDeclinePopup(true); 
    };

    const closePopup = () => {
        setShowDeclinePopup(false); 
        setVisible(true);
    };

    return (
        <>
        <Modal
            centered
            open={visible}
            className="terms-popup-modal"
            footer={null}
            closable={false}
            width="auto"
        >
            <div className="terms-popup-container">
                <div className="terms-popup-header">
                    <div className="logo-and-title">
                        <img src={terms_logo} alt="Logo" className="terms-popup-logo" />
                        <div className="title-and-updated">
                            <p className="header-text">KARSTATION PLATFORM USER TERMS AND CONDITIONS</p>
                            <small className="last-updated">Last Updated: September 20, 2024</small>
                        </div>
                    </div>
                </div>
                <div className="terms-popup-divider"></div>
                <div className="terms-popup-content">
                    <p>
                    These Terms and Conditions shall apply to any use of the KARSTATION Platform and related
                        services (hereinafter referred to as the “Platform”). By clicking the button “SUBMIT, FINISH,
                        I/WEAGREE” upon your registration for the services provided by the Platform (hereinafter
                        referred as the “Services”) and/or if you make any use and/or has requested for a
                        demonstration of the Services, you agree to be bound by these Terms and Conditions and to
                        qualify as a user of the Services via the Platform (hereinafter referred to as a “User” or “You”),
                        which term shall include Payers and Payees defined below). By accepting these Terms and
                        Conditions, you agree upon a valid and binding agreement with INGENIEURSKUNST (Pvt) Ltd.
                        Please read these Terms and Conditions carefully so that you know what your rights and
                        obligations are when using the Platform and/or Services. These Terms and Conditions are
                        available for downloading and printing at <a href="https://www.karstation.com/Terms&conditions" target="_blank">https://www.karstation.com/Terms&conditions</a>
                    </p>
                    <p>
                        This Agreement sets out the terms and conditions under which you may participate in any
                        live/recorded webinars (hereinafter referred to as the “Webinars”) relating to the use of the
                        Platform or otherwise, view, download or play back a Webinar, or provide services as a service
                        provider in the automobile industry, or obtain services from or make inquiries from such service
                        providers, use payment processing services available in the Platform, which provide Payees
                        with the facility to accept credit cards, debit cards, and other payment methods, and provide
                        Payers with the facility to make payments through credit cards, debit cards or other payment
                        methods (hereinafter referred to as “Payment Services”), on a website or mobile application,
                        and use any other Service or functionality available from time to time via the Platform.
                    </p>
                    <p>
                        <h4>1. Agreement</h4>
                        <li>
                            <p>1.1 This Agreement becomes a legally binding contract and is effective as of the date you subscribe/create an account on the Platform accepting this Agreement online.</p>
                        </li>
                        <li>
                            <p>1.2 This Agreement, as may be amended from time to time, at the sole discretion of
                                the Company, without prior notice to you, shall be available on the Platform, and
                                you hereby agree to be bound by such amended Agreement. Any changes to
                                the terms and conditions herein shall be effective immediately on posting of such
                                changes on this page. You agree to check this page from time to time to take
                                notice of any such amendments, and they shall be binding on you. If you use the
                                Payment Services after such amendments being published, you agree to be
                                bound by them. If you do not agree to be bound by the amended terms, you
                                shall not use the Payment Services. The Company shall make endeavours to
                                inform you via e-mail of any amendment to the Agreement as soon as possible.
                                However, non-receipt of any such e-mail by you shall NOT absolve you from
                                being subject to the said amended or new terms and conditions.
                            </p>
                        </li>
                        <h4>2. Charges and Payments</h4>
                        <li>
                            <p>2.1 
                                For the Payment Services provided by the Platform either the Payer and/or
                                Payee shall pay a service fee for every transaction that is successfully completed
                                via the Platform – which service fee may differ for different types of transactions,
                                and shall be deducted by the Platform automatically from the relevant payment
                                made, as and when the transaction is made. The relevant service fee shall be
                                indicated and made known to you prior to effecting a transaction. Any additional
                                bank charge levied by the Payer’s bank shall be outside the purview and control
                                of the Company.
                            </p>
                        </li>
                        <li>
                            <p>2.2
                                The discretion as to who bears the service fee shall lie solely with the Company.
                                Service fees may be revised at any time without prior notice to or consent of the
                                Payer or Payee, but the value of same shall be made available to the User prior
                                at the time of transaction. Bet to say “as a notice on the website or a message
                                at login.
                            </p>
                        </li>
                        <li>
                            <p>2.3
                                The service fee deducted relating to a successful transaction shall not be
                                refundable under any circumstance including if the transaction is made
                                erroneously by the Payer – whether due to a mistake of the Payer or due to
                                erroneous information placed on the Platform by the Payee, or due to any other
                                reason.
                            </p>
                        </li>
                        <li>
                            <p>
                                2.4
                                Payments made through the Platform may also be subject to any charge your
                                bank or credit/debit card issuer may additionally charge you, and you shall be
                                responsible for all such charges.
                            </p>
                        </li>
                        <li>
                            <p>
                                2.5
                                The internet payment gateway required for transactions hereunder shall be
                                provided by the Company, and the Payee shall not be entitled to connect or
                                deploy any other payment gateways to enable payments through the Platform.
                            </p>
                        </li>
                        <li>
                            <p>
                                2.6
                                While the Company shall make all reasonable endeavors to make available
                                information relating to discounts, payment options and other offers available on
                                various credit/debit cards relating to transactions made on the Platform, the
                                Company does NOT provide any assurance of accuracy or timeliness of such
                                offers.
                            </p>
                        </li>
                        <h4>3. Account Security</h4>
                        <li>
                            <p>3.1
                                You shall not allow anyone else to have or use your password and/or login
                                details and or any other access credentials and shall exercise utmost diligence
                                and care regarding account access and security. In the event you so share your
                                password details or other access credentials, the Company shall not be liable for
                                any loss or damage that may accrue whether such loss/damage was foreseeable
                                or otherwise. On registration for use of the Platform, you shall receive your
                                unique username via e-mail or an OTP Sign in after which you are required to
                                create your own confidential unique password to be used each time you log into
                                your account in the Platform.
                            </p>
                        </li>
                        <li>
                            <p>3.2
                                Webinar participation shall be only for registered Users and registration
                                information shall NOT be forwarded to third parties, and doing so may hinder the
                                User’s own access. Similarly, the Webinar materials (described in Clause 8.2)
                                and replay of Webinars shall be for use by the said User only and shall NOT be
                                forwarded on to third parties (Mainly Software Developers, Competitors etc.)
                            </p>
                        </li>
                        <li>
                            <p>3.3
                                If you suspect that your password or other confidential login credentials are
                                known to any other party, you shall immediately change them to new confidential
                                log in credentials, and report a violation via email to leagal@KATSTATION.com
                            </p>
                        </li>
                        <li>
                            <p>3.4
                                You shall keep your personal details up to date. Violation of this provision may
                                cause termination of the Agreement by the Company
                            </p>
                        </li>
                        <li>
                            <p>3.5
                                You shall take all reasonable steps to protect the security of the device/login
                                Details through which you access the Payment Services.
                            </p>
                        </li>
                        <li>
                            <p>3.6
                                The Company at its sole discretion reserves the right to request additional
                                information to verify your identity or in order to otherwise determine whether to
                                allow you to use the Platform/Payment Services.
                            </p>
                        </li>
                        <li>
                            <p>3.7
                                You shall be fully responsible for any transaction that is carried out using your log
                                in credentials – whether carried out by you or anyone else, using any device
                                owned or used by you, or otherwise.
                            </p>
                        </li>
                        <li>
                            <p>
                                Once you have logged or signed in to your account in the Platform you shall not
                                at any time leave the access device from which you have accessed the Platform
                                and the Services or let anyone else use the said device until you successfully log
                                out of the account. You shall be responsible for ensuring that you have logged
                                out of the secure area at the end of the particular session.
                            </p>
                        </li>
                        <h4>4. User Obligatio</h4>
                        <li>
                            <p>4.1
                                You shall be at least eighteen (18) years old and able to form legally binding
                                contracts.
                            </p>
                        </li>
                        <li>
                            <p>4.2
                                The Payee shall not bill a User via the Platform unless the Payer requests same.
                            </p>
                        </li>
                        <li>
                            <p>4.3
                                You agree to be bound by any further terms and conditions or restrictions your
                                bank or credit/debit card issuer may subject you to, relating to the use of the
                                Payment Services.
                            </p>
                        </li>
                        <li>
                            <p>4.4
                                You shall NOT misuse the Platform by knowingly introducing, including without
                                limitation, any viruses, trojans, easter eggs, worms, logic bombs, time bombs,
                                spyware or computer code or other material which is malicious or technologically
                                harmful or is intended to or may damage, disrupt, interfere with or hijack the
                                operation of, or monitor the use of, any hardware, software or equipment, or of
                                the Platform itself or the servers or networks used to make the Platform available
                                to Users. You shall NOT modify, adapt, translate, reverse engineer, decompile,
                                copy, distribute or disassemble any portion of the Platform or related software, or
                                attempt to do so – either yourself or via a third party. You shall not use any robot,
                                spider, site search/retrieval application or other manual or automatic device to
                                retrieve, index, “scrape,” “data mine” or in any way gather the Platform’s content
                                or reproduce or circumvent the navigational structure or presentation of the
                                Platform. You shall not attempt to gain unauthorized access to the Platform or
                                components thereof, the server on which the Platform is stored or any server,
                                computer or database connected to the Platform. The Company shall be fully
                                entitled to report any breach of the above to the relevant authorities and shall be
                                entitled to co-operate with such authorities by disclosing your identity to them. In
                                such event, your right to use the Platform shall cease automatically and
                                immediately.
                            </p>
                        </li>
                        <li>
                            <p>4.5
                                Securing reliable and secure connectivity and adequate bandwidth to access and
                                use the Platform shall be responsibility of the User, and the Company shall not
                                be liable to make any recommendation or provide any advice relating to same.
                            </p>
                        </li>
                        <li>
                            <p>4.6
                                Your participation in, or viewing any Webinar/Recorded content conducted by the
                                Platform shall be no assurance that you have fully understood the features or
                                functionality or any other aspect of the Platform, and it shall be your responsibility
                                to obtain any required clarification or assistance from the Company to
                                supplement the Webinar/recorded content. Such assistance or clarification may
                                be provided by the Company as soon as possible but at a time agreeable to the
                                Company.
                            </p>
                        </li>
                        <li>
                            <p>4.7 
                                You shall use communication facilities (hereinafter referred to as
                                “Communication Facilities”) of the Platform only to post, send and receive
                                messages and material that are proper and, when applicable, related to the
                                particular purposes relating to the Services or a Payee. Inter alia you agree that
                                when using the Communication Facilities, you shall NOT:
                            </p>
                            <ol>
                                <p>
                                    i) Use Communication Facilities in connection with surveys, contests,
                                        pyramid schemes, chain letters, junk email, spamming or any duplicative
                                        or bulk or unsolicited messages (commercial or otherwise);
                                </p>
                                <p>
                                    ii) Defame, abuse, harass, stalk, threaten or otherwise violate legal rights
                                    and privacy rights of others (whether of Users or otherwise);
                                </p>
                                <p>
                                    iii) Publish, post, upload, distribute or disseminate any inappropriate,
                                    disrespectful, defamatory, obscene, indecent, unethical or unlawful
                                    subject, name, material or information, or religious, illegal, anti-social
                                    subject matter;
                                </p>
                                <p>
                                    iv) Upload, or otherwise make available, files that contain images,
                                    photographs, software or other material protected by intellectual property
                                    laws, including but not limited to, copyright or trademark laws (or by rights
                                    of privacy or publicity) unless you own or control the rights thereto or
                                    possess all necessary consent to do same; 
                                </p>
                                <p>
                                    v) Use any material or information, including images or photographs, which
                                        are made available through the Platform in any manner that infringes any
                                        copyright, trademark, patent, trade secret, or other proprietary right of any
                                        party (whether of Users or otherwise).
                                </p>
                                <p>
                                    vi) Upload files that contain viruses, trojan horses, worms, time bombs,
                                        cancelbots, corrupted files, or any other similar software or programmes
                                        that may damage the operation of another's computer or property of
                                        another;
                                </p>
                                <p>
                                    vii) Advertise or offer to sell or buy any goods or services for any business
                                    purpose, unless any Communication Facility specifically and expressly
                                    allows same.
                                </p>
                                <p>
                                    viii) Download any file posted by another User of a Communication Facility
                                    that you know, or reasonably ought to know, cannot be legally reproduced,
                                    displayed, performed, and/or distributed in such manner;
                                </p>
                                <p>
                                    ix) Falsify or delete any copyright management information, such as author
                                    attributions, legal or other proper notices or proprietary designations or
                                    labels of the origin or source of software or other material contained in a
                                    file that is uploaded the Company or any User to the Platform or the
                                    Company’s website;
                                </p>
                                <p>
                                    x) Restrict or inhibit any other User from using and enjoying the
                                    Communication Facilities
                                </p>
                                <p>
                                    xi) Harvest or otherwise collect information about others (whether relating to
                                        Users or otherwise), including e-mail addresses, or misuse/abuse them;
                                </p>
                                <p>
                                    xii) Violate any applicable laws or regulations;
                                </p>
                                <p>
                                    xiii) Create a false identity of yourself, or misrepresent your identity, for the
                                    purpose of misleading others or for any other purpose;
                                </p>
                                <p>
                                    xiv) Use, download or otherwise copy, or provide (whether or not for a fee) to
                                    a person or entity any information/data relating to Users; 
                                </p>
                                <p>
                                    xv) Publish or mention anything relating to specific reference to the character
                                    of a person; 
                                </p>
                                <p>
                                    xvi) Upload, post or otherwise make available any personal data/information
                                    relating to anyone; 
                                </p>
                                <p>
                                    xvii) Include any statement, picture, audio or video that promotes the products
                                    or services of the Company’s competitors.
                                </p>
                            </ol>
                        </li>
                        <li>
                            <p>
                               4.8 You shall always use caution when disclosing any personally identifiable
                                information about yourself or any other party, in any Communication Facility.
                                The Company does not control or endorse the content, messages or information
                                found in any Communication Facility and, therefore, the Company specifically
                                and expressly disclaims any liability with regard to the Communication Facility
                                and any actions resulting from your participation in any Communication Facility.             
                            </p>
                        </li>
                        <li>
                            <p>4.9
                                You shall not use or attempt to use the Platform in a manner that could harm
                                anyone or impair its/his/her use of the Platform, including but not limited to:
                            </p>
                        </li>
                        <li>
                            <ol>
                                <p>
                                    i) Attempting to gain unauthorized access to any Service, doing anything to
                                        deny others’ access to any Service, or authorizing any third party to
                                        access or use the Services on your behalf;
                                </p>
                                <p>
                                    ii) Use any Service to try to gain unauthorized access to any other Service,
                                    data, account or network by any means;
                                </p>
                            </ol>                                
                        </li>
                        <li>
                            <p>4.10
                                You shall be responsible for the protection of your computer or other device
                                (accessing the Platform) against interference, spyware or viruses that may be
                                encountered in downloading items from the Platform or otherwise using the
                                Platform. Installation of virus protection and keeping it up to date shall be your
                                responsibility.
                            </p>
                        </li>
                        <li>
                            <p>4.11
                                You shall strictly abide by all prevalent data protection laws
                            </p>
                        </li>
                        <h4>5. Warranties and Representations</h4>
                        <li>
                            <p>5.1
                                You shall be authorized to enter into and carry out transactions under this
                                Agreement. This Agreement shall be binding on and enforceable against yo
                            </p>
                        </li>
                        <li>
                            <p>5.2
                                The information provided by you in creating your account in the Platform shall be
                                accurate and you agree that if any information you have provided transpires to be
                                inaccurate, fraudulent or otherwise misleading, this Agreement shall be deemed
                                terminated and you shall not be entitled to use the Platform for any purpose
                                whatsoever, pursuant to which your account may be terminated without any prior
                                notice to you, and no payment you have made using the Platform shall be
                                refundable or reversible.
                            </p>
                        </li>
                        <li>
                            <p>5.3
                            You shall not carry out any illegal transaction or pay for any illegal supply of
                            goods or services by a purported Payee, or attempt to entice any Payee to carry
                            out any such illegal supply of goods or services, and your account shall be liable
                            to be terminated without notice to you in the event of such transaction
                            </p>
                        </li>
                        <li>
                            <p>5.4
                            In the event of any order, decree or request from any Government authority to
                            temporarily suspend your account in the Platform or terminate such account, the
                            account shall be liable for such suspension or termination without notice to you,
                            and without any obligation on the part of the Company to inquire as to reasons
                            for such order, decree or request, or to provide any reasons to you for such
                            suspension.
                            </p>
                        </li>
                        <li>
                            <p>5.5
                                By posting a communication (including any images, graphics, designs, creations
                                etc. that are included in or attached to the communication) you warrant and
                                represent that you own or otherwise control all rights to your communication,
                                including but not limited to, all rights necessary for you to provide, post, upload,
                                input or submit the said communication.
                            </p>
                        </li>
                        <li>
                            <p>5.6
                                In addition to the warranty and representation stipulated in Clause 5.5 above, by
                                posting a communication that contains images, photographs, pictures or that are
                                otherwise graphical in whole or in part (hereinafter referred to as "Images"), you
                                warrant and represent that (a) you are the copyright owner of such Images, or
                                that the copyright owner of such Images has granted you permission to use such
                                Images or any content and/or images contained in such Images consistent with
                                the manner and purpose of your use and as otherwise permitted by this
                                Agreement, and (b) that each person depicted in such Images, if any, has
                                provided consent to the use of the Images as set forth in this Agreement,
                                including but not limited to, the distribution, public display and reproduction of
                                such Images.
                            </p>
                        </li>
                        <li>
                            <p>5.7
                                For contractual and other purposes hereunder and pertaining to your account in
                                the Platform, you consent to receiving communications electronically from the
                                Company/Platform to the email address you registered in the Platform, and you
                                agree that all agreements, notices, disclosures and other communications that
                                the Company/Platform provides to you electronically shall satisfy any
                                legal/contractual requirement for such communications to be in writing.
                            </p>
                        </li>
                        <h4>6. Limitation of Liability and Indemnity</h4>
                        <li>
                            <p>6.1
                                The Company shall not be liable whatsoever for any loss incurred by you arising
                                due to negligence, fraud, illegal activity, or other mischief, in using the Platform
                                (which is not attributable to the Platform or the Company), or for suspension or
                                termination of your account for any reason whatsoever.
                            </p>
                        </li>
                        <li>
                            <p>6.2
                                The Company shall not be liable to you or any third party for any consequential,
                                indirect, special, incidental, or exemplary damages arising out of or relating to this Agreement or the Payment Services, whether foreseeable or unforeseeable,
                                and whether based on breach of any express or implied warranty, breach of
                                contract, misrepresentation, negligence, strict liability in tort, or other cause of
                                action (including, but not limited to, damages for loss of data, goodwill, profits,
                                investments, business or other opportunity, use of money, or use of facilities,
                                interruption in use or unavailability of data), even if the Company has been
                                advised of the possibility of such damages.
                            </p>
                        </li>
                        <li>
                            <p>6.3
                                The Company shall not be liable for the failure of any transaction, for non-
                                availability of credit or funds in the Payer’s credit card or debit card, or his/its/her
                                bank account, or for any other reason causing the failure of a transaction.
                            </p>
                        </li>
                        <li>
                            <p>6.4
                                You expressly agree that your sole and exclusive remedy for dissatisfaction
                                relating to the Platform or Payment Services shall be to attempt transacting anew
                                or to discontinue the use of the Platform and Payment Services. The User shall
                                NOT maliciously discredit or criticize the Platform or the Company via any means
                                absolutely whatsoever, publicly or otherwise.
                            </p>
                        </li>
                        <li>
                            <p>6.5
                                The Company shall not be liable for any loss or damage caused by a virus, or
                                other technologically harmful material that may infect/affect your computer
                                equipment, device, computer programs, data or other proprietary material
                                attributable to your use of the Platform or to your downloading of any content
                                therein, or on any website linked to it.
                            </p>
                        </li>
                        <li>
                            <p>6.6
                                The Company assumes no responsibility for the content of User websites or
                                other websites linked to the Platform. Availability of such links on the Platform
                                shall not be deemed as endorsement or any assurance by the Company of those
                                linked websites. The Company shall not be liable for any loss or damage that
                                may arise from your use of the said websites or reliance on information therein.
                            </p>
                        </li>
                        <li>
                            <p>6.7
                                You agree to indemnify, defend, and hold harmless the Company, affiliates,
                                officers, directors, agents, and employees from and against any lawsuit, claim,
                                liability, loss, penalty or other expense (including attorneys’ fees and cost of
                                defense) they may suffer or incur as a result of your breach of this Agreement,
                                your use of the Payment Services, and/or any fraudulent or other unlawful act, or
                                any other act that may cause liability to the Company, its affiliates, officers,
                                directors, agents, or employees, committed or attempted by you using the
                                Payment Services.
                            </p>
                        </li>
                        <li>
                            <p>6.8
                                The Company shall not be liable for any erroneous or misdirected payment,
                                overpayment, or payment to an incorrect Payee by you, and you agree that no
                                reversal or refund of such payment shall be done via the Platform nor shall the Company be liable for such reversal or refund, or for refund of the service fee
                                charged for such transaction.
                            </p>    
                        </li>
                        <li>
                            <p>6.9
                                The Company shall not be liable for any payment or transaction being declined
                                by your bank or credit/debit card issuer despite availability of funds or credit in
                                your bank account or credit/debit card respectively, and the Company shall not
                                accommodate or entertain any complaints regarding same Further, the
                                Company shall not be liable for any repeated/additional charges/fees levied to
                                you by any party pursuant to repeated attempts to transact further to the failure of
                                any purported transaction via the Platform or otherwise.
                            </p>    
                        </li>
                        <li>
                            <p>6.10
                                The Company shall not be liable for any incorrect invoice or other payment notice
                                received by you, and shall not be liable to intervene in or rectify such payment
                                notification.
                            </p>    
                        </li>
                        <li>
                            <p>6.11
                                The Company shall not be held liable for any action as a result of breach of the
                                system, Platform, and data.
                            </p>    
                        </li>
                        <li>
                            <p>6.12
                                You agree that the Company shall not be responsible for links to other
                                internet/online sites or resources in the Platform or the availability of such
                                external sites or resources, and does not endorse and is not responsible or
                                liable for any content, advertising, products, or other materials on or available
                                from such sites or resources. The Company shall not be responsible or liable,
                                directly or indirectly, for any actual or alleged damage or loss caused by or in
                                connection with use of or reliance by any user or anyone else on any such
                                content, goods or services available on or through any such site or resource.
                            </p>    
                        </li>
                        <h4>7. Warranty Disclaimer</h4>
                        <li>
                            <p>7.1
                                The Payment Services are provided “as is” without any warranty whatsoever.
                                The Company disclaims all warranties whether express, implied, or statutory,
                                including all implied warranties of merchantability, fitness for a particular purpose,
                                or of network or Platform availability
                            </p>    
                        </li>
                        <li>
                            <p>7.2
                                You agree that access to the Platform or the Payment Services may be restricted
                                due to maintenance of the Platform and downtime relating thereto. The
                                Company shall make all reasonable efforts to ensure that transactions are
                                processed in a timely manner. While the Company shall not be liable for any
                                interruption, outage, or failure to provide the Payment Services the Company
                                shall however, make all reasonable efforts to ensure that transactions are
                                processed in a timely manner.
                            </p>    
                        </li>
                        <li>
                            <p>7.3
                                The Company does not guarantee that the Platform, or any content therein, shall
                                be free from errors or omissions.
                            </p>    
                        </li>
                        <li>
                            <p>7.4
                                The Platform shall be accessible free of charge (subject however to all charges
                                stipulated herein relating to transactions made via the Platform), and the
                                Company shall not be liable for any charges accrued to users of the Platform
                                arising from the use of the internet/data services to access the Platform.
                            </p>    
                        </li>
                        <li>
                            <p>7.5
                                You shall be responsible for configuring your systems, computer programs and
                                platforms in order to access the Platform, and use your own virus protection
                                software and online security and safeguards.
                            </p>    
                        </li>
                        <li>
                            <p>7.6
                                The Company shall not be responsible for mediation or resolution of any dispute
                                between any Users, provided however, that at the sole discretion of the
                                Company it shall be entitled to intervene in any such dispute as it deems at its
                                own discretion as necessary or appropriate.
                            </p>    
                        </li>
                        <h4>8. License</h4>
                        <li>
                            <p>8.1
                                The Company hereby grants you a revocable, non-exclusive, non-transferable
                                license to use the Platform solely in relation to the use of the Platform and
                                Services.
                            </p>
                        </li>
                        <li>
                            <p>8.2
                                Subject to any Additional Terms (as defined below) which may apply to specific
                                materials and payments, the Company grants the User a non-exclusive, non-
                                transferable, limited license to access and use the Webinar or Webinar materials
                                (which may include information provided through Webinars) from time to time
                                made available to the User for the purposes ONLY of use of the Platform. This
                                license is subject to the following limitations:
                            </p>
                            <ol>
                                <p>i)
                                    The right to electronically display or access a Webinar or Webinar
                                    materials shall be limited to the registered User;
                                </p>
                                <p>ii)
                                    The User shall not be entitled to print any Webinar material
                                </p>
                                <p>iii)
                                    Subject to the terms and conditions herein, the User shall be otherwise
                                    prohibited from downloading, storing, reproducing, transmitting, displaying,
                                    printing, copying, distributing, or using the Webinar materials
                                </p>
                            </ol>
                        </li>
                        <li>
                            <p>8.3
                                Other provisions that govern the User's use of the Platform shall be as set forth in
                                online notices in the Platform from time to time or communicated to the User via e-mail, and individual documents retrieved from the Platform (collectively referred
                                to as "Additional Terms"), all of which shall be incorporated by reference into
                                this Agreement.
                            </p>
                        </li>
                        <h4>9. Rights of the Company</h4>
                        <li>
                            <p>9.1
                                All reasonable efforts shall be made to ensure that live Webinar/s take place on
                                the scheduled date and time. In the event same does not take place, the
                                Company shall be entitled to schedule an alternative date/time
                            </p>
                        </li>
                        <li>
                            <p>9.2
                                Users consent to the Company monitoring the Users that access the Webinar/s
                                and Platform including the number of computers and their IP addresses to
                                ensure that the unique usernames and passwords have not been distributed
                                beyond those registered Users.
                            </p>
                        </li>
                        <li>
                            <p>9.3
                                The Company reserves the right to review materials posted to the
                                Communication Facilities and to remove any materials in its sole and absolute
                                discretion. The Company reserves the right to terminate your access to any or
                                all of the Communication Facilities, or your registration and use of the Platform,
                                at any time, without notice, for any reason whatsoever.
                            </p>
                        </li>
                        <li>
                            <p>9.4
                                The Company reserves the right at all times to disclose any information as it
                                deems necessary to satisfy any applicable law, regulation, legal process or
                                Governmental request.
                            </p>
                        </li>
                        <li>
                            <p>9.5
                                The Company shall be entitled to edit, refuse to post or to remove any
                                information or materials – whether posted by a User or otherwise, in whole or in
                                part, at the Company's sole discretion.
                            </p>
                        </li>
                        <li>
                            <p>9.6
                                The Company reserves the right to store the information you provide or upload to
                                the Platform outside your country of residence.
                            </p>
                        </li>
                        <li>
                            <p>9.7
                                The Company reserves the right to modify the Platform and/or the Services or
                                suspend or terminate the Platform and/or the Services or access to part or all of
                                the Services/features of the Platform, at any time
                            </p>
                        </li>
                        <h4>10. Intellectual Property</h4>
                        <li>
                            <p>10.1
                                As a Payee you agree that it shall not at any time during or after this Agreement
                                assert or claim any interest in or do anything that may adversely affect the
                                validity of any trademark, tradename or product, design belonging to the
                                Company. Upon termination of this Agreement with the Payee, the Payee shall
                                immediately cease all displaying, advertising and use of the trademarks.
                            </p>
                        </li>
                        <li>
                            <p>10.2
                                Other than the express licenses granted hereunder, the Company grants no right
                                or license by implication, estoppel or otherwise to the Payment Services or any
                                intellectual property rights of the Company. Each party shall retain all ownership
                                rights, title, and interest in and to its own products and services (including in the
                                case of the Company, in the Payment Service) and all intellectual property rights
                                therein, subject only to the rights and licenses specifically granted herein.
                            </p>
                        </li>
                        <li>
                            <p>10.3
                                The User shall not use a Webinar or the Platform in any manner that infringes the
                                copyright or other intellectual property or proprietary interests of the Company or
                                any third party therein
                            </p>
                        </li>
                        <li>
                            <p>10.4
                                The Company reserves the right to use Payees’ trademarks and branding on the
                                Platform and Company’s website, promotional material and advertisements,
                                provided however, same shall be restricted to the periods during which the said
                                Payees remain connected to the Platform.
                            </p>
                        </li>
                        <li>
                            <p>10.5
                                You shall NOT either during the period of the Agreement or otherwise, design or
                                develop or attempt to design or develop any software, platform, system or
                                application similar to the Platform, or aid, assist or support any other party to do
                                so directly or indirectly, or use any such software, platform, system or application
                                developed or made available by any other party or operated or maintained by
                                any other party. Any attempt to design or develop such software, system or
                                application similar to the Platform shall be deemed to be a violation of the
                                intellectual property rights of the Company, and such user shall indemnify the
                                Company against such violation and all losses arising therefrom, and shall entitle
                                the Company to terminate the Agreement with him/her/it.
                            </p>
                        </li>
                        <h4>11. Term and Termination</h4>
                        <li>
                            <p>11.1
                                The term of this Agreement shall commence on the Effective Date and shall
                                continue until terminated by you by terminating your account, or until terminated
                                under any of the circumstances herein mentioned giving rise to termination of this
                                Agreement and/or your account, including but NOT limited to the following.
                            </p>
                            <ol>
                                <p>i)
                                    Belief by the Company that you have breached this Agreement.
                                </p>
                                <p>ii)
                                    Belief by the Company that you have used the Payment Services for any
                                    illegal/prohibited activity/transaction.
                                </p>
                                <p>iii)
                                    In the event your personal details change without notice to the Company
                                </p>
                                <p>iv)
                                    Death of an individual User or winding up/dissolution or otherwise loss of
                                    legal status/validity of an incorporated User.
                                </p>
                                <p>v)
                                Loss of contractual capacity of the User.
                                </p>
                            </ol>
                        </li>
                        <li>
                            <p>11.2 
                                Notwithstanding anything herein, this Agreement shall be deemed terminated in
                                the event of breach of any representations or warranties by you.
                            </p>
                        </li>
                        <li>
                            <p>11.3 
                                The Company shall be entitled to terminate this Agreement at any time without
                                giving reasons.
                            </p>
                        </li>
                        <li>
                            <p>11.4 
                                Any termination of this Agreement shall not relieve you of any obligations to pay
                                any fees, costs, penalties, or any other amounts or indemnities owed by you to
                                the Company as provided under this Agreement, whether accrued prior to or
                                after termination.
                            </p>
                        </li>
                        <li>
                            <p>11.5 
                                Termination of this Agreement shall not in any event affect any rights of the
                                Company or your liabilities accrued as at the date of termination.
                            </p>
                        </li>
                        <li>
                            <p>11.6 
                                Exercise of any right by the Company hereunder shall not prejudice the
                                Company’s right to exercise any other right, or to terminate this Agreement.
                            </p>
                        </li>
                        <li>
                            <p>11.7 
                                You agree that the Company shall not be liable to you or any third party for any
                                termination of this Agreement or your access to the Platform or to any such
                                information or files, and shall not be required to make such information or files
                                available to you after any such termination
                            </p>
                        </li>
                        <h4>12. Relationship</h4>
                        <li> <p>12.1
                            Nothing herein shall be construed to give rise to a partnership or other
                            relationship between the Company and you, than one of independent contractor.</p>
                        </li>
                        <h4>13. Notices</h4>
                        <li><p> 13.1
                            Any notice or other information required or authorized by this Agreement to be
                            given by either Party to the other may be given in keeping with Clause 5.7 herein.</p>
                        </li>
                        <h4>14. Entire Agreement</h4>
                        <li><p> 14.1
                            This Agreement constitutes the entire agreement/understanding between you
                            and the Company, and governs your use of the Platform and Payment Services,
                            and there shall be no promises, terms, conditions or obligations oral or written,
                            express or implied other than those contained in this Agreement or
                            communicated to you in keeping with this Agreement. Any
                            amendments/additions to the terms and conditions herein effected by the
                            Company at its sole discretion shall be binding on you.</p>
                        </li>
                        <h4>15. Assignment</h4>
                        <li> <p> 15.1
                           You shall not assign this Agreement or any part thereof or any rights or
                            obligations hereunder, without the Company’s prior written approval. Any such
                            attempted assignment shall be void. The Company reserves the right to assign
                            this Agreement or any part thereof and the rights and obligations hereunder to
                            any third party without your consent or notice to you. Subject to the foregoing,
                            this Agreement shall be binding upon and inure to the benefit of the Parties
                            hereto, their successors, heirs, administrators, executors and permitted assigns.</p>
                        </li>
                        <h4>16. Third Parties not to Benefit</h4>
                        <li> <p>16.1
                            This Agreement is not intended to, and shall not be construed to, create any
                            rights or remedies for any party other than the Parties hereto, and to any party
                            the Company may assign this Agreement to. No other person shall assert any
                            rights as a third party beneficiary hereunder.</p>
                        </li>
                        <h4>17. Severability</h4>
                        <li><p>17.1
                            If any provision of this Agreement is held by a court of competent jurisdiction to
                            be invalid, void or unenforceable for any reason, the remaining provisions shall
                            nevertheless continue in full force and effect.</p>
                        </li>
                        <h4>18. Waiver</h4>
                        <li><p> 18.1
                            The failure by either Party to the Agreement to exercise or enforce any right
                            conferred by the Agreement shall not be deemed to be a waiver of any such right
                            nor operate so as to bar the exercise or enforcement hereof at any time. Further,
                            no waiver of any term or condition in this Agreement by either Party shall be
                            deemed subsequent waiver of that term or waiver of any other term or condition.
                            No term or provision of this Agreement shall be deemed waived, and no breach
                            excused, unless such waiver or consent shall be in writing and signed by the
                            party waiving or consenting.</p>
                        </li>
                        <h4>19. Applicable Law and Settlement of Disputes</h4>
                        <li><p>19.1
                            This Agreement shall be governed by the laws of the Democratic Socialist
                            Republic of Sri Lanka.</p>
                        </li>
                        <li><p>19.2
                            If any dispute or difference whatsoever arises between the Parties concerning
                            matters relating to this Agreement or any provision thereof, the Parties shall use
                            their best endeavours to resolve the dispute or difference amicably.</p>
                        </li>
                        <li><p>19.3
                            Failing amicable resolution of such dispute or difference by the Parties the
                            dispute or difference shall then be finally referred to a court of competent
                            jurisdiction chosen by KARSTATION.</p>
                        </li>
                        <h4>20. Warranty of Authority</h4>
                        <li><p> 20.1
                            You hereby warrant that you have full capacity in law and otherwise to enter into
                            this Agreement and to carry out obligations hereunder, and that there is nothing
                            legally or otherwise prohibiting you from doing so, and that you shall be legally
                            bound by this Agreement.</p>
                        </li>
                    </p>
                </div>
                <div className="terms-popup-footer">
                    <button className="decline-button" onClick={handleDecline}>Decline</button>
                    <button className="accept-button" onClick={onAccept}>Accept</button>
                </div>
            </div>
        </Modal>
        {showDeclinePopup && (
            <>
            <div className="terms-overlay"></div>
            <div className="terms-msg-popup">
                <div className="terms-msg-popup-content">
                    <span className="close-icon" onClick={closePopup}></span>
                    <img src={Icons.password_reset} alt="error" className="error-icon" />
                    <h2>Decline the Terms and Conditions?</h2>
                    <p>By declining, you will not be able to access the dashboard or use the system</p>
                    <button onClick={onDecline}>Yes, Decline</button>
                    <button className="close-msg-btn" onClick={closePopup}>No, Let Me Review</button>
                </div>
            </div>
            </>
        )}
        </>
    );
};

export default TermsPopup;
