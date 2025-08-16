import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl py-12">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms & Conditions of Use</h1>
          <p className="text-muted-foreground mb-8">Last Updated: August 14, 2025</p>

          <div className="space-y-8">
            <section>
              <p className="text-lg mb-4">Welcome to Real-time Trading Signals!</p>
              <p className="mb-4">
                These Terms & Conditions of Use (hereinafter "T&C") govern the access and use of the website 
                realtimetradingsignals.com (hereinafter the "Site") and the signal provision subscription services 
                (hereinafter the "Services") offered by Real-time Trading Signals.
              </p>
              <p className="mb-4">
                By accessing the Site and using our Services, you acknowledge that you have read, understood, 
                and agree to be bound by all of these T&C. If you do not agree with these terms, you must not 
                use the Site or the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Definitions</h2>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>User:</strong> Any individual or legal entity who registers on the Site and/or subscribes to a Subscription.</li>
                <li><strong>Service:</strong> All services provided by the Site, including access to signals, analysis, and exclusive content.</li>
                <li><strong>Subscription:</strong> The paid subscription, at a specified rate and for a specified duration, granting access to the Services.</li>
                <li><strong>Signals:</strong> The information, alerts, or data provided by the Site as part of a Subscription.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 1: Purpose</h2>
              <p>
                The purpose of these T&C is to define the terms and conditions under which Users may access 
                the Site and subscribe to the Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 2: Account Creation</h2>
              <p className="mb-4">
                <strong>2.1.</strong> Access to the Services requires the creation of a personal account. The User agrees 
                to provide accurate, complete, and up-to-date information.
              </p>
              <p>
                <strong>2.2.</strong> The User is solely responsible for the confidentiality of their password and for all 
                activities conducted from their account. The User agrees to immediately notify Real-time Trading Signals 
                of any unauthorized use of their account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 3: Subscriptions</h2>
              <p className="mb-4">
                <strong>3.1. Subscription:</strong> The Services are accessible through one or more paid Subscriptions, 
                as presented on the Site. Payments are managed by our secure payment service provider, Stripe.
              </p>
              <p className="mb-4">
                <strong>3.2. Automatic Renewal:</strong> Unless canceled by the User before the expiration date, all 
                Subscriptions are automatically renewed for a period identical to the one initially subscribed.
              </p>
              <p className="mb-4">
                <strong>3.3. Cancellation:</strong> The User may cancel the automatic renewal of their Subscription at 
                any time from their personal account area. The cancellation will take effect at the end of the current 
                Subscription period. Access to the Services will be maintained until that date.
              </p>
              <p>
                <strong>3.4. No Refunds:</strong> As detailed in Article 4, canceling a Subscription or its early 
                termination does not entitle the User to any refund for the remaining period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 4: No-Refund Policy</h2>
              <p className="mb-4">
                <strong>4.1. Finality of Purchase:</strong> The User expressly acknowledges and agrees that any payment 
                made for a Subscription is final.
              </p>
              <p className="mb-4">
                <strong>4.2. NO REFUNDS:</strong> Due to the digital and immediate nature of the Services provided 
                (instant access to signals and content), Real-time Trading Signals does not issue any refunds, either 
                full or partial, under any circumstances.
              </p>
              <p>
                <strong>4.3.</strong> This includes, but is not limited to, cases of dissatisfaction, non-use of the 
                Service, cancellation during the billing period, or forgetting to cancel the automatic renewal. By 
                subscribing, you waive any right to claim a refund.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 5: User Obligations</h2>
              <p className="mb-2">The User agrees to:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Use the Services for strictly personal and non-commercial purposes.</li>
                <li>Not share, resell, copy, or distribute the Signals and content of the Site to third parties.</li>
                <li>Not use any devices or software intended to disrupt the proper functioning of the Site.</li>
                <li>Comply with all applicable laws and regulations.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 6: IMPORTANT DISCLAIMER AND LIMITATION OF LIABILITY</h2>
              <p className="mb-4">
                <strong>6.1. Nature of Information:</strong> The Signals and content provided on the Site are for 
                purely informational and educational purposes. They do not, under any circumstances, constitute 
                investment advice, financial recommendation, solicitation, or an offer to buy or sell any financial product.
              </p>
              <p className="mb-4">
                <strong>6.2. No Guarantee:</strong> Real-time Trading Signals does not guarantee the performance, 
                accuracy, or relevance of the Signals in any way. Past performance is not indicative of future results.
              </p>
              <p className="mb-4">
                <strong>6.3. Assumption of Risk:</strong> The User is solely and exclusively responsible for their 
                investment or trading decisions and for any financial losses that may result. The use of the Signals 
                is at the User's own risk.
              </p>
              <p>
                <strong>6.4. Service Availability:</strong> We strive to keep the Site accessible 24/7 but cannot 
                guarantee continuous availability. Access may be interrupted for maintenance or force majeure reasons.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 7: Intellectual Property</h2>
              <p>
                All elements of the Site (logo, texts, software, signals, design) are the exclusive property of 
                Real-time Trading Signals and are protected by copyright and intellectual property law. Any reproduction, 
                even partial, is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 8: Personal Data</h2>
              <p>
                The collection and processing of Users' personal data are carried out in accordance with our Privacy 
                Policy, accessible on the Site, and in compliance with the General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 9: Modification of T&C</h2>
              <p>
                Real-time Trading Signals reserves the right to modify these T&C at any time. Users will be informed 
                of any substantial changes. The applicable version is the one in effect on the Site at the time the 
                Services are used.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Article 10: Governing Law and Jurisdiction</h2>
              <p>
                These T&C are subject to the laws of France. In the event of a dispute, and after an attempt at an 
                amicable resolution, exclusive jurisdiction is granted to the competent courts of Paris.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;