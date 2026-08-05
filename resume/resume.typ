#import "@preview/basic-resume:0.2.9": *

// Paper size is switched at compile time so one source produces both outputs:
//   typst compile resume/resume.typ --input paper=a4        public/kenneth-chen-ko-han-resume.pdf
//   typst compile resume/resume.typ --input paper=us-letter public/kenneth-chen-ko-han-resume-letter.pdf
#let paper-size = sys.inputs.at("paper", default: "a4")

// 8pt: the largest size at which both A4 and US Letter land on exactly one
// page with the current content. It was 8.5pt before Makeable, the BrainHack
// entry and the expanded Skills block went in. If you add content, run
// `pnpm resume:check` — it fails the build rather than letting a two-page
// resume ship.
//
// This is close to the floor. The next addition does not fit by shrinking:
// either trade something out, or accept a two-page resume.
#let body-font-size = 8pt

#let name = "Kenneth Chen Ko Han"
#let location = "Singapore"
#let email = "kenneth.chen1337@gmail.com"
#let github = "github.com/kenJPG"
#let linkedin = "linkedin.com/in/kenneth-chen-ko-han"
#let phone = sys.inputs.at("phone", default: "+65 XXXX XXXX")
#let personal-site = "kohan.sh"

#show: resume.with(
  author: name,
  location: location,
  email: email,
  github: github,
  linkedin: linkedin,
  phone: phone,
  personal-site: personal-site,
  accent-color: "#26282b",
  font: "New Computer Modern",
  paper: paper-size,
  author-position: left,
  personal-info-position: left,
  // 10pt is the template default; see body-font-size above for why this is
  // smaller and why it depends on paper size.
  font-size: body-font-size,
)

// MUST come after the `#show: resume.with(...)` line. basic-resume calls
// `set document(title: author)` internally, so setting this earlier gets
// clobbered and the browser tab reads "Kenneth Chen Ko Han" instead.
// Some ATS parsers read this field.
#set document(title: name + " — Resume", author: name)

// basic-resume leaves par.spacing at the Typst default (1.2em), which opens a
// visible band of whitespace between every block. 0.9em is the loosest value
// at which US Letter — the shorter of the two pages, so always the binding
// constraint — still lands on one page. Loosen it and `pnpm resume:check`
// fails; the font size above is the other lever.
#set par(spacing: 0.9em)

// ============================================================================
// Dates, award years and bullet detail are taken from Resume_v3 (2025).
// Do not invent values for anything still marked TODO below.
//
//  [ ] ATC-ASR: the actual WER figure and the previous SOTA it beat.
//      "State-of-the-art" without a number is the weakest form of the claim.
//  [ ] Confirm exact product names/casing of the agentic tools in Resumify.
//  [ ] SP Scholarship year — assumed the 2021 intake, not stated on Resume_v3.
//
// CUT FOR SPACE from Resume_v3, all real, restore by trading something out:
//  - Extracurriculars: Founder of the SP Competitive Programming Interest
//    Group and VP of the AI Club (both 2022).
//  - Competitions: Hackomania 2024 (top 5%), DSTA BrainHack CODE EXP 2024
//    (finalist), ASEAN Data Science Explorers 2024 (2nd in Singapore),
//    Reply CodeTeen 2023 (92nd/1,400), GovTech GeekOut 2022 (1st/10).
//  - RAiD: supervising technical decisions on the RSAF video analytics
//    platform alongside NUS graduate students and NCS engineers.
//  - SP: 14 distinctions. (NUS Merit Scholarship is kept, but under Education
//    rather than duplicated here.)
// ============================================================================

== Education

// `consistent: true` puts the dates top-right and the location bottom-right,
// which is the order #work uses. Without it the template flips them for
// Education only, so dates read roman-on-line-one under Work Experience and
// italic-on-line-two under Education - the same field, styled two ways.
// dates-helper, not a literal string: it emits an em dash, so this range
// matches every other date range on the page instead of using a hyphen.
#edu(
  institution: "National University of Singapore",
  location: "Singapore",
  dates: dates-helper(start-date: "Aug 2026", end-date: "May 2029"),
  degree: "B.Comp. in Computer Science (NUS College), Minor in Mathematics",
  gpa: "",
  consistent: true,
)
- *NUS Merit Scholarship* -- awarded to high-calibre freshmen on academic results, leadership qualities and co-curricular record.

