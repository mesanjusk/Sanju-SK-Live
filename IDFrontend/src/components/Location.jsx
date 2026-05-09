import React from "react";

export default function Location() {
  return (
    <div className="bg-white mt-10 p-4 shadow-md rounded-md">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Our Location
      </h2>
      <div className="w-full h-[400px] rounded-md overflow-hidden">
        <iframe
          title="Our Business Location"
          src="https://www.google.com/maps/embed?pb=!1m2!2m1!1s0x3a2bcd9acb08d5ff:0x3ae808f1ce8bc66c!2sSBS%20Digital%20Design%20Gondia!5e0!3m2!1sen!2sin!4v1715149017502!5m2!1sen!2sin"
          width="100%"
          height="100%"
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}
