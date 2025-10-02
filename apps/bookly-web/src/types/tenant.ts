export interface TenantConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
  };
  logo?: {
    url?: string;
    svg?: string;
  };
  domain?: string;
}

export interface TenantColors {
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  secondary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

export const DEFAULT_TENANT_CONFIG: TenantConfig = {
  id: 'default',
  name: 'Bookly',
  colors: {
    primary: '#2563EB',
    secondary: '#14B8A6',
  },
  logo: {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500">
      <g transform="matrix(1, -0.397866, 0, -1, 0.150548, 3.22391)" style="transform-origin: 178.57px 254.625px;">
        <path d="M 182.189 227.225 C 176.54 227.451 170.883 235.771 172.007 242.2 C 173.132 248.63 180.191 248.35 184.717 241.695 C 184.717 241.695 184.717 241.695 184.718 241.694" style="stroke-width: 5px; transform-origin: 180.205px 227.467px;" fill="none" stroke="#00C2B2" stroke-linecap="round"/>
        <path d="M 181.714 268.259 C 176.065 268.485 170.408 276.805 171.532 283.234 C 172.657 289.664 179.716 289.384 184.242 282.729 C 184.242 282.729 184.242 282.729 184.243 282.728" style="stroke-width: 5px; transform-origin: 179.73px 268.501px;" fill="none" stroke="#00C2B2" stroke-linecap="round"/>
        <path d="M 182.302 306.684 C 176.653 306.91 170.996 315.23 172.12 321.659 C 173.245 328.089 180.304 327.809 184.83 321.154 C 184.83 321.154 184.83 321.154 184.831 321.153" style="stroke-width: 5px; transform-origin: 180.318px 306.926px;" fill="none" stroke="#00C2B2" stroke-linecap="round"/>
        <path d="M 182.26 202.655 C 176.611 206.924 170.954 203.106 172.078 195.782 C 173.203 188.457 180.262 183.12 184.788 186.174 C 184.788 186.174 184.788 186.174 184.789 186.174" style="stroke-width: 5px; transform-origin: 180.276px 203.992px;" fill="none" stroke="#00C2B2" stroke-linecap="round"/>
      </g>
      <rect x="185.471" y="171.295" width="128.813" height="175.584" rx="12" fill="#0276D9" stroke="#004C97" stroke-width="8" style="stroke-width: 10.169;"/>
      <rect x="185.29" y="171.349" width="128.813" height="160.625" rx="12" fill="#ffffff" stroke="#004C97" stroke-width="6" style="stroke-width: 7.627;"/>
      <text x="232.001" y="244.499" font-size="50" font-weight="bold" fill="#0077D9" font-family="Arial, sans-serif" text-anchor="middle" transform="matrix(2.10198, 0, 0, 2.493353, -244.353195, -334.467499)" style="white-space: pre;">B</text>
      <g fill="#00C2B2" transform="matrix(1.491053, 0, 0, 1.321338, 108.243073, 140.451202)">
        <rect x="70" y="110" width="10" height="10" rx="2"/>
        <rect x="85" y="110" width="10" height="10" rx="2"/>
        <rect x="100" y="110" width="10" height="10" rx="2"/>
        <rect x="70" y="125" width="10" height="10" rx="2"/>
        <rect x="85" y="125" width="10" height="10" rx="2"/>
        <rect x="100" y="125" width="10" height="10" rx="2"/>
        <rect x="114.277" y="109.907" width="10" height="10" rx="2"/>
        <rect x="114.277" y="124.907" width="10" height="10" rx="2"/>
      </g>
      <g transform="matrix(1.288132, 0, 0, 1.25417, -68.291992, -60.098358)">
        <rect x="277.869" y="212.641" width="33.496" height="30" rx="8" fill="#00C2B2"/>
        <rect x="291.204" y="212.732" width="20.331" height="30" fill="#00C2B2"/>
        <polyline points="286.365 227.641 292.365 233.641 304.365 219.641" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <rect x="177.723" width="6.732" height="5.436" style="stroke-width: 1.406; fill: rgb(0, 194, 179);" rx="2.718" ry="2.718" y="222.498"/>
      <rect x="177.723" width="6.732" height="5.436" style="stroke-width: 1.406; fill: rgb(0, 194, 179);" rx="2.718" ry="2.718" y="263.236"/>
      <rect x="177.723" width="6.732" height="5.436" style="stroke-width: 1.406; fill: rgb(0, 194, 179);" rx="2.718" ry="2.718" y="305.291"/>
      <rect x="177.723" width="6.732" height="5.436" style="stroke-width: 1.406; fill: rgb(0, 194, 179);" rx="2.718" ry="2.718" y="183.704"/>
    </svg>`,
  },
};