// basic-resume's #edu accepts a `gpa` argument and then never renders it -
// neither branch of the function references it. The CGPA has to ride along in
// the degree string to appear at all.
#edu(
  institution: "Singapore Polytechnic",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2021", end-date: "Apr 2024"),
  degree: "Diploma in Applied AI and Analytics, CGPA: 4.0/4.0",
  gpa: "4.0/4.0",
  consistent: true,
)
- *Lee Kuan Yew Award for Mathematics & Science* -- top tech graduate, *IMDA Gold Medal* -- top all-around achiever, *SP Scholarship*.
- Coursework: Deep Learning, Machine Learning, Reinforcement Learning, Full-Stack Development, DevOps, Data Analytics, Data Engineering and Visualisation.

== Work Experience

// Title is a judgement call - "technical recruiter" is wrong (he designs and
// runs the assessment, he does not source candidates). "Technical Interviewer"
// is the plainest accurate reading and parses cleanly for ATS.
#work(
  company: "Makeable.build",
  title: "Technical Interviewer",
  location: "San Francisco, US (Remote)",
  dates: dates-helper(start-date: "Jul 2026", end-date: "Present"),
)
- San Francisco startup backed by Afore Capital, with \$250K in pre-seed funding.
- Designed and run the technical interview loop, assessing the engineering candidates the founders shortlist.

// Under Work Experience, not Projects. ATS parsers build employment history
// from this section and either drop a Projects entry or file it somewhere the
// company's portal never reads, so a co-founded org with a title, dates and a
// funded track record was being thrown away at exactly the moment it counted.
// `company` is kept plain - the resumify.org link rides in the first bullet
// rather than in the company field, where a parenthetical would end up inside
// the parsed employer name.
#work(
  company: "Resumify",
  title: "Co-founder and AI Lead",
  location: "Singapore",
  dates: dates-helper(start-date: "Nov 2023", end-date: "Present"),
)
- Non-profit built with YellowRibbon.gov.sg, HTX and the Singapore Prison Service (#link("https://resumify.org")[resumify.org]); AI-powered resume services now delivered to 600+ users.
- Awarded SGD 24,000 in funding by the National Youth Council; signed a 12-month MOU with YellowRibbon; featured in The Business Times and #link("https://www.zaobao.com.sg/realtime/singapore/story20250729-7237751")[Lianhe Zaobao].
- Collaborating with SPD (Society for the Physically Disabled); hosted a sharing session to train career facilitators on using the platform.
- Stack: Next.js, LLM agents, OpenAI API, ElevenLabs, Vercel, Render, Supabase, SQL. Developed with agentic tooling: OpenCode, Ralph loop, oh-my-openagent and Semble Search.

#work(
  // Parenthesised, not comma-separated: parsers commonly split an employer
  // field on the comma, which would drop "RAiD" entirely. Inside brackets it
  // survives as part of the one company string.
  company: "Republic of Singapore Air Force (RAiD)",
  title: "AI Engineer (Volunteer)",
  location: "Singapore",
  dates: dates-helper(start-date: "Oct 2023", end-date: "Jun 2026"),
)
- Built the full-stack system that analyses Air Traffic Control situations: an NVIDIA NeMo speech recognition and speaker diarisation layer (fine-tuned parakeet-tdt, canary-1b and NGPU-LM) feeding a Qwen3 reasoning layer served with vLLM.
- Deployed it to edge devices for real-time transcription in the control room; presented to the Chief of Air Force.
- Built an LLM-powered internal search tool at a RAiD hackathon hosted at Microsoft's office.

#work(
  company: "Bifrost AI",
  title: "AI Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2024", end-date: "Jun 2024"),
)
- Series A startup building synthetic data solutions for AI companies, backed by Sequoia Capital.
- Trained YOLOv6-lite for military tank detection with ST Engineering's Unmanned Vehicles Team; tuning for incremental learning lifted accuracy 16%+.
- Fine-tuned a StabilityAI VAE to improve text and high-frequency reconstruction for synthetic-to-real domain adaptation.
- Prototyped a zero-shot method with JinaCLIP to visualise missing data for NASA, BigBear AI and DSTA.

