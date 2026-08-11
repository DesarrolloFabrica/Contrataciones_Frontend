import React from "react";

import campusImage from "../../assets/images/cun-campus-login.jpg";

const LoginBackground: React.FC = () => {
  return (
    <div className="login-scene pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="login-scene__base absolute inset-0" />

      <img
        src={campusImage}
        alt=""
        className="login-scene__campus absolute inset-x-0 bottom-0 h-full w-full object-cover object-left-bottom"
      />
      <div className="login-scene__campus-tint absolute inset-0" />

      <svg
        className="login-scene__ribbons absolute inset-0 h-full w-full"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
      >
        <path
          className="login-ribbon login-ribbon--wide"
          d="M603 -110C498 76 567 201 691 328c106 109 147 214 66 350-53 89-127 151-180 252"
        />
        <path
          className="login-ribbon login-ribbon--middle"
          d="M754 -102C614 52 629 195 746 301c120 109 180 224 107 374-43 89-120 163-169 257"
        />
        <path
          className="login-ribbon login-ribbon--line"
          d="M833 -80C683 66 691 205 796 302c132 121 203 236 140 387-39 93-111 169-159 248"
        />
      </svg>

      <div className="login-scene__orb login-scene__orb--one absolute rounded-full" />
      <div className="login-scene__orb login-scene__orb--two absolute rounded-full" />

      <div className="login-scene__rings absolute left-[3.5%] top-[13%] h-44 w-44 rounded-full sm:h-56 sm:w-56">
        <span className="absolute inset-0 rounded-full border" />
        <span className="absolute inset-[14%] rounded-full border" />
        <span className="login-scene__spark absolute right-[11%] top-[9%] h-1.5 w-1.5 rounded-full" />
      </div>

      <div className="login-scene__dots absolute left-[2.5%] top-[39%] hidden h-24 w-24 sm:block" />

      <svg
        className="login-scene__orbit absolute -bottom-[12%] -left-[8%] hidden h-[54%] w-[62%] lg:block"
        viewBox="0 0 900 460"
        preserveAspectRatio="none"
      >
        <path d="M-20 380C171 175 394 516 714 203c61-59 104-116 168-160" />
        <path d="M-40 428C192 224 391 536 747 236c54-45 91-93 138-139" />
        <circle cx="708" cy="208" r="4" />
        <circle cx="515" cy="351" r="3" />
        <circle cx="252" cy="318" r="3" />
      </svg>

      <div className="login-scene__bottom absolute inset-x-0 bottom-0 h-[12vh] min-h-[72px]">
        <svg className="h-full w-full" viewBox="0 0 1600 160" preserveAspectRatio="none">
          <path
            className="login-wave login-wave--back"
            d="M0 84c265-70 483 31 779 43 306 12 517-80 821-74v107H0Z"
          />
          <path
            className="login-wave login-wave--front"
            d="M0 121c277-87 527 13 842 25 293 11 501-56 758-47v61H0Z"
          />
        </svg>
      </div>

      <div className="login-scene__vignette absolute inset-0" />
    </div>
  );
};

export default LoginBackground;
