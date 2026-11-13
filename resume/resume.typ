// Kenneth Chen Ko Han — Resume (self-contained, no external packages)
// Font: New Computer Modern (bundled with Typst). Paper: A4.

#set document(title: "Kenneth Chen Ko Han — Resume", author: "Kenneth Chen Ko Han")
#set page(paper: "a4", margin: (x: 0.5in, y: 0.5in))
#set text(font: "New Computer Modern", size: 8pt, lang: "en", ligatures: false)
#set par(justify: true, spacing: 0.65em)
#set list(marker: [•], indent: 0pt, body-indent: 0.5em)
#set block(spacing: 0.65em)
// Name, section headings and links use #26282b; body text and rules are pure black (matches the original).
#let ink = rgb("#26282b")
#show link: set text(fill: ink)
#show link: underline

// The phone number is a build input on purpose. The public PDF is compiled
// without --input phone, so it ships the placeholder and never the real number;
// the real number only ever appears after the browser decrypts the contact blob
// at kohan.sh/generate. See scripts/encrypt-contact.mjs.
#let phone = sys.inputs.at("phone", default: "+65 XXXX XXXX")

// ---------- helpers ----------
// Em dash in date ranges is set in math mode: the original PDF draws it with NewCM Math, not NewCM10.
#let dash = $dash.em$

#let section(title, first: false) = {
  v(if first { 0.66em } else { 0.54em })
  text(size: 1.2em, weight: "bold", fill: ink, smallcaps(title))
  v(-0.46em)
  line(length: 100%)
  v(0.1em)
}

#let row(l, r) = block(width: 100%)[#l #h(1fr) #r]

// head/date on line 1, sub/loc on line 2, bullets below.
// (No wrapping block: keeps list paragraphs in the page flow so justification matches the original.)
#let entry(head, date, sub, loc, body, italic-sub: false) = {
  row(strong(head), date)
  row(if italic-sub { emph(sub) } else { sub }, emph(loc))
  body
  v(0.25em)
}

// ---------- header ----------
#text(size: 20pt, weight: "bold", fill: ink, "Kenneth Chen Ko Han")
#v(-0.28572pt)
#text(size: 8pt, (
  phone,
  "Singapore",
  link("mailto:kenneth.chen1337@gmail.com")[kenneth.chen1337\@gmail.com],
  link("https://github.com/kenJPG")[github.com/kenJPG],
  link("https://linkedin.com/in/kenneth-chen-ko-han")[linkedin.com/in/kenneth-chen-ko-han],
  link("https://kohan.sh")[kohan.sh],
).join("  |  "))

// ---------- education ----------
#section("Education", first: true)

#entry("National University of Singapore", [Aug 2026 #dash May 2029],
  "B.Comp. in Computer Science (NUS College), Minor in Mathematics", "Singapore", italic-sub: true)[
  - *NUS Merit Scholarship* – awarded to high-calibre freshmen on academic results, leadership qualities and co-curricular record.
]

#entry("Singapore Polytechnic", [Apr 2021 #dash Apr 2024],
  "Diploma in Applied AI and Analytics, CGPA: 4.0/4.0", "Singapore", italic-sub: true)[
  - *Lee Kuan Yew Award for Mathematics & Science* – top tech graduate, *IMDA Gold Medal* – top all-around achiever, *SP Scholarship*.
  - Coursework: Deep Learning, Machine Learning, Reinforcement Learning, Full-Stack Development, DevOps, Data Analytics, Data Engineering and Visualisation.
]

// ---------- work experience ----------
#section("Work Experience")

#entry("Team Lead", [Oct 2026 #dash Present], "NUS College Club", "Singapore")[
  - Led a team of 3 engineers and 1 PM to ship the NUS College end-of-semester dinner ticketing system (#link("https://ticket.nusc.club")[ticket.nusc.club]) for 900+ attendees.
  - Built QR-code check-in with atomic updates and encryption of student data.
  - Ensured compliance with NUS data privacy policy, making the case to NUS College administration on the system's security and reliability.
]

#entry("Co-founder and AI Lead", [Nov 2023 #dash Aug 2026], "Resumify", "Singapore")[
  - Non-profit built with YellowRibbon.gov.sg, HTX and the Singapore Prison Service (#link("https://resumify.org")[resumify.org]); AI-powered resume services delivered to 600+ users.
  - Awarded SGD 24,000 in funding by the National Youth Council; signed a 12-month MOU with YellowRibbon; featured in The Business Times and #link("https://www.zaobao.com.sg/realtime/singapore/story20250729-7237751")[Lianhe Zaobao].
  - Collaborated with SPD (Society for the Physically Disabled); hosted a sharing session to train career facilitators on using the platform.
  - Stack: Next.js, LLM agents, OpenAI API, ElevenLabs, Vercel, Render, Supabase, SQL. Developed with OpenCode and Semble Search.
]