// Employer field kept to the company alone - three comma-separated parts read
// as one employer name to a human, but a parser splitting on commas produces
// nonsense. The team sits in a bullet, the same way the company-context lines
// work for Makeable and Bifrost.
#work(
  company: "GovTech Singapore",
  title: "AI Engineer Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2023", end-date: "Mar 2024"),
)
- Video Analytics team, Data Science and AI Division. Lead AI engineer on a computer vision pipeline for MSO's OneService App on AWS (EKS, SageMaker), classifying thousands of daily municipal reports via zero-shot ensembles.
- Built real-time animal welfare detection for NParks with OWLv2, tuned by Bayesian optimisation (Hyperopt); the pitch secured executive-board funding.
- Red-teamed GovTech's AI Image Detector with custom-trained LoRAs simulating locally contextualised deepfakes.
- Prototyped a novel feature-explainability method for object detection using SegGPT and SAM.

== Projects

// "ATC-ASR" on its own means nothing outside the niche, so the first mention
// is spelled out and the acronym is introduced after it.
#project(
  name: "Air Traffic Control Automatic Speech Recognition (ATC-ASR)",
  url: "huggingface.co/qenneth",
  dates: "2025",
)
- Fine-tuned parakeet-tdt-0.6b-v3 with NVIDIA NeMo to a state-of-the-art 5.99% Word Error Rate on the Jacktol ATC-ASR test split, trained in under an hour on a single H200; 200+ Hugging Face downloads a month at peak, now averaging 70.

== Publications

// Italic, not bold: paper titles are conventionally italicised, and a bold
// run this long outweighed every job title on the page. The venue on the
// right is the signal a reader is actually scanning for.
// Verified against aclanthology.org/2025.acl-long.916: Main Conference,
// Volume 1 (Long Papers), not Findings. The BibTeX byline is
// "Han, Kenneth Chen Ko" - the same name as the header, so there is no
// name mismatch to explain away.
#generic-one-by-two(
  left: [_Crowdsource, Crawl, or Generate? Creating SEA-VL, a Multicultural Vision-Language Dataset for Southeast Asia_],
  right: link("https://aclanthology.org/2025.acl-long.916/")[ACL 2025],
)
- Co-author on a 100+ author SEACrowd collaboration; annotated Myanmar-specific imagery and contributed to the writing.

== Awards and Competitions

// NOTE: the blank lines between these are load-bearing. Without a paragraph
// break, consecutive generic-one-by-two calls reflow into a single run-on
// paragraph instead of one line per award. The `set par` tightens the gap
// those breaks would otherwise open up - the default was eating a visible
// band of whitespace for a two-line section.
//
// The two Singapore Polytechnic awards (Lee Kuan Yew Award, IMDA Gold Medal)
// live under Education instead, to save the vertical space.
#[
  #set par(spacing: 0.5em)

  #generic-one-by-two(
    left: [*TCS CodeVita S10* -- 8th of 100,000+ students globally; 17th of 30 at the Grand Finale, Hyderabad],
    right: "2023",
  )

  #generic-one-by-two(
    left: [*USA Computing Olympiad* -- Gold Division],
    right: "2025",
  )

  // BrainHack runs CODE_EXP (the hackathon) and TIL-AI (the AI challenge) as
  // separate activities. The hawker analytics build was CODE_EXP, so that is
  // the name here - not TIL. The underscore looks doubled on screen; that is
  // New Computer Modern's bold underscore glyph, and it extracts as one
  // character, which is what an ATS reads.
  #generic-one-by-two(
    left: [*DSTA BrainHack CODE_EXP* -- finalist; built a "pocket data scientist" advising hawkers on sales and demand trends],
    right: "2024",
  )
]

== Skills

// Deliberately repeats tools already named in the bullets above. Many ATS
// parsers lift this section into a structured skills field and match against
// that, so a keyword that appears only in prose can be missed entirely.
*Languages*: Python, C++, TypeScript, JavaScript, SQL, HTML, CSS, Bash \
*Machine Learning*: PyTorch, Hugging Face, NVIDIA NeMo, vLLM, scikit-learn, NumPy, Pandas, OpenCV, LoRA, Hyperopt, Weights & Biases \
*Web and Data*: Next.js, React, FastAPI, Node.js, Tailwind CSS, MySQL, MongoDB, Supabase, OpenAI API \
*Cloud and Tooling*: AWS (EKS, SageMaker), Docker, Vercel, Render, Git, LaTeX, Typst
