import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getAnalytics, logEvent } from "firebase/analytics";
import { useRouter } from "next/router";
import { useEffect } from "react";

const TOS = () => {
  const router = useRouter();

  useEffect(() => {
    logEvent(getAnalytics(), "page_view", {
      page_path: "/tos",
      page_title: "Terms of Service",
      page_location: window.location.href,
    });
  }, []);

  return (
    <>
      <main className="min-h-screen pb-40">
        <div className="p-5 max-w-xl mx-auto">
          <Button onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </Button>
          <h1 className="text-3xl font-extrabold pb-6 mt-4  ">Terms of Service</h1>
          <p className="italic mb-2">Effective Date: December 27, 2024</p>
          <p className="mb-2">Welcome to FaviFont, a tool for designers and developers to quickly test and compare fonts. By accessing or using the Website, you agree to comply with and be bound by these Terms of Service. If you do not agree with these Terms, please do not use the Website.</p>
          <h3 className="text-lg font-bold mb-4">Ownership and Use of Fonts</h3>
          <p className="mb-2">All fonts available on FaviFont are sourced from Google Fonts and are in the public domain. Users may utilize these fonts in accordance with Google Fonts’ licensing terms.</p>
          <h3 className="text-lg font-bold mb-4">User Data Collection</h3>
          <p className="mb-2">FaviFont collects the following user data:</p>
          <ul className="list-disc ml-5 mb-2">
            <li>Name</li>
            <li>Email address</li>
            <li>Payment information</li>
          </ul>
          <p className="mb-2">By providing your email address, you agree to receive transactional and promotional communications from FaviFont. You may opt out of marketing emails at any time by using the unsubscribe link included in the emails. For details on how this data is used and protected, please refer to our <a href="/privacy-policy" className="underline text-blue-500">Privacy Policy</a>.</p>
          <h3 className="text-lg font-bold mb-4">Non-Personal Data Collection</h3>
          <p className="mb-2">FaviFont uses web cookies to enhance your experience. By using the Website, you consent to our use of cookies.</p>
          <h3 className="text-lg font-bold mb-4">Payment Terms</h3>
          <p className="mb-2">Any payments made on FaviFont are processed securely. By providing payment information, you agree to pay for any services or features you purchase through the Website.</p>
          <h3 className="text-lg font-bold mb-4">Updates to These Terms</h3>
          <p className="mb-2">FaviFont reserves the right to update these Terms at any time. In the event of a significant change, users will be notified via email. The updated Terms will also be posted on this page with the effective date.</p>
          <h3 className="text-lg font-bold mb-4">Governing Law</h3>
          <p className="mb-2">These Terms are governed by the laws of the United States. Any disputes arising under or related to these Terms will be resolved in accordance with U.S. law.</p>
          <h3 className="text-lg font-bold mb-4">Contact Information</h3>
          <p className="mb-2">If you have any questions about these Terms, please contact us at <a href="mailto:workwithjacksontaylor@gmail.com" className="underline text-blue-500">workwithjacksontaylor@gmail.com</a>.</p>
          <p>By using FaviFont, you acknowledge that you have read, understood, and agree to these Terms of Service.</p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default TOS;
