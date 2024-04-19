/**
 * Example of Cloud Flare worker injecting Consent Banner
 * with Google Consent Mode compatible code
 */
addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) => new Response(err.stack, { status: 500 })
        )
    );
});

class HeadHandler {
    element(element) {
        element.prepend(`
            <link rel="stylesheet" href="https://public-assets.tagconcierge.com/cookies-banner-js/1.1.0/styles/light.css" />
            <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            // Set default consent to 'denied' as a placeholder
            // Determine actual values based on your own requirements
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
            try {
                var consentPreferences = JSON.parse(localStorage.getItem('consent_preferences'));
                if (consentPreferences !== null) {
                   gtag('consent', 'update', consentPreferences);
                }
              } catch (error) {}
            </script>`, { html: true });
    }
}


class BodyHandler {
    element(element) {
        element.append(`
            <script src="https://public-assets.tagconcierge.com/cookies-banner-js/1.1.0/consent-banner.min.js"></script>
            <script>
                var config = {
                    display: {
                        mode: "bar"
                    },
                    consent_types: [{
                        name: 'analytics_storage',
                        title: "Analytics storage",
                        description: 'These cookies help us understand how visitors interact with our website. Measure and analyze traffic to improve our service.',
                        default: 'denied'
                    }, {
                        name: "ad_storage",
                        title: "Ads storage",
                        description: "These cookies help us run ads conversion tracking.",
                        default: 'denied'
                    }, {
                        name: 'ad_user_data',
                        title: "User Data",
                        description: 'These cookies helps us optimise advertising campaigns by sharing some of the user data with 3rd party services',
                        default: 'denied'
                    }, {
                        name: 'ad_personalization',
                        title: "Personalization",
                        description: 'These cookies allows us to personalise ads',
                        default: 'denied'
                    }],
                    settings: {
                        title: "Cookies Settings",
                        description: "We use cookies to improve user experience. Choose what cookie categories you allow us to use. You can read more about our [Privacy Policy](/privacy-policy)",
                        buttons: {
                            save: "Save preferences",
                            close: "Close"
                        }
                    },
                    modal: {
                        title: 'Cookies',
                        description: 'We are using various cookies files. Learn more in our [privacy policy](/privacy-policy) and make your choice.',
                        buttons: {
                            accept: 'Accept',
                            settings: 'Settings'
                        }
                    }
                };
              cookiesBannerJs(
                function() {
                  try {
                    return JSON.parse(localStorage.getItem('consent_preferences'));
                  } catch (error) {
                    return null;
                  }
                },
                function(consentState) {
                  gtag('consent', 'update', consentState);
                  localStorage.setItem('consent_preferences', JSON.stringify(consentState));
                },
                config
              );
            </script>`, { html: true });
    }
}

async function handleRequest(request) {

    const url = new URL(request.url)
    const res = await fetch(request)

    return new HTMLRewriter()
      .on("head", new HeadHandler())
      .on("body", new BodyHandler())
      .transform(res)
}
