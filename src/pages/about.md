---
layout: ../layouts/TextLayout.astro
title: About ReallySimpleRoster
description: A permissive license that allows for free use, modification, and distribution
---

<img src="/logo.svg" alt="Logo" className="h-48 hover:animate-bounce " />


An experimental simple rostering tool running purely in the browser and built using only AI Prompting in [Cursor IDE](https://cursor.com) using [Claude Sonnet 3.5](https://claude.ai).


## Tech

* [Astro 5](https://astro.build) compiling to a static site of less than 1MB, no server-side rendering.
* [React](https://react.dev) components for UI
* [ShadCN](https://ui.shadcn.com) design system
* [TailwindCSS](https://tailwindcss.com)
* [Lucide](https://lucide.dev) icons
* Hosted on [Cloudflare Pages](https://pages.cloudflare.com/)

* Public Holidays retrieved via API from  [data.gov.sg](https://data.gov.sg/collections/691/view).
* Logos and Images created using [Recraft](https://replicate.com/recraft-ai/recraft-v3-svg?)


### Data handling

* Data (Staff Initials and Holiday API cache) is stored in the user's browser local storage.
* Rosters and preferences are saved to local storage, however removing staff will invalidate the saved roster.
* Does not process, store or transmit user personal data to third parties and is built fully compliant with GDPR and PDPA.


## Author

<img src="/audrey.jpg" className="w-32 h-32 rounded-full aspect-square" /> [Audrey Kon](https://audrey.kon.sg) is a health care professional, innovator and software developer with a deep passion for using technology to remove barriers.

Some of her previous projects include

  *  [RemediSG](https://www.remedisg.com), a healthcare platform that uses AI to help patients manage their health, a winning project of the BuildForGood 2024 Hackathon [featured](https://www.pmo.gov.sg/Newsroom/PM-Lawrence-Wong-at-the-Launch-of-Smart-Nation) during the Prime Minister's launch of Singapore's SmartNation 2.0 initative.
  *  [TechLadies](https://techladies.co/), a community that supports women in tech - Website maintainer and community manager.
  *  [The Cult of Bak Chor Mee](https://www.facebook.com/bcmisawesome/), a facebook community for Bak Chor Mee lovers.





## MIT License

Copyright ReallySimpleRoster (c) 2024 Audrey Kon https://audrey.kon.sg

Copyright Astro Template (c) 2024 Agent C https://agentc.app

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.