#entry("AI Engineer (Volunteer)", [Oct 2023 #dash Jun 2026], "Republic of Singapore Air Force (RAiD)", "Singapore")[
  - Built the full-stack system that analyses Air Traffic Control situations: an NVIDIA NeMo speech recognition and speaker diarisation layer (fine-tuned parakeet-tdt, canary-1b and NGPU-LM) feeding a Qwen3 reasoning layer served with vLLM.
  - Deployed it to edge devices for real-time transcription in the control room; presented to the Chief of Air Force.
  - Built an LLM-powered internal search tool at a RAiD hackathon hosted at Microsoft's office.
]

#entry("AI Intern", [Apr 2024 #dash Jun 2024], "Bifrost AI", "Singapore")[
  - Series A startup building synthetic data solutions for AI companies, backed by Sequoia Capital.
  - Trained YOLOv6-lite for military tank detection with ST Engineering's Unmanned Vehicles Team; tuning for incremental learning lifted accuracy 16%+.
  - Fine-tuned a StabilityAI VAE to improve text and high-frequency reconstruction for synthetic-to-real domain adaptation.
  - Prototyped a zero-shot method with JinaCLIP to visualise missing data for NASA, BigBear AI and DSTA.
]

#entry("AI Engineer Intern", [Apr 2023 #dash Mar 2024], "GovTech Singapore", "Singapore")[
  - Video Analytics team, Data Science and AI Division. Lead AI engineer on a computer vision pipeline for MSO's OneService App on AWS (EKS, SageMaker), classifying thousands of daily municipal reports via zero-shot ensembles.
  - Built real-time animal welfare detection for NParks with OWLv2, tuned by Bayesian optimisation (Hyperopt); the pitch secured executive-board funding.
  - Red-teamed GovTech's AI Image Detector with custom-trained LoRAs simulating locally contextualised deepfakes.
  - Prototyped a novel feature-explainability method for object detection using SegGPT and SAM.
]

// ---------- projects ----------
#section("Projects")

#row([*Air Traffic Control Automatic Speech Recognition (ATC-ASR)* (#link("https://huggingface.co/qenneth")[huggingface.co/qenneth])], [2025])
- Fine-tuned parakeet-tdt-0.6b-v3 with NVIDIA NeMo to a state-of-the-art 5.99% Word Error Rate on the Jacktol ATC-ASR test split, trained in under an hour on a single H200; 200+ Hugging Face downloads a month at peak, now averaging 70.
#v(0.25em)

// ---------- publications ----------
#section("Publications")

#block(breakable: false, below: 0.9em, {
  row(emph[Crowdsource, Crawl, or Generate? Creating SEA-VL, a Multicultural Vision-Language Dataset for Southeast Asia],
    link("https://aclanthology.org/2025.acl-long.916/")[ACL 2025])
  [
    - Co-author on a 100+ author SEACrowd collaboration; annotated Myanmar-specific imagery and contributed to the writing.
  ]
})

// ---------- awards ----------
#section("Awards and Competitions")

#block(below: 0.9em, {
  set block(spacing: 0.5em)
  row[*TCS CodeVita S10* – 8th of 100,000+ students globally; 17th of 30 at the Grand Finale, Hyderabad][2023]
  row[*USA Computing Olympiad* – Gold Division][2025]
  row[*DSTA BrainHack CODE_EXP* – finalist; built a "pocket data scientist" advising hawkers on sales and demand trends][2024]
})

// ---------- skills ----------
#section("Skills")

#block({
  set par(justify: false)
  [*Languages*: Python, C++, TypeScript, JavaScript, SQL, HTML, CSS, Bash \ ]
  [*Machine Learning*: PyTorch, Hugging Face, NVIDIA NeMo, vLLM, scikit-learn, NumPy, Pandas, OpenCV, LoRA, Hyperopt, Weights & Biases \ ]
  [*Web and Data*: Next.js, React, FastAPI, Node.js, Tailwind CSS, MySQL, MongoDB, Supabase, OpenAI API \ ]
  [*Cloud and Tooling*: AWS (EKS, SageMaker), Docker, Vercel, Render, Git, LaTeX, Typst]
})
