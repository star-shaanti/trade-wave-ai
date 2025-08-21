import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
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
          <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mb-8">Find answers to the most common questions about our trading signals service.</p>

          <Accordion type="single" collapsible className="w-full space-y-4">
            
            <AccordionItem value="item-1" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                What are Real-time Trading Signals?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Real-time Trading Signals are AI-powered buy/sell recommendations for Forex, Crypto, and Indices markets. 
                  Our system analyzes market data 24/7 and provides instant alerts when profitable trading opportunities are detected.
                </p>
                <p>
                  Each signal includes entry price, stop loss, take profit levels, and market analysis to help you make informed trading decisions.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                How accurate are your trading signals?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Our signals are generated using advanced AI algorithms and professional trading strategies. 
                  While we strive for high accuracy, no trading system can guarantee 100% success.
                </p>
                <p>
                  We recommend using proper risk management and never investing more than you can afford to lose. 
                  Past performance does not guarantee future results.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                What markets do you cover?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <ul className="space-y-2">
                  <li><strong>Forex:</strong> Major and minor currency pairs, including OTC markets</li>
                  <li><strong>Crypto:</strong> Bitcoin, Ethereum, and other major cryptocurrencies</li>
                  <li><strong>Indices:</strong> S&P 500, NASDAQ, DOW JONES, FTSE 100, DAX, CAC 40, and more</li>
                </ul>
                <p className="mt-4">
                  Our signals are available 24/7 for crypto and OTC forex, while indices follow their respective market hours.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                How do I receive the signals?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Once you subscribe to our service, you can access signals through:
                </p>
                <ul className="space-y-2 list-disc pl-6">
                  <li>Our web platform in real-time</li>
                  <li>Email notifications (optional)</li>
                  <li>Mobile-responsive interface</li>
                </ul>
                <p className="mt-4">
                  Premium subscribers get priority access to signals and additional features.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                What subscription plans are available?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  We offer flexible subscription options:
                </p>
                <ul className="space-y-2 list-disc pl-6">
                  <li><strong>Free Plan:</strong> Limited access to basic signals</li>
                  <li><strong>Premium Plan:</strong> Full access to all signals and features</li>
                  <li><strong>Enterprise:</strong> Custom solutions for professional traders</li>
                </ul>
                <p className="mt-4">
                  All plans include real-time signals, market analysis, and customer support.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Can I cancel my subscription anytime?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Yes, you can cancel your subscription at any time through your account settings. 
                  Your access will continue until the end of your current billing period.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Do you provide customer support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Yes, we provide comprehensive customer support:
                </p>
                <ul className="space-y-2 list-disc pl-6">
                  <li>Email support: realtimetradingsignal@gmail.com</li>
                  <li>24/7 technical assistance</li>
                  <li>Account management help</li>
                  <li>Trading guidance and education</li>
                </ul>
                <p className="mt-4">
                  Premium subscribers receive priority support and faster response times.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Is my personal information secure?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Absolutely. We take data security seriously and implement industry-standard security measures:
                </p>
                <ul className="space-y-2 list-disc pl-6">
                  <li>SSL encryption for all data transmission</li>
                  <li>Secure payment processing through Stripe</li>
                  <li>Regular security audits and updates</li>
                  <li>Strict privacy policies and data protection</li>
                </ul>
                <p className="mt-4">
                  We never share your personal information with third parties without your consent.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-9" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Can I use these signals with any broker?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Our signals are compatible with most major brokers and trading platforms. 
                  We provide universal signal formats that work with:
                </p>
                <ul className="space-y-2 list-disc pl-6">
                  <li>MetaTrader 4/5</li>
                  <li>cTrader</li>
                  <li>Most crypto exchanges</li>
                  <li>Traditional stock brokers</li>
                </ul>
                <p className="mt-4">
                  We recommend choosing a regulated broker with competitive spreads and reliable execution.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-10" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                Do you offer educational resources?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                <p className="mb-4">
                  Yes, we provide comprehensive educational resources to help you become a better trader:
                </p>
                <ul className="space-y-2 list-disc pl-6">
                  <li>Trading guides and tutorials</li>
                  <li>Risk management strategies</li>
                  <li>Market analysis education</li>
                  <li>Webinars and live sessions</li>
                  <li>Trading psychology tips</li>
                </ul>
                <p className="mt-4">
                  Premium subscribers get access to exclusive educational content and personalized guidance.
                </p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Still have questions?</h2>
            <p className="mb-4">
              If you couldn't find the answer you're looking for, our support team is here to help.
            </p>
            <Button 
              onClick={() => window.location.href = 'mailto:realtimetradingsignal@gmail.com'}
              className="bg-primary hover:bg-primary/90"
            >
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
