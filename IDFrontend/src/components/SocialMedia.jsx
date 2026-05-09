 import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import api from '../api';
 
export default function SocialMedia() {
  const [config, setConfig] = useState({ fb: "", insta: "", twitter: "", linkedIn: "" });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get("/api/confi/GetConfiList");
        if (response.data.success && response.data.result.length > 0) {
          setConfig(response.data.result[0]);
        }
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
      }
    };
    fetchConfig();
  }, []);
  return (
    <section className="py-6 bg-gray-50">
      <div className="container mx-auto px-4 text-center">
                <div className="flex justify-center gap-6 text-gray-600">
          <a
            href={config.fb}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="hover:text-blue-600 transition-colors duration-300"
          >
            {/* Facebook SVG */}
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.408.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.796.143v3.24l-1.918.001c-1.504 0-1.796.715-1.796 1.764v2.313h3.59l-.467 3.622h-3.123V24h6.116c.73 0 1.324-.592 1.324-1.324V1.325C24 .593 23.408 0 22.675 0z" />
            </svg>
          </a>

          <a
            href={config.twitter}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="hover:text-blue-400 transition-colors duration-300"
          >
            {/* Twitter SVG */}
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.954 4.569c-.885.39-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.724-.949.555-2.005.959-3.127 1.184-.897-.959-2.173-1.559-3.591-1.559-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.248-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.734.199-1.523.232-2.224.084.63 1.953 2.445 3.377 4.6 3.417-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.557 2.212 9.054 0 14-7.496 14-13.986 0-.21 0-.423-.015-.633.962-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
            </svg>
          </a>

          <a
            href={config.insta}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-pink-600 transition-colors duration-300"
          >
            {/* Instagram SVG */}
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.345 3.608 1.32.975.975 1.258 2.243 1.32 3.608.058 1.266.07 1.645.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.345 2.633-1.32 3.608-.975.975-2.243 1.258-3.608 1.32-1.266.058-1.645.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.345-3.608-1.32-.975-.975-1.258-2.243-1.32-3.608C2.175 15.584 2.163 15.204 2.163 12s.012-3.584.07-4.85c.062-1.366.345-2.633 1.32-3.608C4.528 2.508 5.795 2.225 7.16 2.163 8.426 2.105 8.805 2.093 12 2.093m0-2.163C8.741 0 8.332.015 7.052.072 5.775.13 4.603.4 3.56 1.442 2.518 2.485 2.248 3.656 2.19 4.933.064 4.93 0 8.72 0 12s.015 7.07.072 8.348c.058 1.277.328 2.449 1.37 3.492 1.042 1.042 2.214 1.312 3.492 1.37 1.28.058 1.689.072 4.948.072s3.669-.015 4.948-.072c1.277-.058 2.449-.328 3.492-1.37 1.042-1.042 1.312-2.214 1.37-3.492.058-1.279.072-1.688.072-4.948s-.015-3.669-.072-4.948c-.058-1.277-.328-2.449-1.37-3.492C19.445.4 18.273.13 17 .072 15.719.015 15.31 0 12 0z" />
              <circle cx="12" cy="12" r="3.6" />
              <circle cx="18.406" cy="5.594" r="1.44" />
            </svg>
          </a>

          <a
            href={config.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="hover:text-blue-700 transition-colors duration-300"
          >
            {/* LinkedIn SVG */}
            <svg
              className="w-8 h-8"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.447 20.452H17.2v-5.569c0-1.328-.023-3.038-1.852-3.038-1.853 0-2.136 1.446-2.136 2.94v5.667H9.019V9h3.112v1.561h.045c.434-.82 1.495-1.682 3.074-1.682 3.287 0 3.892 2.164 3.892 4.978v6.595zM5.337 7.433a1.813 1.813 0 11.002-3.625 1.813 1.813 0 01-.002 3.625zm1.473 13.019H3.863V9h2.947v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.22.792 24 1.771 24h20.451c.978 0 1.778-.78 1.778-1.729V1.729C24 .774 23.203 0 22.225 0z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
