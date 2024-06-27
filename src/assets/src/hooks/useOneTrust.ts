import { GA4 } from 'react-ga4/types/ga4';

declare global {
    interface Window {
      OnetrustActiveGroups?: string;
      OptanonWrapper?: () => void;
    }
  }

export const useOneTrust = (): [(googleAnalytics:GA4) => void] => {

    const initializeOneTrust = (googleAnalytics: GA4) => {
        console.log("OT initializing ")
        const updateGtagCallback = () => {
            if (!window.OnetrustActiveGroups) {
              console.log("OT CALLBACK, no active groups")
                return;
            }
            if (window.OnetrustActiveGroups.includes("C0002")) {
                googleAnalytics.gtag("consent", "update", { analytics_storage: "granted" });
              }
              if (window.OnetrustActiveGroups.includes("C0003")) {
                googleAnalytics.gtag("consent", "update", { functional_storage: "granted" });
              }
              if (window.OnetrustActiveGroups.includes("C0004")) {
                googleAnalytics.gtag("consent", "update", {
                  ad_storage: "granted",
                  ad_user_data: "granted",
                  ad_personalization: "granted",
                  personalization_storage: "granted"
                });
              } else {
                console.log("OT CALLBACK remove cookies! ")
                // Remove Google Analytics cookies if tracking is declined
                document.cookie.split(';').forEach(cookie => {
                  const [name] = cookie.split('=');
                  if (name.trim().match(/^_ga(_.+)?$/)) {
                    document.cookie = `${name}=;path=/;domain=.${window.location.host.replace(/^(.*\.)?(.+\..+)$/, '$2')};expires=Thu, 01 Jan 1970 00:00:01 GMT`;
                  }
                });
              }
              // window.dataLayer.push({ event: 'um_consent_updated' });
              googleAnalytics.event({ action: 'um_consent_updated', category: 'consent' });
            }
        window.OptanonWrapper = updateGtagCallback;

        const src = 'https://cdn.cookielaw.org/consent/03e0096b-3569-4b70-8a31-918e55aa20da/otSDKStub.js'
        const dataDomainScript ='03e0096b-3569-4b70-8a31-918e55aa20da'
        const script = document.createElement('script');
        script.src = src;
        script.type = 'text/javascript';
        script.dataset.domainScript = dataDomainScript;
        document.head.appendChild(script);
    }

    return [ initializeOneTrust ];
};
