import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: August 14, 2025</p>

          <div className="space-y-8">
            <section>
              <p className="text-lg mb-4">
                Real-time Trading Signals is committed to protecting your privacy and ensuring the security of your personal information.
              </p>
              <p className="mb-4">
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                realtimetradingsignals.com and use our services. Please read this Privacy Policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium mb-3">1.1 Personal Information</h3>
              <p className="mb-4">We may collect personal information that you voluntarily provide to us when you:</p>
              <ul className="space-y-2 list-disc pl-6 mb-4">
                <li>Register for an account</li>
                <li>Subscribe to our services</li>
                <li>Contact us via email or contact forms</li>
                <li>Participate in surveys or promotions</li>
              </ul>
              <p className="mb-4">This information may include:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Name and email address</li>
                <li>Payment information (processed securely through Stripe)</li>
                <li>Communication preferences</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-medium mb-3 mt-6">1.2 Automatic Information</h3>
              <p className="mb-4">When you visit our website, we may automatically collect certain information, including:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>IP address and location data</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Pages visited and time spent on our site</li>
                <li>Referring website addresses</li>
                <li>Device information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect for the following purposes:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>To provide and maintain our services</li>
                <li>To process your subscription and payments</li>
                <li>To send you trading signals and related content</li>
                <li>To communicate with you about your account</li>
                <li>To respond to your inquiries and provide customer support</li>
                <li>To improve our website and services</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
                <li>To send you marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
              <p className="mb-4">We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:</p>
              
              <h3 className="text-xl font-medium mb-3">3.1 Service Providers</h3>
              <p className="mb-4">We may share your information with trusted third-party service providers who assist us in:</p>
              <ul className="space-y-2 list-disc pl-6 mb-4">
                <li>Payment processing (Stripe)</li>
                <li>Email delivery services</li>
                <li>Website hosting and maintenance</li>
                <li>Analytics and website optimization</li>
              </ul>

              <h3 className="text-xl font-medium mb-3">3.2 Legal Requirements</h3>
              <p className="mb-4">We may disclose your information if required to do so by law or in response to:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Valid legal requests</li>
                <li>Court orders or government investigations</li>
                <li>Protection of our rights and safety</li>
                <li>Prevention of fraud or illegal activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="space-y-2 list-disc pl-6">
                <li>Encryption of sensitive data</li>
                <li>Secure payment processing through Stripe</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Secure data storage and transmission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Your Rights (GDPR)</h2>
              <p className="mb-4">If you are located in the European Union, you have the following rights regarding your personal data:</p>
              <ul className="space-y-2 list-disc pl-6">
                <li><strong>Access:</strong> Request access to your personal data</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Request transfer of your data</li>
                <li><strong>Restriction:</strong> Request limitation of processing</li>
                <li><strong>Objection:</strong> Object to processing of your data</li>
                <li><strong>Withdraw consent:</strong> Withdraw consent at any time</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at <a href="mailto:realtimetradingsignal@gmail.com" className="text-brand hover:underline">realtimetradingsignal@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience on our website. Cookies are small 
                files stored on your device that help us:
              </p>
              <ul className="space-y-2 list-disc pl-6 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze website usage and performance</li>
                <li>Provide personalized content</li>
                <li>Ensure website security</li>
              </ul>
              <p>You can control cookie settings through your browser preferences.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
                Privacy Policy, comply with legal obligations, resolve disputes, and enforce our agreements. When we no longer 
                need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or 
                content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal 
                information from children under 18. If we become aware that we have collected such information, we will 
                take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. 
                We will notify you of any material changes by posting the updated policy on our website and updating the 
                "Last Updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-muted/20 p-4 rounded-lg">
                <p><strong>Email:</strong> <a href="mailto:realtimetradingsignal@gmail.com" className="text-brand hover:underline">realtimetradingsignal@gmail.com</a></p>
                <p><strong>Website:</strong> realtimetradingsignals.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;