import Footer from "@/components/Footer";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getAnalytics, logEvent } from "firebase/analytics";
import { Button } from "@/components/ui/button";

const PrivacyPolicy = () => {
  const router = useRouter();

  useEffect(() => {
    logEvent(getAnalytics(), "page_view", {
      page_path: "/privacy-policy",
      page_title: "privacy-policy",
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
            </svg>{" "}
            Back
          </Button>
          <h1 className="text-3xl font-extrabold pb-6 mt-10">
            Privacy Policy for FaviFont
          </h1>
          <p className="italic mb-2">Effective Date: December 27, 2024</p>
          <p className="mb-2">At FaviFont, your privacy is a priority. This Privacy Policy explains how we collect, use, and protect your information.</p>
          <h3 className="text-lg font-bold mb-4">Information We Collect</h3>
          <p className="mb-2">We collect the following personal information from you when you use our services:</p>
          <ul className="mb-2 flex flex-col gap-2 pl-2">
            <div className="flex items-center gap-2"><span className="text-2xl">•</span><li>Name</li></div>
            <div className="flex items-center gap-2"><span className="text-2xl">•</span><li>Email address</li></div>
            <div className="flex items-center gap-2"><span className="text-2xl">•</span><li>Payment information</li></div>
            <div className="flex items-center gap-2"><span className="text-2xl">•</span><li>We also collect non-personal data through the use of web cookies to enhance your browsing experience.</li></div>
          </ul>
          <h3 className="text-lg font-bold mb-4">Purpose of Data Collection</h3>
          <p className="mb-2">We collect your personal information to process orders, enhance the functionality of our tool, and send occasional marketing emails.</p>
          <h3 className="text-lg font-bold mb-4">Data Sharing</h3>
          <p className="mb-2">We do not share your personal data with any third parties.</p>
          <h3 className="text-lg font-bold mb-4">Children&apos;s Privacy</h3>
          <p className="mb-2">Our services are not directed toward children, and we do not knowingly collect any information from children under the age of 13.</p>
          <h3 className="text-lg font-bold mb-4">Updates to This Policy</h3>
          <p className="mb-2">We may update this Privacy Policy from time to time. When we do, we will notify you via the email address you have provided.</p>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <p className="mb-2">If you have any questions or concerns about this Privacy Policy, please contact us via email at: <a href="mailto:workwithjacksontaylor@gmail.com" className="underline text-blue-500">workwithjacksontaylor@gmail.com</a></p>
          <p>By using FaviFont, you agree to the collection and use of your information as outlined in this Privacy Policy.</p>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
