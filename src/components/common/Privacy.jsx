import React from 'react';

function Privacy({ handleTermsClick }) {
  return (
    <div className="privacy">
      <div
        className="close-privacy-button"
        onClick={() => handleTermsClick('close-privacy')}
      >
        CLOSE X
      </div>

      <div className="privacy-inner-container">
        <h1>PRIVACY POLICY</h1>
        <h2>www.HomeSurge.AI</h2>
        <p>Effective date: May 25, 2023</p>
        
        <ol type="1">
          <li>
            <p>
              Welcome to www.HomeSurge.AI (the "Site") which is owned by
              Nomad Creative LLC ("HomeSurge.AI", "we", "us" and "our")
              and operated from the United States. This privacy policy has been
              compiled to better serve those who are concerned with how their
              'Personally Identifiable Information' (PII) is being used online.
              PII, as described in US privacy law and information security, is
              information that can be used on its own or with other information
              to identify, contact, or locate a single person, or to identify an
              individual in context. Please read our privacy policy carefully to
              get a clear understanding of how we collect, use, protect, or
              otherwise handle your PII in accordance with our website.
            </p>
          </li>

          <li>
            <h2>Collection of Personal and Non-Personal Information (PII and Non-PII)</h2>
            <p>
              We collect and store certain personally identifiable information
              about you (i.e., information which may identify you in some way;
              such as your name, telephone number, email address, screen name)
              ("PII") only when you voluntarily submit it. We may request that
              you submit PII in certain instances, such as when you use the
              services offered by us, submit comments or questions, request
              information, participate in a promotion, contest or sweepstakes or
              utilize other features or functions of our site. When you connect
              to our Site, there is certain technical, non-personally
              identifiable information which does not identify any individual
              ("Non-PII") that may be collected and stored through the use of
              "cookie" technology and IP addresses. PII is not extracted in this
              process. Non-PII may include, but is not limited to, your IP host
              address, internet browser type, personal computer settings, and
              the number, duration, and character of page visits. This
              information assists us to update our site so that it remains
              interesting to our visitors and contains content that is tailored
              to visitors' interests.
            </p>
          </li>

          <li>
            <h2>Use of Your PII</h2>
            <p>
              When you provide your PII at our Site, we will limit the use of
              the PII for the purpose for which it was collected in accordance
              with the terms of this Privacy Policy. Other limited uses of your
              PII may include:
            </p>
            <ul type="circle">
              <li>
                To respond to your questions, comments, and requests; to provide
                you with access to certain areas and features on our Site; and
                to communicate with you about your activities on our site.
              </li>
              <li>
                To investigate suspected fraud, harassment, physical threats, or
                other violations of any law, rule or regulation, the rules or
                policies of our Site, or the rights of third parties; or to
                investigate any suspected conduct which we deem improper.
              </li>
              <li>
                To help us develop, deliver and improve our services, content
                and advertising.
              </li>
              <li>
                To share with our parent, subsidiary, and affiliated companies,
                and promotional partners involved in creating, producing,
                delivering, or maintaining our Site, as required to perform
                functions on our behalf in connection with the Site.
              </li>
              <li>
                To share with third party service providers whom we employ to
                perform functions on our behalf in connection with the Site.
              </li>
              <li>
                For our internal purposes such as auditing, data analysis, and
                research to improve our products, services and customer
                communications.
              </li>
              <li>
                For other purposes as disclosed when your PII is collected or in
                any additional terms and conditions applicable to a particular
                feature of our site.
              </li>
              <li>
                For disclosures required by law, regulation, or court order.
              </li>
            </ul>
            <p>
              Except as provided for herein, we will not provide any of your PII
              to any third parties without your specific consent.
            </p>
          </li>

          {/* Additional privacy policy sections would go here */}
          {/* This is a simplified version - in a real implementation, you'd include all sections */}
          
          <li>
            <h2>Contacting us</h2>
            <p>
              If you have any questions about this Privacy Policy, the practices
              of this site, or your dealings with this site, please contact us
              at: contact@HomeSurge.ai
            </p>
          </li>

          <li>
            <h2>Nomad Creative LLC</h2>
            <p>Email: contact@HomeSurge.ai</p>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default Privacy;