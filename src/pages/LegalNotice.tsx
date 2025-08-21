import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Building, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LegalNotice = () => {
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
          <div className="flex items-center gap-3 mb-8">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Legal Notice</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">Last Updated: August 14, 2025</p>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Company Information</h2>
              
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Building className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-medium">Business Details</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Service Name:</strong> Real-time Trading Signals</p>
                    <p><strong>Website:</strong> realtimetradingsignals.com</p>
                    <p><strong>Email:</strong> realtimetradingsignal@gmail.com</p>
                    <p><strong>Service Type:</strong> Financial Information & Trading Signals</p>
                  </div>
                </div>
                
                <div className="p-6 border border-border rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-medium">Regulatory Status</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p>This service provides educational and informational content related to financial markets.</p>
                    <p>We are not a regulated financial advisor or broker-dealer.</p>
                    <p>Users are responsible for their own trading decisions and compliance with local regulations.</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  Real-time Trading Signals provides AI-powered trading signals and market analysis for educational and informational purposes. 
                  Our service includes:
                </p>
                <ul className="space-y-2 list-disc pl-6 text-muted-foreground">
                  <li>Real-time buy/sell signals for Forex, Crypto, and Indices markets</li>
                  <li>Market analysis and educational content</li>
                  <li>Technical analysis tools and indicators</li>
                  <li>Risk management guidance</li>
                  <li>Customer support and educational resources</li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  <strong>Important:</strong> Our signals are for educational purposes only and should not be considered as financial advice.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Disclaimers</h2>
              
              <div className="space-y-6">
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-3">No Financial Advice</h3>
                  <p className="text-muted-foreground mb-4">
                    The information provided through our service is for educational and informational purposes only. 
                    We do not provide financial advice, investment recommendations, or trading advice.
                  </p>
                  <p className="text-muted-foreground">
                    Users should conduct their own research and consult with qualified financial professionals before making any investment decisions.
                  </p>
                </div>
                
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-3">No Guarantee of Results</h3>
                  <p className="text-muted-foreground mb-4">
                    Past performance does not guarantee future results. Trading in financial markets involves substantial risk of loss.
                  </p>
                  <p className="text-muted-foreground">
                    We do not guarantee the accuracy, completeness, or timeliness of any information provided through our service.
                  </p>
                </div>
                
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-3">Market Risk Disclosure</h3>
                  <p className="text-muted-foreground mb-4">
                    Financial markets are inherently risky and volatile. Users can lose some or all of their invested capital.
                  </p>
                  <p className="text-muted-foreground">
                    We strongly recommend that users only trade with capital they can afford to lose and implement proper risk management strategies.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. User Responsibilities</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  By using our service, users acknowledge and agree to the following responsibilities:
                </p>
                <ul className="space-y-3 list-disc pl-6 text-muted-foreground">
                  <li>Conducting their own research and analysis before making trading decisions</li>
                  <li>Understanding the risks involved in financial trading</li>
                  <li>Complying with all applicable laws and regulations in their jurisdiction</li>
                  <li>Using proper risk management techniques</li>
                  <li>Not relying solely on our signals for trading decisions</li>
                  <li>Maintaining the security of their account credentials</li>
                  <li>Reporting any suspicious activity or technical issues</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  All content, including but not limited to text, graphics, logos, software, and trading signals, 
                  is the property of Real-time Trading Signals and is protected by copyright and other intellectual property laws.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Users may not reproduce, distribute, or create derivative works from our content without express written permission.
                </p>
                <p className="text-muted-foreground">
                  Unauthorized use of our content may result in legal action.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Limitation of Liability</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  To the maximum extent permitted by law, Real-time Trading Signals shall not be liable for any direct, 
                  indirect, incidental, special, consequential, or punitive damages arising from:
                </p>
                <ul className="space-y-2 list-disc pl-6 text-muted-foreground mb-4">
                  <li>Use of our trading signals or services</li>
                  <li>Trading losses or missed opportunities</li>
                  <li>Technical issues or service interruptions</li>
                  <li>Inaccuracies in market data or analysis</li>
                  <li>Delays in signal delivery</li>
                  <li>Any other damages related to our service</li>
                </ul>
                <p className="text-muted-foreground">
                  Our total liability shall not exceed the amount paid by the user for our services in the 12 months preceding the claim.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Service Availability</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  We strive to provide continuous service availability, but we do not guarantee uninterrupted access to our platform.
                </p>
                <p className="mb-4 text-muted-foreground">
                  Service may be temporarily unavailable due to:
                </p>
                <ul className="space-y-2 list-disc pl-6 text-muted-foreground mb-4">
                  <li>Scheduled maintenance and updates</li>
                  <li>Technical issues or system failures</li>
                  <li>Network connectivity problems</li>
                  <li>Force majeure events</li>
                </ul>
                <p className="text-muted-foreground">
                  We will make reasonable efforts to notify users of planned maintenance and restore service as quickly as possible.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data and Privacy</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  We collect and process user data in accordance with our Privacy Policy. By using our service, 
                  users consent to the collection and use of their information as described in our Privacy Policy.
                </p>
                <p className="text-muted-foreground">
                  We implement appropriate security measures to protect user data, but we cannot guarantee absolute security 
                  against unauthorized access or data breaches.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Governing Law and Jurisdiction</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  This Legal Notice and any disputes arising from the use of our service shall be governed by and construed 
                  in accordance with applicable laws.
                </p>
                <p className="text-muted-foreground">
                  Users agree to submit to the exclusive jurisdiction of the courts in the applicable jurisdiction 
                  for the resolution of any disputes.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to Legal Notice</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <p className="mb-4 text-muted-foreground">
                  We reserve the right to modify this Legal Notice at any time. Changes will be effective immediately 
                  upon posting on our website.
                </p>
                <p className="text-muted-foreground">
                  Users are responsible for regularly reviewing this Legal Notice. Continued use of our service 
                  after changes constitutes acceptance of the modified terms.
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-semibold">Contact Information</h2>
              </div>
              <p className="mb-4 text-muted-foreground">
                If you have any questions about this Legal Notice or need clarification on any legal matters, 
                please contact us:
              </p>
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> realtimetradingsignal@gmail.com</p>
                <p><strong>Website:</strong> realtimetradingsignals.com</p>
              </div>
              <Button 
                onClick={() => window.location.href = 'mailto:realtimetradingsignal@gmail.com'}
                className="mt-4 bg-primary hover:bg-primary/90"
              >
                Contact Legal Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalNotice;
