# Cloudflare Workers Full-Stack Application

This is a simple worker script which distributes requests between multiple variants fetched from a fixed URL.

It randomly chooses a variant to serve from the list of variants fetched.

It uses cookies to persist the variant for a client. So, a client after being served one of the variants will continue to see that particular variant on subsequent visits, unless the cookies aren't cleared.

The deployed worker could be accessed at: https://cf-worker.vishalsood.workers.dev

In its current state, the script is programmed to either serve a link to my Resume or my LinkedIn profile
