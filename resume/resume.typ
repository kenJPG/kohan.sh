#import "@preview/basic-resume:0.2.9": *

// Paper size is switched at compile time so one source produces both outputs:
//   typst compile resume/resume.typ --input paper=a4        public/kenneth-chen-ko-han-resume.pdf
//   typst compile resume/resume.typ --input paper=us-letter public/kenneth-chen-ko-han-resume-letter.pdf
#let paper-size = sys.inputs.at("paper", default: "a4")

// 9pt, not the template's 10pt default: US Letter is ~50pt shorter than A4,
// and this is the largest size at which BOTH land on exactly one page with the
// current content. Kept identical across paper sizes so the two PDFs differ
// only in page dimensions. If you add content, run `pnpm resume:check` — it
// fails the build rather than letting a two-page resume ship.
#let body-font-size = 9pt

#let name = "Kenneth Chen Ko Han"
#let location = "Singapore"
#let email = "kenneth.chen1337@gmail.com"
#let github = "github.com/kenJPG"
#let linkedin = "linkedin.com/in/kenneth-chen-ko-han"
#let phone = "+65 9735 9296"
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

// ============================================================================
// Dates, award years and bullet detail are taken from Resume_v3 (2025).
// Do not invent values for anything still marked TODO below.
//
//  [ ] Resumify URL (or delete the url: argument entirely).
//  [ ] ATC-ASR: the actual WER figure and the previous SOTA it beat.
//      "State-of-the-art" without a number is the weakest form of the claim.
//  [ ] Confirm ACL 2025 Main Conference vs. Findings, then fix the venue line.
//  [ ] Confirm exact product names/casing of the agentic tools in Resumify.
//  [ ] SP Scholarship year — assumed the 2021 intake, not stated on Resume_v3.
//
// CUT FOR SPACE from Resume_v3, all real, restore by trading something out:
//  - Extracurriculars: Founder of the SP Competitive Programming Interest
//    Group and VP of the AI Club (both 2022).
//  - Competitions: Hackomania 2024 (top 5%), DSTA BrainHack CODE EXP 2024
//    (finalist), ASEAN Data Science Explorers 2024 (2nd in Singapore),
//    Reply CodeTeen 2023 (92nd/1,400), GovTech GeekOut 2022 (1st/10).
//  - RAiD: Microsoft internal hackathon on multi-agent research systems, and
//    supervising technical decisions on the RSAF video analytics platform
//    alongside NUS graduate students and NCS engineers.
//  - SP: 14 distinctions. SP Scholarship (NUS Merit Scholarship is kept, but
//    under Education rather than duplicated here).
// ============================================================================

== Education

#edu(
  institution: "National University of Singapore",
  location: "Singapore",
  dates: "Aug 2026 - May 2030",
  degree: "B.Comp. in Computer Science (NUS College), Minor in Mathematics",
  gpa: "",
)
- NUS Merit Scholarship.

#edu(
  institution: "Singapore Polytechnic",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2021", end-date: "Apr 2024"),
  degree: "Diploma in Applied AI and Analytics",
  gpa: "4.0/4.0",
)

== Work Experience

#work(
  company: "RAiD, Republic of Singapore Air Force",
  title: "AI Engineer (Volunteer)",
  location: "Singapore",
  dates: dates-helper(start-date: "Oct 2023", end-date: "Present"),
)
- Implemented speech recognition and speaker diarization for Air Traffic Control using NVIDIA NeMo and vLLM, fine-tuning Qwen3, parakeet-tdt, canary-1b and NGPU-LM on H200 GPUs.
- Shipped real-time transcription with edge-deployed LLMs for air traffic controllers; presented to the Chief of Air Force.

#work(
  company: "Bifrost AI",
  title: "AI Intern",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2024", end-date: "Jun 2024"),
)
- Trained YOLOv6-lite for mobile tank detection for ST Engineering's Unmanned Vehicles Team; hyper-parameter optimisation for incremental learning lifted accuracy 16%+.
- Fine-tuned a StabilityAI VAE to improve text and high-frequency reconstruction for synthetic-to-real domain adaptation.
- Prototyped a zero-shot method using JinaCLIP to visualise missing data for NASA, BigBear AI and DSTA.

#work(
  company: "GovTech Singapore",
  title: "AI Engineer Intern, Video Analytics (Data Science and AI Division)",
  location: "Singapore",
  dates: dates-helper(start-date: "Apr 2023", end-date: "Mar 2024"),
)
- Lead AI engineer on an end-to-end CV pipeline for MSO's OneService App, classifying thousands of daily municipal reports via zero-shot ensembles.
- Built real-time animal welfare detection with OWLv2 for NParks; the pitch secured funding from the NParks executive board.
- Red-teamed GovTech's AI Image Detector with custom-trained LoRAs simulating locally contextualised deepfakes.

== Projects

#project(
  name: "Resumify",
  url: "TODO-url",
  dates: dates-helper(start-date: "Nov 2023", end-date: "Present"),
)
- Co-founder and AI Lead of a non-profit built with YellowRibbon.gov.sg, HTX, and the Singapore Prison Service; an AI platform helping ex-inmates craft resumes for job placement.
- Secured a \$24,100 grant from the National Youth Council and signed a 12-month MOU with YellowRibbon; featured in Zao Bao.
- Built the platform on Next.js with LLM agents, the OpenAI API and ElevenLabs, developed using agentic tooling: Claude Code, Codex, OpenCode, Ralph loop, Oh My Open Agent, Semble Search and Hermes.

#project(
  name: "ATC-ASR: fine-tuned parakeet-tdt",
  url: "huggingface.co/qenneth",
  dates: "2025",
)
- Holds state-of-the-art Word Error Rate on the ATC-ASR benchmark with a fine-tuned parakeet-tdt-0.6b-v3.

== Publications

#generic-one-by-two(
  left: [*Crowdsource, Crawl, or Generate? Creating SEA-VL, a Multicultural Vision-Language Dataset for Southeast Asia*],
  right: "ACL 2025",
)
- Co-author (bylined "Kenneth Ko Han Chen") on a 100+ author SEACrowd collaboration; annotated Myanmar-specific imagery and contributed to paper writing.

== Awards and Competitions

// NOTE: the blank lines between these are load-bearing. Without a paragraph
// break, consecutive generic-one-by-two calls reflow into a single run-on
// paragraph instead of one line per award.
#generic-one-by-two(
  left: [*Lee Kuan Yew Award for Mathematics & Science* -- top graduate of cohort, Singapore Polytechnic],
  right: "2024",
)

#generic-one-by-two(
  left: [*IMDA Gold Medal* -- top student in the diploma, Singapore Polytechnic],
  right: "2024",
)

#generic-one-by-two(
  left: [*TCS CodeVita S10* -- 8th of 100,000+ students globally; 17th of 30 at the Grand Finale, Hyderabad],
  right: "2023",
)

#generic-one-by-two(
  left: [*USA Computing Olympiad* -- Gold Division],
  right: "2025",
)

== Skills

*Languages*: Python, C++, JavaScript, SQL \
*AI/ML*: PyTorch, NVIDIA NeMo, OpenCV, YOLO, Grounding DINO, Transformers, LLM agents, LoRA, VAEs \
*Web and Infra*: Next.js, React, Docker, AWS Lambda, GCP, NVIDIA CUDA, MLOps, Git
