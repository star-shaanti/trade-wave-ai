import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour</span>
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto h-full">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Terms & Conditions of Use
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Last Updated: August 14, 2025
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Welcome to Real-time Trading Signals!</h2>
                <p>
                  These Terms & Conditions of Use (hereinafter "T&C") govern the access and use of the website realtimetradingsignals.com (hereinafter the "Site") and the signal provision subscription services (hereinafter the "Services") offered by Real-time Trading Signals.
                </p>
                <p className="mt-2">
                  By accessing the Site and using our Services, you acknowledge that you have read, understood, and agree to be bound by all of these T&C. If you do not agree with these terms, you must not use the Site or the Services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Definitions</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>User:</strong> Any individual or legal entity who registers on the Site and/or subscribes to a Subscription.</li>
                  <li><strong>Service:</strong> All services provided by the Site, including access to signals, analysis, and exclusive content.</li>
                  <li><strong>Subscription:</strong> The paid subscription, at a specified rate and for a specified duration, granting access to the Services.</li>
                  <li><strong>Signals:</strong> The information, alerts, or data provided by the Site as part of a Subscription.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 1: Purpose</h3>
                <p>The purpose of these T&C is to define the terms and conditions under which Users may access the Site and subscribe to the Services.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 2: Account Creation</h3>
                <p className="mb-2"><strong>2.1.</strong> Access to the Services requires the creation of a personal account. The User agrees to provide accurate, complete, and up-to-date information.</p>
                <p><strong>2.2.</strong> The User is solely responsible for the confidentiality of their password and for all activities conducted from their account. The User agrees to immediately notify Real-time Trading Signals of any unauthorized use of their account.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 3: Subscriptions</h3>
                <p className="mb-2"><strong>3.1.</strong> Subscription: The Services are accessible through one or more paid Subscriptions, as presented on the Site. Payments are managed by our secure payment service provider, Stripe.</p>
                <p className="mb-2"><strong>3.2.</strong> Automatic Renewal: Unless canceled by the User before the expiration date, all Subscriptions are automatically renewed for a period identical to the one initially subscribed.</p>
                <p className="mb-2"><strong>3.3.</strong> Cancellation: The User may cancel the automatic renewal of their Subscription at any time from their personal account area. The cancellation will take effect at the end of the current Subscription period. Access to the Services will be maintained until that date.</p>
                <p><strong>3.4.</strong> No Refunds: As detailed in Article 4, canceling a Subscription or its early termination does not entitle the User to any refund for the remaining period.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 4: No-Refund Policy</h3>
                <p className="mb-2"><strong>4.1.</strong> Finality of Purchase: The User expressly acknowledges and agrees that any payment made for a Subscription is final.</p>
                <p className="mb-2"><strong>4.2.</strong> <strong>NO REFUNDS:</strong> Due to the digital and immediate nature of the Services provided (instant access to signals and content), Real-time Trading Signals does not issue any refunds, either full or partial, under any circumstances.</p>
                <p><strong>4.3.</strong> This includes, but is not limited to, cases of dissatisfaction, non-use of the Service, cancellation during the billing period, or forgetting to cancel the automatic renewal. By subscribing, you waive any right to claim a refund.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 5: User Obligations</h3>
                <p>The User agrees to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the Services for strictly personal and non-commercial purposes.</li>
                  <li>Not share, resell, copy, or distribute the Signals and content of the Site to third parties.</li>
                  <li>Not use any devices or software intended to disrupt the proper functioning of the Site.</li>
                  <li>Comply with all applicable laws and regulations.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 6: IMPORTANT DISCLAIMER AND LIMITATION OF LIABILITY</h3>
                <p className="mb-2"><strong>6.1.</strong> Nature of Information: The Signals and content provided on the Site are for purely informational and educational purposes. They do not, under any circumstances, constitute investment advice, financial recommendation, solicitation, or an offer to buy or sell any financial product.</p>
                <p className="mb-2"><strong>6.2.</strong> No Guarantee: Real-time Trading Signals does not guarantee the performance, accuracy, or relevance of the Signals in any way. Past performance is not indicative of future results.</p>
                <p className="mb-2"><strong>6.3.</strong> Assumption of Risk: The User is solely and exclusively responsible for their investment or trading decisions and for any financial losses that may result. The use of the Signals is at the User's own risk.</p>
                <p><strong>6.4.</strong> Service Availability: We strive to keep the Site accessible 24/7 but cannot guarantee continuous availability. Access may be interrupted for maintenance or force majeure reasons.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 7: Intellectual Property</h3>
                <p>All elements of the Site (logo, texts, software, signals, design) are the exclusive property of Real-time Trading Signals and are protected by copyright and intellectual property law. Any reproduction, even partial, is strictly prohibited.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 8: Personal Data</h3>
                <p>The collection and processing of Users' personal data are carried out in accordance with our Privacy Policy, accessible on the Site, and in compliance with the General Data Protection Regulation (GDPR).</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 9: Modification of T&C</h3>
                <p>Real-time Trading Signals reserves the right to modify these T&C at any time. Users will be informed of any substantial changes. The applicable version is the one in effect on the Site at the time the Services are used.</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Article 10: Governing Law and Jurisdiction</h3>
                <p>These T&C are subject to international law. In the event of a dispute, and after an attempt at an amicable resolution, exclusive jurisdiction is granted to the competent international courts.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TermsConditions;