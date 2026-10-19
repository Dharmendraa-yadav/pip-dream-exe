function SkullBabyAvatar({ expression = "sleepy" }) {
  const isSleepy = expression === "sleepy";
  const isDelighted = expression === "delighted" || expression === "excited";

  return (
    <svg
      className="pip-skull-avatar"
      viewBox="0 0 260 300"
      role="img"
      aria-label="Pip, the skull-faced baby Junior Dream Engineer wearing a dusty-pink bonnet"
    >
      <defs>
        <linearGradient id="pip-bonnet-gradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#f4c4d5" />
          <stop offset="100%" stopColor="#b86f91" />
        </linearGradient>
        <linearGradient id="pip-onesie-gradient" x1="0" x2="0.9" y1="0" y2="1">
          <stop offset="0%" stopColor="#b9a6e8" />
          <stop offset="100%" stopColor="#7b68b3" />
        </linearGradient>
        <filter id="pip-soft-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="8" stdDeviation="5" floodColor="#05040d" floodOpacity="0.28" />
        </filter>
      </defs>

      <ellipse cx="132" cy="274" rx="75" ry="12" fill="#080611" opacity="0.35" />
      <g filter="url(#pip-soft-shadow)">
        {/* Tiny engineer body and collar */}
        <path d="M63 240 Q72 206 101 204 L159 204 Q188 210 198 244 L188 270 Q131 291 73 270 Z" fill="url(#pip-onesie-gradient)" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />
        <path d="M100 207 L130 229 L160 207" fill="#fff7ef" stroke="#171126" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="130" cy="249" r="5" fill="#f5d98d" />
        <circle cx="130" cy="264" r="4" fill="#f5d98d" />

        {/* Skull-shaped baby head */}
        <path d="M64 128 C64 82 93 55 130 55 C168 55 196 84 196 129 L194 164 C193 187 176 205 154 211 L147 226 L112 226 L105 211 C82 205 66 187 65 165 Z" fill="#fff7ef" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />

        {/* Bonnet and its floppy rim */}
        <path d="M51 119 C40 85 57 43 92 32 C126 17 166 29 185 58 C196 74 201 92 198 118 C173 101 148 94 123 96 C98 97 73 107 51 119 Z" fill="url(#pip-bonnet-gradient)" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />
        <path d="M51 117 C79 98 104 91 128 92 C154 92 177 101 198 118 C179 131 162 133 143 128 C111 119 82 124 51 117 Z" fill="#e8b7ca" stroke="#171126" strokeWidth="5" strokeLinejoin="round" />
        <path d="M75 56 C91 42 109 38 127 40" fill="none" stroke="#fff7ef" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
        <path d="M168 45 Q193 28 204 46 Q212 63 190 71 L174 67 Q190 58 168 45 Z" fill="#f5d98d" stroke="#171126" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="179" cy="49" r="4" fill="#171126" />

        {/* Eye sockets / expression changes */}
        {isSleepy ? (
          <>
            <path className="pip-eye" d="M83 145 Q98 134 112 145" fill="none" stroke="#30223b" strokeWidth="7" strokeLinecap="round" />
            <path className="pip-eye" d="M148 145 Q163 134 177 145" fill="none" stroke="#30223b" strokeWidth="7" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse className="pip-eye" cx="98" cy="145" rx={isDelighted ? "17" : "15"} ry={isDelighted ? "20" : "18"} fill="#30223b" />
            <ellipse className="pip-eye" cx="162" cy="145" rx={isDelighted ? "17" : "15"} ry={isDelighted ? "20" : "18"} fill="#30223b" />
            <circle className="pip-eye" cx="103" cy="139" r="5" fill="#fff7ef" />
            <circle className="pip-eye" cx="167" cy="139" r="5" fill="#fff7ef" />
          </>
        )}
        <path d="M123 151 L130 163 L137 151 Z" fill="#30223b" />
        <ellipse cx="79" cy="166" rx="10" ry="5" fill="#e8b7ca" opacity="0.85" />
        <ellipse cx="181" cy="166" rx="10" ry="5" fill="#e8b7ca" opacity="0.85" />

        {/* Baby's tiny toothy grin */}
        {isSleepy ? (
          <path d="M108 182 Q130 190 152 182" fill="none" stroke="#30223b" strokeWidth="5" strokeLinecap="round" />
        ) : (
          <>
            <path d="M105 178 Q130 201 155 178 Q153 197 130 198 Q108 196 105 178 Z" fill="#30223b" stroke="#171126" strokeWidth="3" strokeLinejoin="round" />
            <path d="M116 184 L116 191 M127 187 L127 195 M139 186 L139 194" stroke="#fff7ef" strokeWidth="3" strokeLinecap="round" />
          </>
        )}
      </g>

      <g fill="#f5d98d" stroke="#171126" strokeWidth="2" strokeLinejoin="round">
        <path d="M34 151 L39 162 L51 164 L42 172 L44 184 L34 178 L24 184 L26 172 L17 164 L29 162 Z" />
        <path d="M220 111 L224 120 L234 122 L226 129 L228 139 L220 134 L211 139 L213 129 L206 122 L216 120 Z" />
      </g>
    </svg>
  );
}

export default SkullBabyAvatar;
