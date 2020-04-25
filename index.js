addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/********************************************* Worker Request Handler Code Starts *********************************************/

/**
 * Constants used in the script
 */
const CONSTANTS = {
  VARIANTS_URL: 'https://cfw-takehome.developers.workers.dev/api/variants',
  CUSTOM_TITLE: 'Vishal Sood\'s CloudFlare Worker',
  CUSTOM_DATA: [
    {
      heading: 'Vishal\'s LinkedIn Profile',
      description: 'Visit Vishal Sood\'s LinkedIn profile!',
      urlText: 'Go To LinkedIn',
      urlHref: 'https://www.linkedin.com/in/vishal-sood'
    },
    {
      heading: 'Vishal\'s Resume',
      description: 'See Vishal Sood\'s Resume!',
      urlText: 'Go To Resume',
      urlHref: 'https://resume.creddle.io/resume/50kmnubhksy'
    },
  ],
  COOKIE_NAME: 'CLOUDFLARE_WORKER_VARIANT_CONTROL'
};

/**
 * Fetches all variants from the API provided for fetching variants
 * 
 * @returns {string[]} list of variants fetched
 */
async function fetchAllVariants() {
  const variantsResponse = await fetch(CONSTANTS.VARIANTS_URL).then(res => res.json());
  return variantsResponse.variants;
}

/**
 * Tries to extract and return value of previously selected variant from cookies in the `request`
 * 
 * @param {Request} request request to be used to find the cookie
 * @returns {boolean | number} index of previously selected variant extracted from cookie; `false`, if not found
 */
function getVariantFromCookie(request) {
  const cookies = request.headers.get('cookie');
  let variantCookie, previouslySelectedVariant = false;
  const variantCookieRegex = new RegExp(`${CONSTANTS.COOKIE_NAME}=(\\d+)`);
  if (cookies && (variantCookie = cookies.match(variantCookieRegex))) {
    previouslySelectedVariant = variantCookie.length > 1 && variantCookie[1];
  }

  return previouslySelectedVariant;
}

/**
 * Re-write response using the custom data provided
 * 
 * @param {Response} response response to re-write
 * @param {{ heading: string, description: string, urlText: string, urlHref: string }} customData custom data to use to re-write the response
 * @returns {Response} re-written response
 */
function rewriteResponse(response, customData) {
  return new HTMLRewriter()
    .on('title', {
      element(element) {
        element.setInnerContent(CONSTANTS.CUSTOM_TITLE);
      },
    })
    .on('h1#title', {
      element(element) {
        element.setInnerContent(customData.heading);
      },
    })
    .on('p#description', {
      element(element) {
        element.setInnerContent(customData.description);
      },
    })
    .on('a#url', {
      element(element) {
        element.setAttribute('href', customData.urlHref);
        element.setInnerContent(customData.urlText);
      },
    })
    .transform(response);
}

/**
 * Main handler for the script - contains all the logic
 * 
 * @param {Request} request 
 */
async function handleRequest(request) {
  const variants = await fetchAllVariants();

  const previouslySelectedVariant = getVariantFromCookie(request);
  const selectedVariant = previouslySelectedVariant ?
    Number(previouslySelectedVariant) :
    Math.floor(Math.random() * variants.length);

  const variantResponse = await fetch(variants[selectedVariant]);
  const customData = CONSTANTS.CUSTOM_DATA[selectedVariant % CONSTANTS.CUSTOM_DATA.length];
  const response = rewriteResponse(variantResponse, customData);
  
  // set a cookie only if a previous variant wasn't found in the cookies present in the request
  if (!previouslySelectedVariant) {
    response.headers.append('Set-Cookie', `${CONSTANTS.COOKIE_NAME}=${selectedVariant}; path=/`);
  }
  return response;
}
