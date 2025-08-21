import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Info, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TradingRisks = () => {
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
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <h1 className="text-4xl font-bold">Trading Risks Disclosure</h1>
          </div>
          
          <p className="text-muted-foreground mb-8">Last Updated: August 14, 2025</p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-red-500 mb-2">Important Risk Warning</h2>
                <p className="text-red-400">
                  Trading in financial markets involves substantial risk of loss and is not suitable for all investors. 
                  You can lose some or all of your invested capital. Please ensure that you fully understand the risks involved.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. General Trading Risks</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Market Risk</h3>
                  <p className="text-muted-foreground">
                    Financial markets are inherently volatile and unpredictable. Prices can move rapidly in either direction, 
                    potentially resulting in significant losses.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Leverage Risk</h3>
                  <p className="text-muted-foreground">
                    Trading with leverage can amplify both profits and losses. Small market movements can result in 
                    substantial losses that exceed your initial investment.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Liquidity Risk</h3>
                  <p className="text-muted-foreground">
                    Some markets may have low liquidity, making it difficult to enter or exit positions at desired prices, 
                    especially during volatile periods.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Gap Risk</h3>
                  <p className="text-muted-foreground">
                    Markets can gap between trading sessions, potentially causing stop losses to be executed at unfavorable prices 
                    or positions to be closed at significant losses.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Specific Market Risks</h2>
              
              <div className="space-y-6">
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-3">Forex Trading Risks</h3>
                  <ul className="space-y-2 list-disc pl-6 text-muted-foreground">
                    <li>Currency pairs can be highly volatile, especially during major economic events</li>
                    <li>Political and economic factors can cause sudden currency movements</li>
                    <li>Interest rate changes can significantly impact currency values</li>
                    <li>OTC markets may have wider spreads and less regulation</li>
                  </ul>
                </div>
                
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-3">Cryptocurrency Trading Risks</h3>
                  <ul className="space-y-2 list-disc pl-6 text-muted-foreground">
                    <li>Extreme volatility with prices that can change dramatically in minutes</li>
                    <li>Regulatory uncertainty and potential government interventions</li>
                    <li>Security risks including hacking and theft</li>
                    <li>Limited historical data for analysis</li>
                    <li>24/7 trading can lead to unexpected price movements</li>
                  </ul>
                </div>
                
                <div className="p-6 border border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-3">Indices Trading Risks</h3>
                  <ul className="space-y-2 list-disc pl-6 text-muted-foreground">
                    <li>Market hours limitations and overnight gaps</li>
                    <li>Economic data releases can cause significant volatility</li>
                    <li>Company earnings and news can impact entire sectors</li>
                    <li>Geopolitical events can affect global markets</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Signal Service Risks</h2>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="h-6 w-6 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-yellow-500 mb-2">Signal Limitations</h3>
                    <p className="text-yellow-400">
                      While our signals are generated using advanced AI and professional analysis, they are not guaranteed to be profitable. 
                      Past performance does not indicate future results.
                    </p>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3 list-disc pl-6 text-muted-foreground">
                <li>Market conditions can change rapidly, making signals outdated</li>
                <li>Execution delays can result in different entry/exit prices</li>
                <li>Technical issues may prevent timely signal delivery</li>
                <li>Individual trading decisions should always include personal risk assessment</li>
                <li>Signals should be used as part of a comprehensive trading strategy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Risk Management Recommendations</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Position Sizing</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Never risk more than 1-2% of your trading capital on any single trade. 
                    This helps protect your account from significant losses.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Stop Losses</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Always use stop losses to limit potential losses. Set them at levels that make sense for your risk tolerance.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Diversification</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Don't put all your capital in one market or asset. Spread your risk across different instruments.
                  </p>
                </div>
                
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">Education</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Continuously educate yourself about trading and risk management before risking real money.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Legal and Regulatory Considerations</h2>
              
              <div className="p-6 border border-border rounded-lg">
                <ul className="space-y-3 list-disc pl-6 text-muted-foreground">
                  <li>Trading regulations vary by jurisdiction - ensure compliance with local laws</li>
                  <li>Tax implications of trading profits and losses should be understood</li>
                  <li>Some jurisdictions may restrict or prohibit certain types of trading</li>
                  <li>Broker regulations and protections vary by country</li>
                  <li>Consider consulting with financial and legal professionals</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Suitability Assessment</h2>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-blue-500 mb-2">Before You Start Trading</h3>
                    <p className="text-blue-400 mb-4">
                      Consider whether trading is suitable for you based on your:
                    </p>
                    <ul className="space-y-2 list-disc pl-6 text-blue-400">
                      <li>Financial situation and investment objectives</li>
                      <li>Risk tolerance and ability to withstand losses</li>
                      <li>Trading experience and knowledge</li>
                      <li>Time available for market monitoring</li>
                      <li>Access to necessary capital</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                <div>
                  <h2 className="text-xl font-semibold text-red-500 mb-2">Final Warning</h2>
                  <p className="text-red-400">
                    By using our trading signals service, you acknowledge that you understand and accept these risks. 
                    We strongly recommend that you only trade with capital you can afford to lose and that you seek 
                    professional financial advice if you are unsure about any aspect of trading.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-muted rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">Need Help Understanding Risks?</h2>
              <p className="mb-4">
                If you have questions about trading risks or need clarification on any points, 
                our support team is here to help.
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
    </div>
  );
};

export default TradingRisks;
